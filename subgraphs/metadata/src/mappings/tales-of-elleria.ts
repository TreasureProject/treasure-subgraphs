import {
  Address,
  Bytes,
  TypedMap,
  dataSource,
  json,
} from "@graphprotocol/graph-ts";

import { LevelChange } from "../../generated/Tales of Elleria Data/TalesOfElleria";
import { ERC721, Transfer } from "../../generated/Tales of Elleria/ERC721";
import { Collection, Token } from "../../generated/schema";
import {
  updateAttributePercentages,
  updateTokenMetadata,
} from "../helpers/metadata";
import {
  getOrCreateAttribute,
  getOrCreateCollection,
  getOrCreateToken,
} from "../helpers/models";
import { isMint } from "../helpers/utils";
import * as common from "../mapping";

const RARITY = ["Common", "Epic", "Legendary"];

const classToId = new TypedMap<string, string>();

classToId.set("Warrior", "1");
classToId.set("Assassin", "2");
classToId.set("Mage", "3");
classToId.set("Ranger", "4");

class Stat {
  constructor(public name: string, public value: string) {}
}

class Stats {
  constructor(
    public strength: Stat,
    public agility: Stat,
    public vitality: Stat,
    public endurance: Stat,
    public intelligence: Stat,
    public will: Stat
  ) {}
}

enum Metadata {
  TokenId,
  Image,
  Strength,
  Agility,
  Vitality,
  Endurance,
  Intelligence,
  Will,
  TotalAttributes,
  ClassId,
  ClassName,
  Level,
  Experience,
  TimeSummoned,
  RarityId,
}

function getMaxStats(classId: i32): Stats {
  let stats = new Stats(
    new Stat("Max Strength", "0"),
    new Stat("Max Agility", "0"),
    new Stat("Max Vitality", "0"),
    new Stat("Max Endurance", "0"),
    new Stat("Max Intelligence", "0"),
    new Stat("Max Will", "0")
  );

  switch (classId) {
    case 1: // Warrior
      stats.strength.value = "100";
      stats.agility.value = "75";
      stats.vitality.value = "90";
      stats.endurance.value = "80";
      stats.intelligence.value = "50";
      stats.will.value = "50";

      break;
    case 2: // Assassin
      stats.strength.value = "90";
      stats.agility.value = "100";
      stats.vitality.value = "75";
      stats.endurance.value = "50";
      stats.intelligence.value = "50";
      stats.will.value = "80";

      break;
    case 3: // Mage
      stats.strength.value = "50";
      stats.agility.value = "80";
      stats.vitality.value = "50";
      stats.endurance.value = "75";
      stats.intelligence.value = "100";
      stats.will.value = "90";

      break;
    case 4: // Ranger
      stats.strength.value = "100";
      stats.agility.value = "90";
      stats.vitality.value = "75";
      stats.endurance.value = "50";
      stats.intelligence.value = "50";
      stats.will.value = "80";

      break;
  }

  return stats;
}

function fetchTokenMetadata(collection: Collection, token: Token): void {
  const tokenIdString = token.tokenId.toString();

  token.name = `Hero #${tokenIdString}`;

  const contract = ERC721.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_tokenURI(token.tokenId);

  if (!tokenUri.reverted) {
    let metadata = tokenUri.value.split(";");

    if (dataSource.network() == "arbitrum-rinkeby") {
      metadata.unshift(tokenIdString);

      const className = metadata[Metadata.ClassId];
      const timeSummoned = metadata[Metadata.ClassName];
      const classId = (classToId.get(className) || "Warrior") as string;

      metadata = metadata.slice(0, -2);
      metadata = metadata.concat([
        classId,
        className,
        "1",
        "0",
        timeSummoned,
        "0",
      ]);
    }

    const image = metadata[Metadata.Image].replace(
      "https://ipfs.moralis.io:2053/ipfs",
      "ipfs://"
    );
    const class_ = new Stat("Class", metadata[Metadata.ClassName]);
    const rarity = new Stat(
      "Rarity",
      RARITY[parseInt(metadata[Metadata.RarityId]) as i32]
    );
    const level = new Stat("Level", metadata[Metadata.Level]);
    const strength = new Stat("Strength", metadata[Metadata.Strength]);
    const agility = new Stat("Agility", metadata[Metadata.Agility]);
    const vitality = new Stat("Vitality", metadata[Metadata.Vitality]);
    const endurance = new Stat("Endurance", metadata[Metadata.Endurance]);
    const intelligence = new Stat(
      "Intelligence",
      metadata[Metadata.Intelligence]
    );
    const will = new Stat("Will", metadata[Metadata.Will]);
    const max = getMaxStats(parseInt(metadata[Metadata.ClassId]) as i32);

    const attributes = [
      class_,
      rarity,
      level,
      strength,
      max.strength,
      agility,
      max.agility,
      vitality,
      max.vitality,
      endurance,
      max.endurance,
      intelligence,
      max.intelligence,
      will,
      max.will,
    ].map<string>(
      (stat) => `"trait_type": "${stat.name}", "value": "${stat.value}"`
    );

    const bytes = Bytes.fromUTF8(`
    {
      "name": "${token.name}",
      "description": "",
      "image": "${image}",
      "attributes": [{${attributes.join("},{")}}]
    }
  `);

    const data = json.fromBytes(bytes).toObject();

    if (data) {
      updateTokenMetadata(collection, token, data);
    } else {
      collection._missingMetadataTokens =
        collection._missingMetadataTokens.concat([token.id]);
    }
  }
}

export function handleTransfer(event: Transfer): void {
  const params = event.params;
  const transfer = new common.TransferEvent(
    event.address,
    params.tokenId,
    isMint(params.from),
    event.block.timestamp
  );

  common.handleTransfer(transfer, fetchTokenMetadata);
}

export function handleLevelChange(event: LevelChange): void {
  const params = event.params;
  const collection = getOrCreateCollection(event.address);
  const token = getOrCreateToken(collection, params.tokenId);
  const attribute = getOrCreateAttribute(
    collection,
    token,
    "Level",
    params.level.toString()
  );

  token.attributes = token.attributes
    .filter((attribute) => !attribute.includes("-level-"))
    .concat([attribute.id]);

  attribute.save();
  token.save();

  updateAttributePercentages(collection);
}
