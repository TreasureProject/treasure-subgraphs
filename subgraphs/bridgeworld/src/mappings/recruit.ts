import { log } from "@graphprotocol/graph-ts";

import { getLegionId } from "../../../bridgeworld-stats/src/helpers/ids";
import {
  AscensionInfoSet,
  LevelUpInfoSet,
  MaxLevelSet,
  RecruitTypeChanged,
  RecruitXPChanged,
} from "../../generated/Recruit Level/RecruitLevel";
import { Token } from "../../generated/schema";
import { LEGION_IPFS, LEGION_PFP_IPFS } from "../helpers";
import {
  RECRUIT_CLASS,
  getCadetImage,
  getLegionMetadata,
} from "../helpers/legion";
import {
  getOrCreateRecruitConfig,
  getOrCreateRecruitLevelConfig,
} from "../helpers/recruit";

export function handleAscensionInfoSet(event: AscensionInfoSet): void {
  const params = event.params;
  const config = getOrCreateRecruitConfig();
  config.ascensionMinLevel = params.minimumLevel;
  config.ascensionCostEssenceOfStarlight = params.numEoS;
  config.ascensionCostPrismShards = params.numPrismShards;
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

  token.name = "Recruit";
  token.image = getCadetImage(LEGION_IPFS, RECRUIT_CLASS[params.recruitType]);
  token.imageAlt = getCadetImage(
    LEGION_PFP_IPFS,
    RECRUIT_CLASS[params.recruitType]
  );
  token.save();

  const metadata = getLegionMetadata(tokenId);
  metadata.role = `${RECRUIT_CLASS[params.recruitType]} Cadet`;
  metadata.save();
}

export function handleRecruitXpChanged(event: RecruitXPChanged): void {
  const params = event.params;
  const metadata = getLegionMetadata(params.tokenId);
  metadata.recruitLevel = params.levelCur;
  metadata.recruitXp = params.expCur.toI32();
  metadata.save();
}
