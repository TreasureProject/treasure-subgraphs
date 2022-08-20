import {
  RecruitTypeChanged,
  RecruitXPChanged,
} from "../../generated/Recruit Level/RecruitLevel";
import { RECRUIT_CLASS, getLegionMetadata } from "../helpers/legion";

export function handleRecruitTypeChanged(event: RecruitTypeChanged): void {
  const params = event.params;
  const metadata = getLegionMetadata(params.tokenId);
  metadata.role = RECRUIT_CLASS[params.recruitType];
  metadata.save();
}

export function handleRecruitXpChanged(event: RecruitXPChanged): void {
  const params = event.params;
  const metadata = getLegionMetadata(params.tokenId);
  metadata.recruitLevel = params.levelCur;
  metadata.recruitXp = params.expCur.toI32();
  metadata.save();
}
