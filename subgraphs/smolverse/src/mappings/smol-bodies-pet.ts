import { ipfs, json } from "@graphprotocol/graph-ts";
import { log } from "matchstick-as";

import { SmolPetMint } from "../../generated/Smol Bodies Pets/SmolBodiesPets";
import { getJsonStringValue } from "../helpers/json";
import { getOrCreateSmolBodiesPet, getOrCreateUser } from "../helpers/models";

export function handleMint(event: SmolPetMint): void {
  let params = event.params;

  const owner = getOrCreateUser(params.to.toHexString());
  const token = getOrCreateSmolBodiesPet(params.tokenId);
  token.owner = owner.id;

  // const data = ipfs.cat(`QmdEC7rjy2WZaTQSXtFtMEN2AvS8ARFvnMhRDcFHvhaohH/${token.tokenId}`);
  // if (!data) {
  //   log.error("Token missing IPFS data: {}", [token.id]);
  //   return;
  // }

  // const value = json.fromBytes(data).toObject();
  // const name = getJsonStringValue(value, "name");
  // const description = getJsonStringValue(value, "description");
  // const image = getJsonStringValue(value, "image");
  // if (!name || !description || !image) {
  //   log.error("Token missing metadata: {}", [token.id]);
  //   return;
  // }

  // token.name = name as string;
  // token.description = description as string;
  // token.image = image as string;

  token.save();
}
