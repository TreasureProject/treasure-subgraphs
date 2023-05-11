import {
  assert,
  beforeEach,
  clearStore,
  describe,
  newMockEvent,
  test,
} from "matchstick-as";

import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";

import { VaultCreated } from "../generated/NftVaultFactory/NftVaultFactory";
import { VaultCollection } from "../generated/schema";
import { Deposit } from "../generated/templates/NftVault/NftVault";
import { handlePairCreated } from "../src/mappings/factory";
import { handleTransfer } from "../src/mappings/pair";
import { handleDeposit, handleVaultCreated } from "../src/mappings/vault";
import {
  COLLECTION,
  PAIR,
  TOKEN0,
  TX_HASH1,
  USER1,
  VAULT,
} from "./helpers/constants";
import { mockToken } from "./helpers/token";
import { createPairCreatedEvent, createTransferEvent } from "./pair.test";

mockToken(VAULT);

const createVaultCreatedEvent = (
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

const createDepositEvent = (
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

describe("handleVaultCreated()", () => {
  beforeEach(() => {
    clearStore();
  });

  test("should create new unrestricted nft vault", () => {
    // Create vault
    handleVaultCreated(
      createVaultCreatedEvent(VAULT, "Test Vault", "TVLT", COLLECTION, 0, [])
    );

    assert.fieldEquals("Token", VAULT, "name", "Test Vault");

    const vaultCollection = VaultCollection.load(
      Bytes.fromHexString(VAULT).concatI32(0)
    );
    assert.assertNotNull(vaultCollection);
    assert.assertNull(vaultCollection!.tokenIds);
  });

  test("should create new restricted nft vault", () => {
    // Create vault with specific token ids
    handleVaultCreated(
      createVaultCreatedEvent(
        VAULT,
        "Test Vault",
        "TVLT",
        COLLECTION,
        1,
        [1, 2]
      )
    );

    assert.fieldEquals("Token", VAULT, "name", "Test Vault");
    assert.fieldEquals(
      "VaultCollection",
      `${VAULT}00000000`,
      "tokenIds",
      "[1, 2]"
    );
  });
});

describe("handleDeposit()", () => {
  beforeEach(() => {
    clearStore();
  });

  test("should create new vault reserve and transaction items", () => {
    // Create vault
    handleVaultCreated(
      createVaultCreatedEvent(VAULT, "Test Vault", "TVLT", COLLECTION, 0, [])
    );

    // Deposit NFT
    handleDeposit(createDepositEvent(TX_HASH1, VAULT, USER1, COLLECTION, 1, 1));

    const reserveItemId = Bytes.fromHexString(VAULT)
      .concat(Bytes.fromHexString(COLLECTION))
      .concatI32(1)
      .toHexString();
    assert.fieldEquals("VaultReserveItem", reserveItemId, "amount", "1");

    const transactionItemId = Bytes.fromHexString(TX_HASH1)
      .concat(Bytes.fromHexString(VAULT))
      .concat(Bytes.fromHexString(COLLECTION))
      .concatI32(1)
      .toHexString();
    assert.fieldEquals("TransactionItem", transactionItemId, "amount", "1");

    assert.fieldEquals("Transaction", TX_HASH1, "type", "Deposit");
    assert.fieldEquals(
      "Transaction",
      TX_HASH1,
      "_items",
      `[${transactionItemId}]`
    );

    // Create pair
    handlePairCreated(createPairCreatedEvent(TOKEN0, VAULT, PAIR));

    // Mint tokens
    handleTransfer(
      createTransferEvent(
        PAIR,
        Address.zero().toHexString(),
        USER1,
        "1000000000000000000"
      )
    );

    assert.fieldEquals(
      "Transaction",
      TX_HASH1,
      "items1",
      `[${transactionItemId}]`
    );
  });
});
