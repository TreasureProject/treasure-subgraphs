import { BigInt } from "@graphprotocol/graph-ts";
import { ImbuedSoulCreate } from "../../generated/Imbued Soul/ImbuedSoul";
import { Attribute } from "../../generated/schema";
import { ATTRIBUTE_CALCULATION_UPDATE_INTERVAL } from "../helpers/constants";
import { updateAttributePercentages } from "../helpers/metadata";
import {
  getOrCreateAttribute,
  getOrCreateCollection,
  getOrCreateToken,
} from "../helpers/models";

const CLASSES = [
  "Warrior",
  "Mage",
  "Priest",
  "Sharpshooter",
  "Summoner",
  "Paladin",
  "Asura",
  "Slayer",
];

const OFFENSIVE_SKILLS = [
  "None",
  "Berserker",
  "Meteor Spawn",
  "Holy Arrow",
  "Multishot",
  "Summon Minion",
  "Thor's Hammer",
  "Mindburn",
  "Backstab",
];

const SECONDARY_SKILLS = [
  "Potion of Swiftness",
  "Potion of Recovery",
  "Potion of Gluttony",
  "Beginner Gardening Kit",
  "Intermediate Gardening Kit",
  "Expert Gardening Kit",
  "Shadow Walk",
  "Shadow Assault",
  "Shadow Overlord",
  "Spear of Fire",
  "Spear of Flame",
  "Spear of Inferno",
  "Summon Brown Bear",
  "Summon Lesser Daemon",
  "Summon Ancient Wyrm",
  "Small Housing Deed",
  "Medium Housing Deed",
  "Large Housing Deed",
  "Demonic Blast",
  "Demonic Wave",
  "Demonic Nova",
  "Radiant Blessing",
  "Divine Blessing",
  "Celestial Blessing",
];

export function handleImbuedSoulCreated(event: ImbuedSoulCreate): void {
  const params = event.params;
  const timestamp = event.block.timestamp;
  const info = params._info;
  const tokenId = params._tokenId;

  const collection = getOrCreateCollection(event.address);
  const token = getOrCreateToken(collection, tokenId);
  token.name = `Imbued Soul #${tokenId}`;

  const attributes: Attribute[] = [];

  attributes.push(
    getOrCreateAttribute(
      collection,
      token,
      "Class",
      CLASSES[info.lifeformClass]
    )
  );

  attributes.push(
    getOrCreateAttribute(
      collection,
      token,
      "Offensive Skill",
      OFFENSIVE_SKILLS[info.offensiveSkill]
    )
  );

  for (let i = 0; i < info.secondarySkills.length; i++) {
    attributes.push(
      getOrCreateAttribute(
        collection,
        token,
        "Secondary Skill",
        SECONDARY_SKILLS[info.secondarySkills[i]]
      )
    );
  }

  token.attributes = attributes.map<string>(attribute => attribute.id);

  if (
    timestamp.gt(
      collection._attributePercentageLastUpdated.plus(
        BigInt.fromI32(ATTRIBUTE_CALCULATION_UPDATE_INTERVAL)
      )
    )
  ) {
    updateAttributePercentages(collection);
    collection._attributePercentageLastUpdated = timestamp;
    collection.save();
  }

  token.save();
}
