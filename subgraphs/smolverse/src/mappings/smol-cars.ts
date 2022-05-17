import {
  BaseURIChanged,
  SmolCars,
  Transfer,
} from "../../generated/Smol Cars/SmolCars";
import { SMOL_CARS_BASE_URI } from "../helpers/constants";
import { getOrCreateCollection } from "../helpers/models";
import { handleTransfer as commonHandleTransfer } from "./common";

export function handleBaseUriChanged(event: BaseURIChanged): void {
  const collection = getOrCreateCollection(event.address);
  collection.baseUri = event.params.to;
  collection.save();
}

export function handleTransfer(event: Transfer): void {
  const address = event.address;
  const params = event.params;

  const collection = getOrCreateCollection(address);
  if (!collection.baseUri) {
    const contract = SmolCars.bind(address);
    const baseUriCall = contract.try_baseURI();
    collection.baseUri = baseUriCall.reverted
      ? SMOL_CARS_BASE_URI
      : baseUriCall.value;
    collection.save();
  }

  commonHandleTransfer(
    event.block.timestamp,
    collection,
    params.from,
    params.to,
    params.tokenId
  );
}
