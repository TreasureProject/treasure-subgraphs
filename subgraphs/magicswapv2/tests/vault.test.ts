import { assert, beforeEach, clearStore, describe, test } from "matchstick-as";

import { Address, Bytes } from "@graphprotocol/graph-ts";

import { VaultCollection } from "../generated/schema";
import { handlePairCreated } from "../src/mappings/factory";
import { handleMint, handleTransfer } from "../src/mappings/pair";
import { handleDeposit, handleVaultCreated } from "../src/mappings/vault";
import {
  COLLECTION,
  PAIR,
  TOKEN0,
  TX_HASH1,
  USER1,
  VAULT,
} from "./helpers/constants";
import {
  createMintEvent,
  createPairCreatedEvent,
  createTransferEvent,
} from "./helpers/pair";
import { mockToken } from "./helpers/token";
import { createDepositEvent, createVaultCreatedEvent } from "./helpers/vault";

mockToken(TOKEN0, "Token 0", "TK0");
mockToken(VAULT);

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
    handleMint(
      createMintEvent(
        PAIR,
        USER1,
        "1000000000000000000",
        "500000000000000000000"
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
