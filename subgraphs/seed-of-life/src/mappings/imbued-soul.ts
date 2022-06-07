import { ImbuedSoulCreate } from "../../generated/ImbuedSoul/ImbuedSoul";
import { ImbuedSoul } from "../../generated/schema";
import {
  LifeformClass,
  OffensiveSkill,
  SecondarySkill,
} from "../helpers/constants";
import { getOrCreateUser } from "../helpers/user";

export function handleImbuedSoulCreated(event: ImbuedSoulCreate): void {
  const params = event.params;
  const info = params._info;

  const user = getOrCreateUser(params._owner.toHexString());

  const imbuedSoul = new ImbuedSoul(params._tokenId.toHexString());
  imbuedSoul.user = user.id;
  imbuedSoul.lifeformClass = LifeformClass.getName(info.lifeformClass);
  imbuedSoul.offensiveSkill = OffensiveSkill.getName(info.offensiveSkill);
  imbuedSoul.secondarySkills = info.secondarySkills.map<string>(
    secondarySkill => SecondarySkill.getName(secondarySkill)
  );
  imbuedSoul.isLandOwner = info.isLandOwner;
  imbuedSoul.save();
}
