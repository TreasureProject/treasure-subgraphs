import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";

import {
  MAGICSWAP_V2_FACTORY_ADDRESS,
  MAGIC_ADDRESS,
} from "@treasure/constants";

import { ERC20 } from "../generated/UniswapV2Factory/ERC20";
import {
  Collection,
  DayData,
  Factory,
  LiquidityPosition,
  Pair,
  PairDayData,
  Token,
  User,
} from "../generated/schema";
import { ONE_BD, ONE_BI, ZERO_BD, ZERO_BI } from "./const";
import { exponentToBigDecimal } from "./utils";

export const NFT_TYPES = ["ERC721", "ERC1155"];

export const getOrCreateFactory = (): Factory => {
  let factory = Factory.load(MAGICSWAP_V2_FACTORY_ADDRESS);
  if (!factory) {
    factory = new Factory(MAGICSWAP_V2_FACTORY_ADDRESS);
    factory.pairCount = ZERO_BI;
    factory.volumeUSD = ZERO_BD;
    factory.reserveUSD = ZERO_BD;
    factory.reserveNFT = ZERO_BD;
    factory.txCount = ZERO_BI;
    factory.userCount = ZERO_BI;
    factory.magicUSD = ZERO_BD;
    factory.lpFee = ZERO_BD;
    factory.protocolFee = ZERO_BD;
    factory.save();
  }

  return factory;
};

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
    user.liquidityPositionCount = ZERO_BI;
    user.save();

    const factory = getOrCreateFactory();
    factory.userCount = factory.userCount.plus(ONE_BI);
    factory.save();
  }

  return user;
};

export const getOrCreateLiquidityPosition = (
  pair: Pair,
  user: User
): LiquidityPosition => {
  const id = pair.id.concat(user.id);
  let liquidityPosition = LiquidityPosition.load(id);
  if (!liquidityPosition) {
    liquidityPosition = new LiquidityPosition(id);
    liquidityPosition.pair = pair.id;
    liquidityPosition.user = user.id;
    liquidityPosition.balance = ZERO_BI;
    liquidityPosition.save();
  }

  return liquidityPosition;
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
    token.isNFT = false;
    token.magicPairs = [];
    token.volume = ZERO_BD;
    token.volumeUSD = ZERO_BD;
    token.txCount = ZERO_BI;
    token.derivedMAGIC = ZERO_BD;
    token.save();
  }

  return token;
};

export const isMagic = (token: Token): bool => token.id.equals(MAGIC_ADDRESS);

export const getDerivedMagic = (token: Token): BigDecimal => {
  if (isMagic(token)) {
    return ONE_BD;
  }

  if (token.magicPairs.length == 0) {
    return ZERO_BD;
  }

  const pair = Pair.load(token.magicPairs[0]);
  if (!pair) {
    return ZERO_BD;
  }

  if (pair.token0.equals(token.id)) {
    return pair.reserve1.div(pair.reserve0);
  }

  return pair.reserve0.div(pair.reserve1);
};

export const timestampToDate = (timestamp: BigInt): BigInt =>
  BigInt.fromI32((timestamp.toI32() / 86400) * 86400);

export const updateDayData = (timestamp: BigInt): DayData => {
  const date = timestampToDate(timestamp);
  const id = Bytes.fromI32(date.toI32());
  let dayData = DayData.load(id);
  if (!dayData) {
    dayData = new DayData(id);
    dayData.date = date;
    dayData.volumeUSD = ZERO_BD;
  }

  const factory = getOrCreateFactory();
  dayData.reserveUSD = factory.reserveUSD;
  dayData.reserveNFT = factory.reserveNFT;
  dayData.txCount = factory.txCount;
  dayData.save();

  return dayData;
};

export const updatePairDayData = (
  pair: Pair,
  timestamp: BigInt
): PairDayData => {
  const date = timestampToDate(timestamp);
  const id = pair.id.concatI32(date.toI32());
  let pairDayData = PairDayData.load(id);
  if (!pairDayData) {
    pairDayData = new PairDayData(id);
    pairDayData.pair = pair.id;
    pairDayData.date = date;
    pairDayData.volume0 = ZERO_BD;
    pairDayData.volume1 = ZERO_BD;
    pairDayData.volumeUSD = ZERO_BD;
    pairDayData.txCount = ZERO_BI;
  }

  pairDayData.reserve0 = pair.reserve0;
  pairDayData.reserve1 = pair.reserve1;
  pairDayData.reserveUSD = pair.reserveUSD;
  pairDayData.totalSupply = pair.totalSupply;
  pairDayData.txCount = pairDayData.txCount.plus(ONE_BI);
  pairDayData.save();

  return pairDayData;
};
