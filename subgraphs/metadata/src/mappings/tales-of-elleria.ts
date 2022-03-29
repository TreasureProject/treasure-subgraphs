import { Address, Bytes, TypedMap, json } from "@graphprotocol/graph-ts";

import {
  AttributeChange,
  LevelChange,
} from "../../generated/Tales of Elleria Data/TalesOfElleria";
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

const FALLBACK_IMAGES = new TypedMap<string, string>();

FALLBACK_IMAGES.set(
  "Archer1",
  "https://ipfs.moralis.io:2053/ipfs/QmZZGVv1rHm6KQ5ng7ehT9Dd38wnSCFZD9tWFfKgRpyeMa"
);
FALLBACK_IMAGES.set(
  "Assassin1",
  "https://ipfs.moralis.io:2053/ipfs/QmVVGAmNvUgUhyLy3HPKmwbzCnRfjGrV9kjW1G6ALUZUNF"
);
FALLBACK_IMAGES.set(
  "Mage1",
  "https://ipfs.moralis.io:2053/ipfs/QmVWzYTi7pYBZcMrzoHJ82ucRxPxVyEUNPZDtjbewzhfEC"
);
FALLBACK_IMAGES.set(
  "Warrior1",
  "https://ipfs.moralis.io:2053/ipfs/QmXdUDFBCx3MfCMZK9nK3AeFayxCYi7SiKU4xz98MdMC49"
);
FALLBACK_IMAGES.set(
  "Archer2",
  "https://ipfs.moralis.io:2053/ipfs/QmSvcrDYijxrZ5Fpz97P3t2dChEnq2syNwLQ6qGZ2nDzKc"
);
FALLBACK_IMAGES.set(
  "Assassin2",
  "https://ipfs.moralis.io:2053/ipfs/Qmd66PRkYUWN78VUSzYyxmZeP4zLpC8Wroif3QNCyofvj7"
);
FALLBACK_IMAGES.set(
  "Mage2",
  "https://ipfs.moralis.io:2053/ipfs/QmQuAxvgQP9r8cuV8sJxrjA7ttZYb2UdM4JdC17PgWv29U"
);
FALLBACK_IMAGES.set(
  "Warrior2",
  "https://ipfs.moralis.io:2053/ipfs/QmbXmaaWNFx8jK9DaxGF3x4Zj9RbTaRKQF3UkhuLfQLheG"
);
FALLBACK_IMAGES.set(
  "Archer3",
  "https://ipfs.moralis.io:2053/ipfs/QmWBudHCS6wcSeJTVbHSYPddnLaBGdPJbHynwYG95Ambs3"
);
FALLBACK_IMAGES.set(
  "Assassin3",
  "https://ipfs.moralis.io:2053/ipfs/QmP8X5uSrp6D4HGCkQ7asTQAaRxsn2eVS4TcapEf5evk4f"
);
FALLBACK_IMAGES.set(
  "Mage3",
  "https://ipfs.moralis.io:2053/ipfs/QmVdphWGBK78DupEntsxDut2mks9ihitxzu21hkpQJGVQ8"
);
FALLBACK_IMAGES.set(
  "Warrior3",
  "https://ipfs.moralis.io:2053/ipfs/QmXB9VvdGXGu7gbmcKGamhJpTLYrtJFrtyeGf2YzgFHA3J"
);

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
    const metadata = tokenUri.value.split(";");
    const fallbackImage = (FALLBACK_IMAGES.get(
      `${metadata[Metadata.ClassName]}${metadata[Metadata.RarityId]}`
    ) || "") as string;
    const image = (metadata[Metadata.Image] || fallbackImage).replace(
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

export function handleAttributeChange(event: AttributeChange): void {}

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
