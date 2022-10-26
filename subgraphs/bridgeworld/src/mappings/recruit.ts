import { log } from "@graphprotocol/graph-ts";

import { getLegionId } from "../../../bridgeworld-stats/src/helpers/ids";
import {
  AscensionInfoSet,
  LevelUpInfoSet,
  MaxLevelSet,
  RecruitCanAscendToAuxChanged,
  RecruitTypeChanged,
  RecruitXPChanged,
} from "../../generated/Recruit Level/RecruitLevel";
import { Token } from "../../generated/schema";
import { LEGION_IPFS, LEGION_PFP_IPFS } from "../helpers";
import {
  RECRUIT_TYPE,
  getLegionMetadata,
  getRecruitImage,
  mapRecruitAscensionType,
} from "../helpers/legion";
import {
  getOrCreateRecruitConfig,
  getOrCreateRecruitLevelConfig,
} from "../helpers/recruit";

export function handleAscensionInfoSet(event: AscensionInfoSet): void {
  const params = event.params;
  const config = getOrCreateRecruitConfig();
  config.cadetAscensionMinLevel = params.minimumLevelCadet;
  config.cadetAscensionCostEssenceOfStarlight = params.numEoSCadet;
  config.cadetAscensionCostPrismShards = params.numPrismShardsCadet;
  config.apprenticeAscensionMinLevel = params.minimumLevelApprentice;
  config.apprenticeAscensionCostEssenceOfStarlight = params.numEoSApprentice;
  config.apprenticeAscensionCostPrismShards = params.numPrismShardsApprentice;
  config.save();
}

export function handleLevelUpInfoSet(event: LevelUpInfoSet): void {
  const params = event.params;
  const config = getOrCreateRecruitLevelConfig(params.levelCur);
  config.xpToNextLevel = params.expToNextLevel;
  config.save();
}

export function handleMaxLevelSet(event: MaxLevelSet): void {
  const config = getOrCreateRecruitConfig();
  config.maxLevel = event.params.maxLevel;
  config.save();
}

export function handleRecruitTypeChanged(event: RecruitTypeChanged): void {
  const params = event.params;
  const tokenId = params.tokenId;
  const token = Token.load(getLegionId(tokenId));
  if (!token) {
    log.error("Unknown Recruit token: {}", [tokenId.toString()]);
    return;
  }

  const recruitType = RECRUIT_TYPE[params.recruitType];
  const ascensionType = mapRecruitAscensionType(recruitType);

  token.rarity = ascensionType;
  token.name = `${recruitType} ${ascensionType}`;
  token.image = getRecruitImage(LEGION_IPFS, recruitType);
  token.imageAlt = getRecruitImage(LEGION_PFP_IPFS, recruitType);
  token.save();

  const metadata = getLegionMetadata(tokenId);
  metadata.rarity = token.rarity;
  metadata.role = recruitType;
  metadata.save();
}

export function handleRecruitXpChanged(event: RecruitXPChanged): void {
  const params = event.params;
  const metadata = getLegionMetadata(params.tokenId);
  metadata.recruitLevel = params.levelCur;
  metadata.recruitXp = params.expCur.toI32();
  metadata.save();
}

export function handleRecruitCanAscendToAuxChanged(
  event: RecruitCanAscendToAuxChanged
): void {
  const params = event.params;
  const metadata = getLegionMetadata(params.tokenId);
  metadata.recruitCanAscendToAux = params.canAscendToAux;
  metadata.save();
}
