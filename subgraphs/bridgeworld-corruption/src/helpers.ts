import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  Building,
  Config,
  CryptsBoardTreasureFragment,
  CryptsCharacterHandler,
  CryptsSquadCharacter,
  CryptsUserMapTile,
  User,
} from "../generated/schema";

export const ITEM_TYPES = ["ERC20", "ERC1155"];

export const ITEM_EFFECTS = ["Burn", "MoveToTreasury", "Custom"];

export const SINGLETON_ID = Bytes.fromI32(1);

export const getOrCreateConfig = (): Config => {
  let config = Config.load(SINGLETON_ID);
  if (!config) {
    config = new Config(SINGLETON_ID);
    config.cryptsRound = -1;
    config.cryptsRoundStarting = false;
    config.cryptsRoundStartTime = BigInt.zero();
    config.cryptsSecondsInEpoch = BigInt.zero();
    config.cryptsLegionsUnstakeCooldown = BigInt.zero();
    config.cryptsLegionsReachedTemple = 0;
    config.maxLegionsInCryptsTemple = 3;
    config.maxCryptsSquadsPerUser = 3;
    config.maxLegionsPerCryptsSquad = 20;
    config.maxCryptsMapTilesInHand = 60;
    config.maxCryptsMapTilesOnBoard = 20;
    config.minimumDistanceFromTempleForCryptsLegionSquad = 6;
    config.cryptsCraftRoundResetTimeAllowance = 1800;
    config.cryptsCraftMalevolentPrismsRequired = 1;
    config.cryptsCraftMinimumAuxLegionLevel = 3;
    config.save();
  }

  return config;
};

export const getOrCreateBoardTreasureFragment =
  (): CryptsBoardTreasureFragment => {
    let boardTreasureFragment = CryptsBoardTreasureFragment.load(SINGLETON_ID);
    if (!boardTreasureFragment) {
      boardTreasureFragment = new CryptsBoardTreasureFragment(SINGLETON_ID);
      boardTreasureFragment.tokenId = 0;
      boardTreasureFragment.positionX = -1;
      boardTreasureFragment.positionY = -1;
      boardTreasureFragment.numClaimed = 0;
      boardTreasureFragment.maxSupply = 0;
      boardTreasureFragment.save();
    }

    return boardTreasureFragment;
  };

export const getOrCreateUser = (address: Address): User => {
  let user = User.load(address);
  if (!user) {
    user = new User(address);
    user.save();
  }

  return user;
};

export const getOrCreateBuilding = (address: Address): Building => {
  let building = Building.load(address);
  if (!building) {
    building = new Building(address);
    building.address = address;
    building.ratePerSecond = BigInt.zero();
    building.boost = BigInt.zero();
    building.generatedCorruptionCap = BigInt.zero();
    building.recipes = [];
    building.save();
  }

  return building;
};

export const updateCharacterHandler = (
  collection: Address,
  handler: Address
): CryptsCharacterHandler => {
  let characterHandler = CryptsCharacterHandler.load(collection);
  if (!characterHandler) {
    characterHandler = new CryptsCharacterHandler(collection);
  }

  characterHandler.collection = collection;
  characterHandler.address = handler;
  characterHandler.save();
  return characterHandler;
};

export const getOrCreateUserMapTile = (
  user: Bytes,
  mapTile: Bytes
): CryptsUserMapTile => {
  const id = user.concat(mapTile);
  let userMapTile = CryptsUserMapTile.load(id);
  if (!userMapTile) {
    userMapTile = new CryptsUserMapTile(id);
    userMapTile.user = user;
    userMapTile.mapTile = mapTile;
    userMapTile.positionX = -1;
    userMapTile.positionY = -1;
    userMapTile.save();
  }

  return userMapTile;
};

export const getOrCreateCryptsSquadCharacter = (
  collection: Address,
  tokenId: BigInt
): CryptsSquadCharacter => {
  const id = collection.concat(Bytes.fromI32(tokenId.toI32()));
  let character = CryptsSquadCharacter.load(id);
  if (!character) {
    character = new CryptsSquadCharacter(id);
    character.collection = collection;
    character.tokenId = tokenId.toI32();
    character.save();
  }

  return character;
};

export const decodeTreasureHandlerRequirementData = (
  data: Bytes
): i32[] | null => {
  const decoded = ethereum.decode(`(uint8,uint8)`, data);
  if (!decoded) {
    return null;
  }

  const decodedData = decoded.toTuple();
  return [decodedData[0].toI32(), decodedData[1].toI32()];
};

export const decodeERC1155TokenSetHandlerRequirementData = (
  data: Bytes
): ethereum.Tuple | null => {
  const dataString = data.toHexString().replace("0x", "");
  const decoded = ethereum.decode(
    `(uint256,address,uint256[${dataString.substr(128).length / 64}])`,
    data
  );
  if (!decoded) {
    return null;
  }

  return decoded.toTuple();
};

export const bytesFromBigInt = (bigInt: BigInt): Bytes =>
  Bytes.fromI32(bigInt.toI32());
