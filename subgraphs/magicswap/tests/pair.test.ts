import { assert, beforeEach, clearStore, describe, test } from "matchstick-as";

import { Address } from "@graphprotocol/graph-ts";

import {
  MAGICSWAP_V2_FACTORY_ADDRESS,
  MAGIC_ADDRESS,
} from "@treasure/constants";

import { handlePairCreated } from "../src/mappings/factory";
import {
  handleBurn,
  handleMint,
  handleSync,
  handleTransfer,
} from "../src/mappings/pair";
import { handleMagicUSDUpdated } from "../src/mappings/price";
import {
  PAIR,
  TOKEN0,
  TOKEN1,
  TX_HASH1,
  TX_HASH2,
  USER1,
  USER2,
} from "./helpers/constants";
import {
  createBurnEvent,
  createMintEvent,
  createPairCreatedEvent,
  createSyncEvent,
  createTransferEvent,
} from "./helpers/pair";
import { createAnswerUpdatedEvent } from "./helpers/price";
import { mockToken } from "./helpers/token";

mockToken(TOKEN0, "Token 0", "TK0");
mockToken(TOKEN1, "Token 1", "TK1");
mockToken(MAGIC_ADDRESS.toHexString(), "Magic Token", "MAGIC");

describe("handlePairCreated()", () => {
  beforeEach(() => {
    clearStore();
  });

  test("should create new pair", () => {
    // Create pair
    handlePairCreated(createPairCreatedEvent());

    assert.fieldEquals("Token", TOKEN0, "name", "Token 0");
    assert.fieldEquals("Token", TOKEN0, "symbol", "TK0");
    assert.fieldEquals("Token", TOKEN1, "name", "Token 1");
    assert.fieldEquals("Token", TOKEN1, "symbol", "TK1");

    assert.fieldEquals("Pair", PAIR, "token0", TOKEN0);
    assert.fieldEquals("Pair", PAIR, "token1", TOKEN1);
  });

  test("should detect MAGIC pairs", () => {
    // Create MAGIC pair
    handlePairCreated(
      createPairCreatedEvent(TOKEN0, MAGIC_ADDRESS.toHexString(), PAIR)
    );

    assert.fieldEquals("Token", TOKEN0, "magicPairs", `[${PAIR}]`);
  });
});

describe("handleSync()", () => {
  beforeEach(() => {
    clearStore();
  });

  test("should update MAGIC and USD prices", () => {
    // Create MAGIC pair
    handlePairCreated(
      createPairCreatedEvent(TOKEN0, MAGIC_ADDRESS.toHexString(), PAIR)
    );

    // Set MAGIC/USD price
    handleMagicUSDUpdated(createAnswerUpdatedEvent("150000000"));

    // Sync pair
    handleSync(
      createSyncEvent(PAIR, "5000000000000000000", "2500000000000000000000")
    );

    assert.fieldEquals("Pair", PAIR, "reserve0", "5");
    assert.fieldEquals("Pair", PAIR, "reserve1", "2500");
    assert.fieldEquals("Token", TOKEN0, "derivedMAGIC", "500");
    assert.fieldEquals(
      "Token",
      MAGIC_ADDRESS.toHexString(),
      "derivedMAGIC",
      "1"
    );
    assert.fieldEquals("Pair", PAIR, "reserveUSD", "7500");
  });
});

describe("handleTransfer()", () => {
  beforeEach(() => {
    clearStore();
  });

  test("should increase total supply on mints", () => {
    // Create pair
    handlePairCreated(createPairCreatedEvent());

    // Mint tokens
    handleTransfer(
      createTransferEvent(
        PAIR,
        Address.zero().toHexString(),
        USER1,
        "1000000000000000000"
      )
    );
    handleTransfer(
      createTransferEvent(
        PAIR,
        Address.zero().toHexString(),
        USER2,
        "1000000000000000000"
      )
    );

    assert.fieldEquals("Pair", PAIR, "totalSupply", "2000000000000000000");
  });

  test("should decrease total supply on burns", () => {
    // Create pair
    handlePairCreated(createPairCreatedEvent());

    // Mint tokens
    handleTransfer(
      createTransferEvent(
        PAIR,
        Address.zero().toHexString(),
        USER1,
        "1000000000000000000"
      )
    );

    // Burn tokens
    handleTransfer(
      createTransferEvent(PAIR, USER1, PAIR, "500000000000000000")
    );
    handleTransfer(
      createTransferEvent(
        PAIR,
        PAIR,
        Address.zero().toHexString(),
        "500000000000000000"
      )
    );

    assert.fieldEquals("Pair", PAIR, "totalSupply", "500000000000000000");
  });

  test("should ignore transfers that aren't mints or burns", () => {
    // Create pair
    handlePairCreated(createPairCreatedEvent());

    // Transfer tokens
    handleTransfer(
      createTransferEvent(PAIR, USER1, USER2, "1000000000000000000")
    );

    assert.fieldEquals("Pair", PAIR, "totalSupply", "0");
  });
});

