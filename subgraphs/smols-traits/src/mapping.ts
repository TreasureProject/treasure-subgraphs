import { Bytes } from "@graphprotocol/graph-ts";

import { TraitAdded } from "../generated/Smols Trait Storage/SmolsTraitStorage";
import { Trait } from "../generated/schema";

const GENDERS = ["Unset", "Male", "Female"];

export function handleTraitAdded(event: TraitAdded): void {
  const params = event.params;

  const id = Bytes.fromI32(params._traitId.toI32());
  let trait = Trait.load(id);
  if (!trait) {
    trait = new Trait(id);
  }

  trait.traitId = params._traitId.toI32();
  trait.gender = GENDERS[params._trait.gender];
  trait.traitName = params._trait.traitName.toString();
  trait.traitType = params._trait.traitType.toString();
  trait.maleImage = params._trait.pngImage.male.toString();
  trait.femaleImage = params._trait.pngImage.female.toString();
  trait.isDetachable = params._trait.isDetachable;
  trait.save();
}
