import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import { ERC721 } from "../../generated/TreasureMarketplace v2/ERC721";
import { Transfer } from "../../generated/TreasureMarketplace/ERC721";
import { Collection, UserToken } from "../../generated/schema";
import {
  createErc721Collection,
  getStats,
  getToken,
  getUser,
  removeFromArray,
} from "../helpers";
import * as realm from "../helpers/realm";
import * as common from "../mapping";

function snapshot(address: Address): void {
  const contract = ERC721.bind(address);
  const nonStakersLength = realm.nonStakers.length;

  let realmIds = realm.realmIds.slice(0);

  for (let index = 0; index < nonStakersLength; index++) {
    const tokenId = BigInt.fromString(realm.nonStakers[index]);
    const owner = contract.try_ownerOf(tokenId);

    if (owner.reverted) {
      log.warning("[realm] Owner reverted: {}", [tokenId.toString()]);

      continue;
    }

    const user = getUser(owner.value);
    const token = getToken(address, tokenId);

    let id = `${user.id}-${token.id}`;
    let userToken = UserToken.load(id);

    if (!userToken) {
      userToken = new UserToken(id);

      userToken.token = token.id;
      userToken.user = user.id;
    }

    userToken.quantity = 1;
    userToken.save();

    // Remove processed realm id
    realmIds = removeFromArray(realmIds, tokenId.toString());
  }

  const stakersLength = realmIds.length;

  for (let index = 0; index < stakersLength; index++) {
    const tokenId = BigInt.fromString(realmIds[index]);

    const user = getUser(realm.STAKING_V1_ADDRESS);
    const token = getToken(address, tokenId);

    let id = `${user.id}-${token.id}`;
    let userToken = UserToken.load(id);

    if (!userToken) {
      userToken = new UserToken(id);

      userToken.token = token.id;
      userToken.user = user.id;
    }

    userToken.quantity = 1;
    userToken.save();
  }

  const stats = getStats(address.toHexString());

  stats.items = realm.realmIds.length;
  stats.save();
}

export function handleTransfer(event: Transfer): void {
  const bootstrap = Collection.load(event.address.toHexString()) == null;

  createErc721Collection(event.address, "Realm");

  if (bootstrap) {
    snapshot(event.address);
  }

  common.handleTransfer721(event);
}
