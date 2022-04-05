import { RealmStat } from "../../generated/schema";

export class RealmStatHelpers {
  public static getOrCreateRealmStat(name: string): RealmStat {
    let realmStat = RealmStat.load(name);
    if (!realmStat) {
      realmStat = new RealmStat(name);
      realmStat.realm = name;
      realmStat.save();
    }

    return realmStat;
  }
}
