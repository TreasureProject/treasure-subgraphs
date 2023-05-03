import {
  assert,
  beforeEach,
  clearStore,
  describe,
  newMockEvent,
  test,
} from "matchstick-as";

import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  MAGICSWAP_V2_FACTORY_ADDRESS,
  MAGIC_ADDRESS,
} from "@treasure/constants";

import { PairCreated } from "../generated/UniswapV2Factory/UniswapV2Factory";
import {
  Mint,
  Sync,
  Transfer,
} from "../generated/templates/UniswapV2Pair/UniswapV2Pair";
import {
  handleMint,
  handlePairCreated,
  handleSync,
  handleTransfer,
} from "../src/mappings/pair";
import { handleMagicUsdUpdated } from "../src/mappings/price";
import { createAnswerUpdatedEvent } from "./helpers/price";
import { mockToken } from "./helpers/token";

const TOKEN0 = "0x0000000000000000000000000000000000000001";
const TOKEN1 = "0x0000000000000000000000000000000000000002";
const PAIR = "0x1000000000000000000000000000000000000000";
const USER1 = "0x5d701784243802202403a44e5831f491cfd2a402";
const USER2 = "0xd9d465f742393c14ab92a70412c5b8dbd6ee5ace";
const TX_HASH1 =
  "0x340d87d1573243d505e3082393e738203210688dfbe62e8712ad74c9fcf7e23b";
const TX_HASH2 =
  "0xd4c1ca41a78d1bb725b91db096b1cc7b29134d64f582106d3b93adaaebb12cd8";

mockToken(TOKEN0, "Token 0", "TK0");
mockToken(TOKEN1, "Token 1", "TK1");
mockToken(MAGIC_ADDRESS.toHexString(), "Magic Token", "MAGIC");

const createPairCreatedEvent = (
  token0: string = TOKEN0,
  token1: string = TOKEN1,
  pair: string = PAIR
): PairCreated => {
  const event = changetype<PairCreated>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam(
      "token0",
      ethereum.Value.fromAddress(Address.fromString(token0))
    ),
    new ethereum.EventParam(
      "token1",
      ethereum.Value.fromAddress(Address.fromString(token1))
    ),
    new ethereum.EventParam(
      "pair",
      ethereum.Value.fromAddress(Address.fromString(pair))
    ),
    new ethereum.EventParam("param3", ethereum.Value.fromI32(0)),
  ];

  return event;
};

const createSyncEvent = (
  pair: string,
  reserve0: string,
  reserve1: string
): Sync => {
  const event = changetype<Sync>(newMockEvent());
  event.address = Address.fromString(pair);
  event.parameters = [
    new ethereum.EventParam(
      "reserve0",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(reserve0))
    ),
    new ethereum.EventParam(
      "reserve1",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(reserve1))
    ),
  ];
  return event;
};

const createTransferEvent = (
  pair: string,
  from: string,
  to: string,
  value: string,
  hash: string = TX_HASH1
): Transfer => {
  const event = changetype<Transfer>(newMockEvent());
  event.address = Address.fromString(pair);
  event.transaction.hash = Bytes.fromHexString(hash);
  event.parameters = [
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam(
      "value",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(value))
    ),
  ];
  return event;
};

const createMintEvent = (
  pair: string,
  from: string,
  amount0: string,
  amount1: string,
  hash: string = TX_HASH1
): Mint => {
  const event = changetype<Mint>(newMockEvent());
  event.address = Address.fromString(pair);
  event.transaction.hash = Bytes.fromHexString(hash);
  event.parameters = [
    new ethereum.EventParam(
      "sender",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "amount0",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(amount0))
    ),
    new ethereum.EventParam(
      "amount1",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(amount1))
    ),
  ];
  return event;
};

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
    handleMagicUsdUpdated(createAnswerUpdatedEvent("150000000"));

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

  test("should create deposit transaction on mint", () => {
    // Create pair
    handlePairCreated(createPairCreatedEvent());

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

    assert.entityCount("Transaction", 1);
    assert.fieldEquals("Transaction", TX_HASH1, "type", "Deposit");
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
      createTransferEvent(
        PAIR,
        PAIR,
        Address.zero().toHexString(),
        "500000000000000000"
      )
    );

    assert.fieldEquals("Pair", PAIR, "totalSupply", "500000000000000000");
  });

  test("should create withdrawal transaction on burn", () => {
    // Create pair
    handlePairCreated(createPairCreatedEvent());

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

    // Burn tokens
    handleTransfer(
      createTransferEvent(
        PAIR,
        PAIR,
        Address.zero().toHexString(),
        "500000000000000000",
        TX_HASH2
      )
    );

    assert.entityCount("Transaction", 2);
    assert.fieldEquals("Transaction", TX_HASH2, "type", "Withdrawal");
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
    handleMagicUsdUpdated(createAnswerUpdatedEvent("150000000"));

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
    assert.fieldEquals("Transaction", TX_HASH1, "amount0", "1");
    assert.fieldEquals("Transaction", TX_HASH1, "amount1", "500");
    assert.fieldEquals("Transaction", TX_HASH1, "amountUSD", "1500");
  });
});
