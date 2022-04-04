import { store } from "@graphprotocol/graph-ts";

import { SEED_OF_LIFE_TREASURES_ADDRESS } from "@treasure/constants";

import {
  ImbuedSoulClaimed,
  LifeformCreated,
  StartedClaimingImbuedSoul,
} from "../../generated/SeedEvolution/SeedEvolution";
import { ClaimLifeform, Lifeform, StakedToken } from "../../generated/schema";
import { CollectionHelpers } from "../helpers/CollectionHelpers";
import { RandomHelpers } from "../helpers/RandomHelpers";
import { TokenHelpers } from "../helpers/TokenHelpers";
import { TreasureHelpers } from "../helpers/TreasureHelpers";
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
  lifeform.path = Path.getName(evolutionInfo.path);
  lifeform.firstRealm = LifeformRealm.getName(evolutionInfo.firstRealm);
  lifeform.secondRealm = LifeformRealm.getName(evolutionInfo.secondRealm);

  let treasureCollection = CollectionHelpers.getOrCreateCollection(
    SEED_OF_LIFE_TREASURES_ADDRESS
  );
  for (let i = 0; i < evolutionInfo.stakedTreasureIds.length; i++) {
    let tokenId = evolutionInfo.stakedTreasureIds[i];
    let token = TokenHelpers.getOrCreateToken(
      treasureCollection,
      tokenId,
      TreasureHelpers.getNameForTokenId(tokenId)
    );
    let stakedToken = new StakedToken(`${lifeform.id}-${token.id}`);
    stakedToken.lifeform = lifeform.id;
    stakedToken.quantity = evolutionInfo.stakedTreasureAmounts[i];
    stakedToken.token = token.id;
    stakedToken.user = user.id;
    stakedToken.save();
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
