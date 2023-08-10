import { Address, Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  KOTE_POTIONS_ADDRESS,
  KOTE_TRINKETS_ADDRESS,
} from "@treasure/constants";

import { TraitAdded } from "../generated/Smols On Chain Traits/SmolsOnChainTraitStorage";
import { PngImage, Trait } from "../generated/schema";

export function handleTraitAdded(event: TraitAdded): void {
  const params = event.params;
}
