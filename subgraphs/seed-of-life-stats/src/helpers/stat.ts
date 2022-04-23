import { BigInt } from "@graphprotocol/graph-ts";

import {
  ClassStat,
  GlobalStat,
  PathStat,
  RealmStat,
  TreasureStat,
} from "../../generated/schema";
import { getTokenName, getTreasureTier } from "./treasure";

export const getOrCreateRealmStat = (realm: string): RealmStat => {
  const id = realm;
  let stat = RealmStat.load(id);
  if (!stat) {
    stat = new RealmStat(id);
    stat.realm = realm;
    stat.save();
  }

  return stat;
};

export const getOrCreatePathStat = (path: string): PathStat => {
  const id = path;
  let stat = PathStat.load(id);
  if (!stat) {
    stat = new PathStat(id);
    stat.path = path;
    stat.save();
  }

  return stat;
};

export const getOrCreateTreasureStat = (tokenId: BigInt): TreasureStat => {
  const id = tokenId.toHexString();
  let stat = TreasureStat.load(id);
  if (!stat) {
    stat = new TreasureStat(id);
    stat.tokenId = tokenId;
    stat.name = getTokenName(tokenId);
    stat.tier = getTreasureTier(tokenId);
    stat.save();
  }

  return stat;
};

export const getOrCreateClassStat = (lifeformClass: string): ClassStat => {
  const id = lifeformClass;
  let stat = ClassStat.load(id);
  if (!stat) {
    stat = new ClassStat(id);
    stat.lifeformClass = lifeformClass;
    stat.save();
  }

  return stat;
};

export const getOrCreateGlobalStat = (): GlobalStat => {
  const id = "only";
  let stat = GlobalStat.load(id);
  if (!stat) {
    stat = new GlobalStat(id);
    stat.save();
  }

  return stat;
};
