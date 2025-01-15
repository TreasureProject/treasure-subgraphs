import { Address, BigInt } from "@graphprotocol/graph-ts";

export const ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGINT_ONE = BigInt.fromI32(1);

// Event types
export const EVENT_BUY = "BUY";
export const EVENT_SELL = "SELL";
export const EVENT_GRADUATE = "GRADUATE";
export const EVENT_MEMEMADE = "MEMEMADE";

// Transaction types
export const TX_TYPE_BUY = "BUY";
export const TX_TYPE_SELL = "SELL";
export const TX_TYPE_GRADUATE = "GRADUATE";

// Base configuration
export const DECIMALS = 18;
export const IS_ERC1155 = true;

// Price precision
export const PRICE_PRECISION = BigInt.fromI32(1000000); // 6 decimals
export const DEFAULT_TOKEN_ID = BigInt.fromI32(0); // ERC1155 default token ID

// Token configuration
export const BASE_TOKEN_SYMBOL = "WETH";
export const BASE_TOKEN_DECIMALS = 18;
