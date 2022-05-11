import { log } from "matchstick-as";

import {
  LegionConstellationRankUp,
  LegionCreated,
} from "../../generated/Legion Metadata Store/LegionMetadataStore";
import {
  LEGION_CLASSES,
  LEGION_GENERATIONS,
  LEGION_RARITIES,
} from "../helpers/constants";
import {
  getLegionName,
  getOrCreateConstellationStat,
  getOrCreateLegion,
  getOrCreateLegionStat,
  getTimeIntervalStarlightTempleStats,
} from "../helpers/models";

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

export function handleLegionConstellationRankUp(
  event: LegionConstellationRankUp
): void {
  const params = event.params;
  const rank = params._rank;
  const tokenId = params._tokenId;

  const legion = getOrCreateLegion(tokenId);

  // True if Legion had no previous constellations
  const isFirstConstellation =
    legion.fire == 0 &&
    legion.earth == 0 &&
    legion.wind == 0 &&
    legion.water == 0 &&
    legion.light == 0 &&
    legion.dark == 0;

  // Track which constellation was upgraded
  let constellation = "";

  // Track what the previous constellation rank was
  let previousRank = 0;

  switch (params._constellation) {
    case 0:
      previousRank = legion.fire;
      legion.fire = rank;
      constellation = "Fire";
      break;
    case 1:
      previousRank = legion.earth;
      legion.earth = rank;
      constellation = "Earth";
      break;
    case 2:
      previousRank = legion.wind;
      legion.wind = rank;
      constellation = "Wind";
      break;
    case 3:
      previousRank = legion.water;
      legion.water = rank;
      constellation = "Water";
      break;
    case 4:
      previousRank = legion.light;
      legion.light = rank;
      constellation = "Light";
      break;
    case 5:
      previousRank = legion.dark;
      legion.dark = rank;
      constellation = "Dark";
      break;
    default:
      log.error("Invalid constellation {} for token {}", [
        rank.toString(),
        tokenId.toString(),
      ]);
      return;
  }

  const stats = getTimeIntervalStarlightTempleStats();
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];

    // Per Legion type stat
    const legionStat = getOrCreateLegionStat(
      stat.id,
      legion,
      stat.startTimestamp,
      stat.endTimestamp
    );
    legionStat.starlightTempleStat = stat.id;

    // Per Constellation stat
    const globalConstellationStat = getOrCreateConstellationStat(
      stat.id,
      constellation,
      -1,
      stat.startTimestamp,
      stat.endTimestamp
    );

    // Per Constellation per rank stat
    const constellationStat = getOrCreateConstellationStat(
      stat.id,
      constellation,
      rank,
      stat.startTimestamp,
      stat.endTimestamp
    );

    // Increment total ranks
    const rankDifference = rank - previousRank;
    stat.legionConstellationsTotalRank += rankDifference;
    legionStat.constellationsTotalRank += rankDifference;
    globalConstellationStat.legionsTotalRank += rankDifference;
    constellationStat.legionsTotalRank += rank;

    // Increment number of Legions tattooed
    constellationStat.legionsTattooed += 1;
    if (isFirstConstellation) {
      stat.legionsTattooed += 1;
    }

    // Increment number of Constellations tattooed
    if (previousRank == 0) {
      stat.legionConstellationsTattooed += 1;
      legionStat.constellationsTattooed += 1;
      globalConstellationStat.legionsTattooed += 1;
    } else {
      // Decrement Legion count for the previous rank of this Constellation
      const previousConstellationStat = getOrCreateConstellationStat(
        stat.id,
        constellation,
        previousRank,
        stat.startTimestamp,
        stat.endTimestamp
      );
      previousConstellationStat.legionsTattooed = Math.max(
        previousConstellationStat.legionsTattooed - 1,
        0
      ) as i32;
      previousConstellationStat.legionsTotalRank -= previousRank;
      previousConstellationStat.save();
    }

    stat.save();
    legionStat.save();
    globalConstellationStat.save();
    constellationStat.save();
  }

  legion.save();
}
