import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import { Transfer } from "../generated/Smol Brains/ERC721";
import {
  TransferBatch,
  TransferSingle,
} from "../generated/Smol Treasures/ERC1155";
import { Token } from "../generated/schema";
import {
  getOrCreateCollection,
  getOrCreateUserToken,
  getStakingContract,
  getStakingContractName,
  getTokenId,
} from "./helpers";

const handleTransferCommon = (
  timestamp: BigInt,
  address: Address,
  tokenId: BigInt,
  from: Address,
  to: Address,
  quantity: i32 = 1,
  trackStakingContract: bool = true
): void => {
  const id = getTokenId(address, tokenId);
  let token = Token.load(id);

  // Handle mint
  if (from.equals(Address.zero())) {
    // ERC1155 token may already exist
    if (!token) {
      token = new Token(id);
      token.collection = getOrCreateCollection(address).id;
      token.tokenId = tokenId.toI32();
      token.save();
    }

    const userToken = getOrCreateUserToken(token, to);
    userToken.quantity += quantity;
    userToken.save();
    return;
  }

  if (!token) {
    log.error("Transferring unknown token: {}, {}", [
      address.toHexString(),
      tokenId.toString(),
    ]);
    return;
  }

  // Handle transfer to known staking contract
  if (trackStakingContract) {
    const toStakingContract = getStakingContract(to);
    if (toStakingContract) {
      const userToken = getOrCreateUserToken(token, from);
      userToken.stakedIn = toStakingContract.id;
      userToken.stakedTime = timestamp;
      userToken.save();
      return;
    }
  }

  // Handle transfer to user
  const userToken = getOrCreateUserToken(token, to);

  // Handle transfer from known staking contract
  if (trackStakingContract) {
    const fromStakingContractName = getStakingContractName(from);
    if (fromStakingContractName) {
      userToken.stakedIn = null;
      userToken.stakedTime = null;
      userToken.save();
      return;
    }
  }

  // Handle transfer between users
  userToken.quantity += quantity;
  userToken.save();

  const fromUserToken = getOrCreateUserToken(token, from);
  const nextQuantity = (fromUserToken.quantity = quantity);
  if (nextQuantity > 0) {
    fromUserToken.quantity = nextQuantity;
    fromUserToken.save();
  } else {
    store.remove("UserToken", fromUserToken.id.toString());
  }
};

export function handleTransfer(event: Transfer): void {
  const params = event.params;
  handleTransferCommon(
    event.block.timestamp,
    event.address,
    params.tokenId,
    params.from,
    params.to
  );
}

export function handleTransferSingle(event: TransferSingle): void {
  const params = event.params;
  handleTransferCommon(
    event.block.timestamp,
    event.address,
    params.id,
    params.from,
    params.to,
    params.value.toI32(),
    false
  );
}

export function handleTransferBatch(event: TransferBatch): void {
  const params = event.params;
  for (let i = 0; i < params.ids.length; i += 1) {
    handleTransferCommon(
      event.block.timestamp,
      event.address,
      params.ids[i],
      params.from,
      params.to,
      params.values[i].toI32(),
      false
    );
  }
}
