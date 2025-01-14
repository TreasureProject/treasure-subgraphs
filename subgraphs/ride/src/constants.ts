import { BigInt, Address } from '@graphprotocol/graph-ts';

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000');
export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGINT_ONE = BigInt.fromI32(1);

// Contract addresses (Base)
export const PRESALE_ADDRESS = '0x0a11BeaE0B414fC8F559069B5A48C64281c7Bb76'; // BASE CONTRACT
export const MAGICSWAP_ROUTER = '0xb740D5804eA2061432469119cfa40cbb4586dd17'; // BASE MAGICSWAP ROUTER CONTRACT
export const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'; // BASE WETH
export const VAULT_FACTORY_ADDRESS = '0x1638230ccE426ad403D6ef1538629a0490f931dd' // BASE Vault Factory
// Event types
export const EVENT_BUY = 'BUY';
export const EVENT_SELL = 'SELL';
export const EVENT_GRADUATE = 'GRADUATE';
export const EVENT_MEMEMADE = 'MEMEMADE';

// Transaction types
export const TX_TYPE_BUY = 'BUY';
export const TX_TYPE_SELL = 'SELL';
export const TX_TYPE_GRADUATE = 'GRADUATE';

// Base configuration
export const DECIMALS = 18;
export const IS_ERC1155 = true;

// Price precision
export const PRICE_PRECISION = BigInt.fromI32(1000000); // 6 decimals
export const DEFAULT_TOKEN_ID = BigInt.fromI32(0); // ERC1155 default token ID

// Token configuration
export const BASE_TOKEN_SYMBOL = 'WETH';
export const BASE_TOKEN_DECIMALS = 18;