describe("handleMint()", () => {
  beforeEach(() => {
    clearStore();
  });

  test("should fill deposit transaction with amounts", () => {
    // Create MAGIC pair
    handlePairCreated(
      createPairCreatedEvent(TOKEN0, MAGIC_ADDRESS.toHexString(), PAIR)
    );

    // Set MAGIC/USD price
    handleMagicUSDUpdated(createAnswerUpdatedEvent("150000000"));

    // Sync pair
    handleSync(
      createSyncEvent(PAIR, "5000000000000000000", "2500000000000000000000")
    );

    // Mint tokens
    handleTransfer(
      createTransferEvent(
        PAIR,
        Address.zero().toHexString(),
        USER1,
        "1000000000000000000",
        TX_HASH1
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

    assert.fieldEquals("Token", TOKEN0, "txCount", "1");
    assert.fieldEquals("Token", MAGIC_ADDRESS.toHexString(), "txCount", "1");
    assert.fieldEquals("Pair", PAIR, "txCount", "1");
    assert.fieldEquals(
      "Factory",
      MAGICSWAP_V2_FACTORY_ADDRESS.toHexString(),
      "txCount",
      "1"
    );
    assert.fieldEquals("Transaction", TX_HASH1, "type", "Deposit");
    assert.fieldEquals("Transaction", TX_HASH1, "user", USER1);
    assert.fieldEquals("Transaction", TX_HASH1, "pair", PAIR);
    assert.fieldEquals("Transaction", TX_HASH1, "amount0", "1");
    assert.fieldEquals("Transaction", TX_HASH1, "amount1", "500");
    assert.fieldEquals("Transaction", TX_HASH1, "amountUSD", "1500");
  });
});

describe("handleBurn()", () => {
  beforeEach(() => {
    clearStore();
  });

  test("should fill withdrawal transaction with amounts", () => {
    // Create MAGIC pair
    handlePairCreated(
      createPairCreatedEvent(TOKEN0, MAGIC_ADDRESS.toHexString(), PAIR)
    );

    // Set MAGIC/USD price
    handleMagicUSDUpdated(createAnswerUpdatedEvent("150000000"));

    // Sync pair
    handleSync(
      createSyncEvent(PAIR, "5000000000000000000", "2500000000000000000000")
    );

    // Mint tokens
    handleTransfer(
      createTransferEvent(
        PAIR,
        Address.zero().toHexString(),
        USER1,
        "1000000000000000000",
        TX_HASH1
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

    // Burn tokens
    handleTransfer(
      createTransferEvent(PAIR, USER1, PAIR, "500000000000000000", TX_HASH2)
    );
    handleTransfer(
      createTransferEvent(
        PAIR,
        PAIR,
        Address.zero().toHexString(),
        "500000000000000000",
        TX_HASH2
      )
    );
    handleBurn(
      createBurnEvent(
        PAIR,
        USER1,
        "500000000000000000",
        "250000000000000000000",
        USER1,
        TX_HASH2
      )
    );

    assert.fieldEquals("Token", TOKEN0, "txCount", "2");
    assert.fieldEquals("Token", MAGIC_ADDRESS.toHexString(), "txCount", "2");
    assert.fieldEquals("Pair", PAIR, "txCount", "2");
    assert.fieldEquals(
      "Factory",
      MAGICSWAP_V2_FACTORY_ADDRESS.toHexString(),
      "txCount",
      "2"
    );
    assert.fieldEquals("Transaction", TX_HASH2, "type", "Withdrawal");
    assert.fieldEquals("Transaction", TX_HASH2, "user", USER1);
    assert.fieldEquals("Transaction", TX_HASH2, "pair", PAIR);
    assert.fieldEquals("Transaction", TX_HASH2, "amount0", "0.5");
    assert.fieldEquals("Transaction", TX_HASH2, "amount1", "250");
    assert.fieldEquals("Transaction", TX_HASH2, "amountUSD", "750");
  });
});
