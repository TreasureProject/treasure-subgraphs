import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";

import { ERC20 } from "../generated/UniswapV2Factory/ERC20";
import { Collection, Token, User } from "../generated/schema";
import { ZERO_BD, ZERO_BI } from "./const";
import { exponentToBigDecimal } from "./utils";

export const NFT_TYPES = ["ERC721", "ERC1155"];

export const getOrCreateCollection = (
  address: Address,
  typeIndex: i32
): Collection => {
  let collection = Collection.load(address);
  if (!collection) {
    collection = new Collection(address);
    collection.type = NFT_TYPES[typeIndex];
    collection.save();
  }

  return collection;
};

export const getOrCreateUser = (address: Address): User => {
  let user = User.load(address);
  if (!user) {
    user = new User(address);
    user.save();
  }

  return user;
};

export const setTokenContractData = (
  token: Token,
  skipNameAndSymbol: bool = false
): void => {
  const address = Address.fromBytes(token.id);
  const contract = ERC20.bind(address);

  if (!skipNameAndSymbol) {
    const nameResult = contract.try_name();
    if (nameResult.reverted) {
      log.error("Error reading token name: {}", [address.toHexString()]);
      token.name = "";
    } else {
      token.name = nameResult.value;
    }

    const symbolResult = contract.try_symbol();
    if (symbolResult.reverted) {
      log.error("Error reading token symbol: {}", [address.toHexString()]);
      token.symbol = "";
    } else {
      token.symbol = symbolResult.value;
    }
  }

  const totalSupplyResult = contract.try_totalSupply();
  if (totalSupplyResult.reverted) {
    log.error("Error reading token total supply: {}", [address.toHexString()]);
    token.totalSupply = ZERO_BI;
  } else {
    token.totalSupply = totalSupplyResult.value;
  }

  const decimalsResult = contract.try_decimals();
  if (decimalsResult.reverted) {
    log.error("Error reading token decimals: {}", [address.toHexString()]);
    token.decimals = ZERO_BI;
    token.decimalDivisor = ZERO_BD;
  } else {
    token.decimals = BigInt.fromI32(decimalsResult.value);
    token.decimalDivisor = exponentToBigDecimal(token.decimals);
  }
};

export const getOrCreateToken = (address: Address): Token => {
  let token = Token.load(address);
  if (!token) {
    token = new Token(address);
    setTokenContractData(token);
    token.save();
  }

  return token;
};
