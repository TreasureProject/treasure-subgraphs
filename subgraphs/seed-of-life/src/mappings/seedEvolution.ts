import { BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  ImbuedSoulClaimed,
  LifeformCreated,
  StartedClaimingImbuedSoul,
} from "../../generated/SeedEvolution/SeedEvolution";
import {
  ClaimLifeform,
  Lifeform,
  Random,
  StakedTreasure,
  UserApproval,
} from "../../generated/schema";
import { RandomHelpers } from "../helpers/RandomHelpers";
import { TransferHelpers } from "../helpers/TransferHelpers";
import { UserHelpers } from "../helpers/UserHelpers";
import { LifeformRealm, Path } from "../helpers/constants";

export function handleLifeformCreated(event: LifeformCreated): void {
  let evolutionInfo = event.params._evolutionInfo;

  let user = UserHelpers.getOrCreateUser(evolutionInfo.owner.toHexString());

  let lifeform = new Lifeform(event.params._lifeformId.toHexString());

  let random = RandomHelpers.getOrCreateRandom(evolutionInfo.requestId);
  random._lifeformId = lifeform.id;
  random.save();

  lifeform.creationTimestamp = evolutionInfo.startTime;
  lifeform.user = user.id;
  lifeform.isReadyToRevealClass = false;
  lifeform.path = Path.getName(evolutionInfo.path);
  lifeform.firstRealm = LifeformRealm.getName(evolutionInfo.firstRealm);
  lifeform.secondRealm = LifeformRealm.getName(evolutionInfo.secondRealm);

  for (let i = 0; i < evolutionInfo.stakedTreasureIds.length; i++) {
    let stakedTreasure = new StakedTreasure(
      `${event.params._lifeformId.toHexString()} - ${i}`
    );

    stakedTreasure.treasureId = evolutionInfo.stakedTreasureIds[i];
    stakedTreasure.treasureAmount = evolutionInfo.stakedTreasureAmounts[i];

    stakedTreasure.save();

    lifeform.stakedTreasure.concat([stakedTreasure.id]);
  }

  lifeform.save();
}

export function handleStartedClaimingImbuedSoul(
  event: StartedClaimingImbuedSoul
): void {
  let lifeform = Lifeform.load(event.params._lifeformId.toHexString())!;

  let random = RandomHelpers.getOrCreateRandom(event.params._claimRequestId);

  let claimLifeform = new ClaimLifeform(lifeform.id);
  claimLifeform.lifeform = lifeform.id;
  claimLifeform.claimStatus = "NOT_READY";

  claimLifeform.save();

  random._claimLifeformId = claimLifeform.id;

  random.save();
}

export function handleImbuedSoulClaimed(event: ImbuedSoulClaimed): void {
  let lifeform = Lifeform.load(event.params._lifeformId.toHexString());
  if (!lifeform) {
    return;
  }

  store.remove("Lifeform", lifeform.id);
  store.remove("ClaimLifeform", lifeform.id);
}
