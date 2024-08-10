import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";

import {
  MAGICSWAP_V2_FACTORY_ADDRESS,
  MAGIC_ADDRESS,
  WETH_ADDRESS,
} from "@treasure/constants";

import { ERC20 } from "../generated/MagicswapV2UniswapV2Factory/ERC20";
import {
  Collection,
  DayData,
  Factory,
  Global,
  HourData,
  LiquidityPosition,
  Pair,
  PairDayData,
  PairHourData,
  Token,
  Transaction,
  User,
  VaultReserveItem,
} from "../generated/schema";
import { ONE_BD, ONE_BI, ZERO_BD, ZERO_BI } from "./const";
import { exponentToBigDecimal } from "./utils";

export const NFT_TYPES = ["ERC721", "ERC1155"];

export const getOrCreateGlobal = (): Global => {
  const id = Bytes.fromI32(1);
  let global = Global.load(id);
  if (!global) {
    global = new Global(id);
    global.userCount = ZERO_BI;
    global.magicUSD = ZERO_BD;
  }

  return global;
};

export const getOrCreateFactory = (address: Bytes): Factory => {
  let factory = Factory.load(address);
  if (!factory) {
    const isV2 = address.equals(MAGICSWAP_V2_FACTORY_ADDRESS);
    factory = new Factory(address);
    factory.address = address;
    factory.version = isV2 ? "V2" : "V1";
    factory.pairCount = ZERO_BI;
    factory.volumeUSD = ZERO_BD;
    factory.reserveUSD = ZERO_BD;
    factory.reserveNFT = ZERO_BD;
    factory.txCount = ZERO_BI;
    factory.lpFee = isV2 ? ZERO_BD : BigDecimal.fromString("0.00375");
    factory.protocolFee = isV2 ? ZERO_BD : BigDecimal.fromString("0.00125");
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

    const global = getOrCreateGlobal();
    global.userCount = global.userCount.plus(ONE_BI);
    global.save();
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

const setTokenContractData = (token: Token): void => {
  const address = Address.fromBytes(token.id);
  const contract = ERC20.bind(address);

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
    token.isMAGIC = address.equals(MAGIC_ADDRESS);
    token.isETH = address.equals(WETH_ADDRESS);
    token.magicPairs = [];
    token.volume = ZERO_BD;
    token.volumeUSD = ZERO_BD;
    token.txCount = ZERO_BI;
    token.derivedMAGIC = ZERO_BD;
    token.save();
  }

  return token;
};

export const getOrCreateVaultReserveItem = (
  vault: Address,
  collection: Address,
  tokenId: BigInt
): VaultReserveItem => {
  const reserveItemId = vault.concat(collection).concatI32(tokenId.toI32());
  let reserveItem = VaultReserveItem.load(reserveItemId);
  if (!reserveItem) {
    reserveItem = new VaultReserveItem(reserveItemId);
    reserveItem.vault = vault;
    reserveItem.collection = collection;
    reserveItem.tokenId = tokenId;
    reserveItem.amount = 0;
  }

  return reserveItem;
};

export const getOrCreateTransaction = (event: ethereum.Event): Transaction => {
  let transaction = Transaction.load(event.transaction.hash);
  if (!transaction) {
    transaction = new Transaction(event.transaction.hash);
    transaction.hash = event.transaction.hash;
    transaction.timestamp = event.block.timestamp;
    transaction.amount0 = ZERO_BD;
    transaction.amount1 = ZERO_BD;
    transaction.amountUSD = ZERO_BD;
    transaction.save();
  }

  return transaction;
};

export const getDerivedMagic = (token: Token): BigDecimal => {
  if (token.isMAGIC) {
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
    if (pair.reserve0.equals(ZERO_BD)) {
      return ZERO_BD;
    }

    return pair.reserve1.div(pair.reserve0);
  }

  if (pair.reserve1.equals(ZERO_BD)) {
    return ZERO_BD;
  }

  return pair.reserve0.div(pair.reserve1);
};

export const timestampToHour = (timestamp: BigInt): BigInt =>
  BigInt.fromI32((timestamp.toI32() / 3600) * 3600);

export const timestampToDate = (timestamp: BigInt): BigInt =>
  BigInt.fromI32((timestamp.toI32() / 86400) * 86400);

export const updateHourData = (
  factory: Factory,
  timestamp: BigInt
): HourData => {
  const date = timestampToHour(timestamp);
  const id = Bytes.fromI32(date.toI32());
  let hourData = HourData.load(id);
  if (!hourData) {
    hourData = new HourData(id);
    hourData.date = date;
    hourData.volumeUSD = ZERO_BD;
  }

  hourData.reserveUSD = factory.reserveUSD;
  hourData.reserveNFT = factory.reserveNFT;
  hourData.txCount = factory.txCount;
  hourData.save();

  return hourData;
};

export const updateDayData = (factory: Factory, timestamp: BigInt): DayData => {
  const date = timestampToDate(timestamp);
  const id = Bytes.fromI32(date.toI32());
  let dayData = DayData.load(id);
  if (!dayData) {
    dayData = new DayData(id);
    dayData.date = date;
    dayData.volumeUSD = ZERO_BD;
  }

  dayData.reserveUSD = factory.reserveUSD;
  dayData.reserveNFT = factory.reserveNFT;
  dayData.txCount = factory.txCount;
  dayData.save();

  return dayData;
};

export const updatePairHourData = (
  pair: Pair,
  timestamp: BigInt
): PairHourData => {
  const date = timestampToHour(timestamp);
  const id = pair.id.concatI32(date.toI32());
  let pairHourData = PairHourData.load(id);
  if (!pairHourData) {
    pairHourData = new PairHourData(id);
    pairHourData.pair = pair.id;
    pairHourData.date = date;
    pairHourData.volume0 = ZERO_BD;
    pairHourData.volume1 = ZERO_BD;
    pairHourData.volumeUSD = ZERO_BD;
    pairHourData.txCount = ZERO_BI;
  }

  pairHourData.reserve0 = pair.reserve0;
  pairHourData.reserve1 = pair.reserve1;
  pairHourData.reserveUSD = pair.reserveUSD;
  pairHourData.totalSupply = pair.totalSupply;
  pairHourData.txCount = pairHourData.txCount.plus(ONE_BI);
  pairHourData.save();

  return pairHourData;
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

export const getMagicUSD = (): BigDecimal => {
  const global = getOrCreateGlobal();
  return global.magicUSD;
};
