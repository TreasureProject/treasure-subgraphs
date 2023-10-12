import { Bytes } from "@graphprotocol/graph-ts";

import { TraitAdded } from "../generated/Smols Trait Storage/SmolsTraitStorage";
import { Trait } from "../generated/schema";

export function handleTraitAdded(event: TraitAdded): void {
  const params = event.params;

  const id = Bytes.fromI32(params._traitId.toI32());
  let trait = Trait.load(id);
  if (!trait) {
    trait = new Trait(id);
  }

  trait.traitId = params._traitId.toI32();
  trait.gender = params._trait.gender;
  trait.traitName = params._trait.traitName;
  trait.traitType = params._trait.traitType;
  trait.maleImage = params._trait.pngImage.male;
  trait.femaleImage = params._trait.pngImage.female;
  trait.isDetachable = params._trait.isDetachable;
  trait.save();
}
