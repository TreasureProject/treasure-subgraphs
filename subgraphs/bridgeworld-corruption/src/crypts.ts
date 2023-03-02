import { Address, BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import {
  ConfigUpdated,
  GlobalRandomnessRequested,
  LegionSquadMoved,
  LegionSquadRemoved,
  LegionSquadStaked,
  LegionSquadUnstaked,
  MapTilePlaced,
  MapTileRemovedFromBoard,
  MapTileRemovedFromHand,
  MapTilesClaimed,
  MapTilesInitialized,
  TempleCreated,
  TempleEntered,
  TreasureClaimed,
} from "../generated/CorruptionCrypts/CorruptionCrypts";
import { LegionSquadStaked as CharacterSquadStaked } from "../generated/CorruptionCryptsV2/CorruptionCryptsV2";
import {
  CryptsMapTile,
  CryptsSquad,
  CryptsTemple,
  CryptsUserMapTile,
} from "../generated/schema";
import {
  bytesFromBigInt,
  getOrCreateBoardTreasureFragment,
  getOrCreateConfig,
  getOrCreateCryptsSquadCharacter,
  getOrCreateUser,
} from "./helpers";

export function handleConfigUpdated(event: ConfigUpdated): void {
  const params = event.params._newConfig;
  const config = getOrCreateConfig();
  config.cryptsSecondsInEpoch = params.secondsInEpoch;
  config.cryptsLegionsUnstakeCooldown = params.legionUnstakeCooldown;
  config.maxLegionsInCryptsTemple =
    params.numLegionsReachedTempleToAdvanceRound.toI32();
  config.maxCryptsSquadsPerUser = params.maximumLegionSquadsOnBoard.toI32();
  config.maxLegionsPerCryptsSquad = params.maximumLegionsInSquad.toI32();
  config.maxCryptsMapTilesInHand = params.maxMapTilesInHand.toI32();
  config.maxCryptsMapTilesOnBoard = params.maxMapTilesOnBoard.toI32();
  config.minimumDistanceFromTempleForCryptsLegionSquad =
    params.minimumDistanceFromTempleForLegionSquad.toI32();
  config.save();
}

export function handleTempleCreated(event: TempleCreated): void {
  const params = event.params;
  const temple = new CryptsTemple(Bytes.fromI32(params.thisTempleId));
  temple.templeId = params.thisTempleId;
  temple.address = params._thisHarvester;
  temple.positionX = -1;
  temple.positionY = -1;
  temple.save();
}

export function handleGlobalRandomnessRequested(
  event: GlobalRandomnessRequested
): void {
  const params = event.params;
  const config = getOrCreateConfig();
  config.cryptsRequestId = bytesFromBigInt(params._globalRequestId);
  config.cryptsRound = params._roundId.toI32();
  config.cryptsRoundStarting = true;
  config.cryptsRoundStartTime = event.block.timestamp;
  config.cryptsLegionsReachedTemple = 0;
  config.save();
}

const handleSquadStaked = (
  user: Address,
  timestamp: BigInt,
  targetTemple: i32,
  squadId: BigInt,
  squadName: string,
  characterCollections: Address[],
  characterTokenIds: BigInt[]
): void => {
  const temple = CryptsTemple.load(Bytes.fromI32(targetTemple));
  if (!temple) {
    log.error("[crypts] Squad staked targeting unknown temple: {}", [
      targetTemple.toString(),
    ]);
    return;
  }

  const squad = new CryptsSquad(bytesFromBigInt(squadId));
  squad.squadId = squadId;
  squad.user = getOrCreateUser(user).id;
  squad.stakedTimestamp = timestamp;
  squad.targetTemple = temple.id;
  squad.name = squadName;
  squad.positionX = -1;
  squad.positionY = -1;
  squad.lastRoundInTemple = -1;

  let characters: Bytes[] = [];
  for (let i = 0; i < characterCollections.length; i += 1) {
    characters.push(
      getOrCreateCryptsSquadCharacter(
        characterCollections[i],
        characterTokenIds[i]
      ).id
    );
  }

  squad.characters = characters;
  squad.save();
};

export function handleLegionSquadStaked(event: LegionSquadStaked): void {
  const params = event.params;
  handleSquadStaked(
    params._user,
    event.block.timestamp,
    params._targetTemple,
    params._legionSquadId,
    params._legionSquadName,
    params._legionIds.map<Address>(() => LEGION_ADDRESS),
    params._legionIds
  );
}

export function handleCharacterSquadStaked(event: CharacterSquadStaked): void {
  const params = event.params;
  handleSquadStaked(
    params._user,
    event.block.timestamp,
    params._targetTemple,
    params._legionSquadId,
    params._legionSquadName,
    params._characters.map<Address>((character) => character.collection),
    params._characters.map<BigInt>((character) => character.tokenId)
  );
}

export function handleLegionSquadMoved(event: LegionSquadMoved): void {
  const params = event.params;
  const squad = CryptsSquad.load(bytesFromBigInt(params._legionSquadId));
  if (!squad) {
    log.error("[crypts] Received move for unknown Legion squad: {}", [
      params._legionSquadId.toString(),
    ]);
    return;
  }

  squad.positionX = params._finalCoordinate.x;
  squad.positionY = params._finalCoordinate.y;
  squad.save();
}

export function handleLegionSquadRemoved(event: LegionSquadRemoved): void {
  const squad = CryptsSquad.load(bytesFromBigInt(event.params._legionSquadId));
  if (!squad) {
    log.error("[crypts] Removing unknown Legion squad: {}", [
      event.params._legionSquadId.toString(),
    ]);
    return;
  }

  squad.positionX = -1;
  squad.positionY = -1;
  squad.save();
}

export function handleLegionSquadUnstaked(event: LegionSquadUnstaked): void {
  const params = event.params;

  const config = getOrCreateConfig();
  const user = getOrCreateUser(params._user);
  user.cryptsCooldownExpirationTime = event.block.timestamp.plus(
    config.cryptsLegionsUnstakeCooldown
  );
  user.save();

  store.remove(
    "CryptsSquad",
    bytesFromBigInt(event.params._legionSquadId).toHexString()
  );
}

export function handleMapTilesInitialized(event: MapTilesInitialized): void {
  const mapTiles = event.params._mapTiles;
  for (let i = 0; i < mapTiles.length; i += 1) {
    const id = Bytes.fromI32(mapTiles[i].mapTileType);
    let mapTile = CryptsMapTile.load(id);
    if (!mapTile) {
      mapTile = new CryptsMapTile(id);
      mapTile.mapTileType = mapTiles[i].mapTileType;
      mapTile.moves = mapTiles[i].moves;
      mapTile.north = mapTiles[i].north;
      mapTile.east = mapTiles[i].east;
      mapTile.south = mapTiles[i].south;
      mapTile.west = mapTiles[i].west;
      mapTile.save();
    }
  }
}

export function handleMapTilesClaimed(event: MapTilesClaimed): void {
  const params = event.params;
  const user = getOrCreateUser(params._user);
  for (let i = 0; i < params._mapTiles.length; i += 1) {
    const mapTile = CryptsMapTile.load(
      Bytes.fromI32(params._mapTiles[i].mapTileType)
    );
    if (!mapTile) {
      log.error("[crypts] Claiming unknown map tile: {}", [
        params._mapTiles[i].mapTileType.toString(),
      ]);
      continue;
    }

    const userMapTile = new CryptsUserMapTile(
      bytesFromBigInt(params._mapTiles[i].mapTileId)
    );
    userMapTile.userMapTileId = params._mapTiles[i].mapTileId;
    userMapTile.user = user.id;
    userMapTile.mapTile = mapTile.id;
    userMapTile.positionX = -1;
    userMapTile.positionY = -1;
    userMapTile.save();
  }
}

export function handleMapTilePlaced(event: MapTilePlaced): void {
  const params = event.params;
  const userMapTile = CryptsUserMapTile.load(
    bytesFromBigInt(params._mapTile.mapTileId)
  );
  if (!userMapTile) {
    log.error("[crypts] Received placement for unknown map tile: {}", [
      params._mapTile.mapTileId.toString(),
    ]);
    return;
  }

  userMapTile.positionX = params._coordinate.x;
  userMapTile.positionY = params._coordinate.y;
  userMapTile.placedBlockNumber = event.block.number;
  userMapTile.placedIndex = event.transactionLogIndex.toI32();
  userMapTile.save();
}

export function handleMapTileRemovedFromBoard(
  event: MapTileRemovedFromBoard
): void {
  store.remove(
    "CryptsUserMapTile",
    bytesFromBigInt(event.params._mapTileId).toHexString()
  );
}

export function handleMapTileRemovedFromHand(
  event: MapTileRemovedFromHand
): void {
  const params = event.params;
  if (!params._isBeingPlaced) {
    store.remove(
      "CryptsUserMapTile",
      bytesFromBigInt(params._mapTileId).toHexString()
    );
  }
}

export function handleTempleEntered(event: TempleEntered): void {
  const params = event.params;
  const squad = CryptsSquad.load(bytesFromBigInt(params._legionSquadId));
  if (!squad) {
    log.error("[crypts] Unknown Legion squad entering temple: {}", [
      params._legionSquadId.toString(),
    ]);
    return;
  }

  squad.lastRoundInTemple = params._roundId.toI32();
  squad.save();

  const config = getOrCreateConfig();
  config.cryptsLegionsReachedTemple += squad.characters.length;
  config.save();
}

export function handleTreasureClaimed(event: TreasureClaimed): void {
  const boardTreasureFragment = getOrCreateBoardTreasureFragment();
  boardTreasureFragment.numClaimed +=
    event.params._treasureFragmentsEmitted.toI32();
  boardTreasureFragment.save();
}
