import { log } from "@graphprotocol/graph-ts";

import {
  FinishedUnstakingTreasure,
  LifeformCreated,
} from "../../generated/SeedEvolution/SeedEvolution";
import { _Lifeform, _LifeformOwner } from "../../generated/schema";
import { ONE_BI } from "../helpers/constants";
import { getOrCreateLifeform } from "../helpers/lifeform";
import {
  getBalancerCrystalsStakedForPath,
  getMagicOfferedForPath,
  getPathByIndex,
} from "../helpers/path";
import { getOrCreateRandom } from "../helpers/random";
import { getRealmByIndex } from "../helpers/realm";
import {
  getOrCreateGlobalStat,
  getOrCreatePathStat,
  getOrCreateRealmComboStat,
  getOrCreateRealmStat,
  getOrCreateTreasureStat,
} from "../helpers/stat";

export function handleLifeformCreated(event: LifeformCreated): void {
  const params = event.params;
  const info = params._evolutionInfo;

  const pathIndex = info.path;
  const firstRealm = getRealmByIndex(info.firstRealm);
  const secondRealm = getRealmByIndex(info.secondRealm);
  const path = getPathByIndex(pathIndex);

  const lifeform = getOrCreateLifeform(params._lifeformId, info.owner);
  lifeform.firstRealm = firstRealm;
  lifeform.secondRealm = secondRealm;
  lifeform.path = path;
  lifeform.stakedTreasureIds = info.stakedTreasureIds;
  lifeform.stakedTreasureAmounts = info.stakedTreasureAmounts;
  lifeform.save();

  const random = getOrCreateRandom(info.requestId);
  random.lifeformId = lifeform.id;
  random.save();

  // Increment global stats
  const globalStat = getOrCreateGlobalStat();
  globalStat.lifeformTotal = globalStat.lifeformTotal.plus(ONE_BI);
  globalStat.magicOffered = globalStat.magicOffered.plus(
    getMagicOfferedForPath(pathIndex)
  );
  globalStat.balancerCrystalsStaked = globalStat.balancerCrystalsStaked.plus(
    getBalancerCrystalsStakedForPath(pathIndex)
  );

  // Increment realm stats
  const firstRealmStat = getOrCreateRealmStat(firstRealm);
  firstRealmStat.lifeformTotal = firstRealmStat.lifeformTotal.plus(ONE_BI);
  firstRealmStat.firstRealmCount = firstRealmStat.firstRealmCount.plus(ONE_BI);
  firstRealmStat.save();

  const secondRealmStat = getOrCreateRealmStat(secondRealm);
  secondRealmStat.lifeformTotal = secondRealmStat.lifeformTotal.plus(ONE_BI);
  secondRealmStat.secondRealmCount =
    secondRealmStat.secondRealmCount.plus(ONE_BI);
  secondRealmStat.save();

  const realmComboStat = getOrCreateRealmComboStat(firstRealm, secondRealm);
  realmComboStat.lifeformTotal = realmComboStat.lifeformTotal.plus(ONE_BI);
  realmComboStat.save();

  // Increment path stats
  const pathStat = getOrCreatePathStat(path);
  pathStat.lifeformTotal = pathStat.lifeformTotal.plus(ONE_BI);
  pathStat.save();

  // Increment treasure stats
  for (let i = 0; i < info.stakedTreasureIds.length; i++) {
    const amount = info.stakedTreasureAmounts[i];
    const treasureStat = getOrCreateTreasureStat(info.stakedTreasureIds[i]);
    treasureStat.staked = treasureStat.staked.plus(amount);
    treasureStat.save();

    globalStat.treasuresStaked = globalStat.treasuresStaked.plus(amount);
  }

  globalStat.save();
}

export function handleFinishedUnstakingTreasure(
  event: FinishedUnstakingTreasure
): void {
  const params = event.params;

  const globalStat = getOrCreateGlobalStat();

  const ownerId = params._owner.toHexString();
  const lifeformOwner = _LifeformOwner.load(ownerId);
  if (!lifeformOwner) {
    log.error("Unknown Lifeform owner: {}", [ownerId]);
    return;
  }

  const lifeform = _Lifeform.load(lifeformOwner.lifeform);
  if (!lifeform) {
    log.error("Unknown Lifeform owner: {}", [ownerId]);
    return;
  }

  for (let i = 0; i < lifeform.stakedTreasureIds.length; i++) {
    const tokenId = lifeform.stakedTreasureIds[i];
    const treasureStat = getOrCreateTreasureStat(tokenId);
    const originalAmount = lifeform.stakedTreasureAmounts[i];
    const unstakingIndex = params._unstakingTreasureIds.indexOf(tokenId);
    const brokenAmount =
      unstakingIndex >= 0
        ? originalAmount.minus(params._unstakingTreasureAmounts[unstakingIndex])
        : originalAmount;
    treasureStat.unstaked = treasureStat.unstaked.plus(originalAmount);
    treasureStat.broken = treasureStat.broken.plus(brokenAmount);
    treasureStat.save();

    globalStat.treasuresUnstaked =
      globalStat.treasuresUnstaked.plus(originalAmount);
    globalStat.treasuresBroken = globalStat.treasuresBroken.plus(brokenAmount);
  }

  // Clear Lifeform's staked treasures
  lifeform.stakedTreasureIds = [];
  lifeform.stakedTreasureAmounts = [];
  lifeform.save();

  globalStat.save();
}
