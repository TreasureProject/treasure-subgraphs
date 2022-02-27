import { LegionCreated } from "../../generated/Legion Metadata Store/LegionMetadataStore";
import {
  LEGION_CLASSES,
  LEGION_GENERATIONS,
  LEGION_RARITIES,
} from "../helpers/constants";
import { getLegionName, getOrCreateLegion } from "../helpers/models";

export function handleLegionCreated(event: LegionCreated): void {
  const params = event.params;

  const tokenId = params._tokenId;
  const generation = params._generation;
  const rarity = params._rarity;
  const legion = getOrCreateLegion(tokenId);
  legion.generation = LEGION_GENERATIONS[generation];
  legion.rarity = LEGION_RARITIES[rarity];
  legion.legionClass = LEGION_CLASSES[params._class];
  legion.name = getLegionName(tokenId, generation, rarity);
  legion.save();
}
