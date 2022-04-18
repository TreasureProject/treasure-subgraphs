import { RealmStat } from "../../generated/schema";

export function getOrCreateRealmStat(name: string): RealmStat {
  let realmStat = RealmStat.load(name);
  if (!realmStat) {
    realmStat = new RealmStat(name);
    realmStat.realm = name;
    realmStat.save();
  }

  return realmStat;
}
