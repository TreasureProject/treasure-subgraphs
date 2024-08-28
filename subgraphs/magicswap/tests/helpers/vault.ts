import { newMockEvent } from "matchstick-as";

import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";

import { VaultCreated } from "../../generated/NftVaultFactory/NftVaultFactory";
import { Deposit } from "../../generated/templates/NftVault/NftVault";

export const createVaultCreatedEvent = (
  vault: string,
  name: string,
  symbol: string,
  collectionAddr: string,
  collectionNftType: i32,
  collectionTokenIds: i32[]
): VaultCreated => {
  const event = changetype<VaultCreated>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam("name", ethereum.Value.fromString(name)),
    new ethereum.EventParam("symbol", ethereum.Value.fromString(symbol)),
    new ethereum.EventParam(
      "vault",
      ethereum.Value.fromAddress(Address.fromString(vault))
    ),
    new ethereum.EventParam("vaultId", ethereum.Value.fromI32(0)),
    new ethereum.EventParam(
      "collections",
      ethereum.Value.fromTupleArray([
        changetype<ethereum.Tuple>([
          ethereum.Value.fromAddress(Address.fromString(collectionAddr)),
          ethereum.Value.fromI32(collectionNftType),
          ethereum.Value.fromBoolean(collectionTokenIds.length === 0),
          ethereum.Value.fromI32Array(collectionTokenIds),
        ]),
      ])
    ),
    new ethereum.EventParam(
      "creator",
      ethereum.Value.fromAddress(Address.zero())
    ),
  ];
  return event;
};

export const createDepositEvent = (
  hash: string,
  vault: string,
  to: string,
  collection: string,
  tokenId: i32,
  amount: i32
): Deposit => {
  const event = changetype<Deposit>(newMockEvent());
  event.address = Address.fromString(vault);
  event.transaction.hash = Bytes.fromHexString(hash);
  event.parameters = [
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam(
      "collection",
      ethereum.Value.fromAddress(Address.fromString(collection))
    ),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("amount", ethereum.Value.fromI32(amount)),
  ];
  return event;
};
