import { Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  ConfigUpdated,
  GlobalRandomnessRequested,
  LegionSquadMoved,
  LegionSquadRemoved,
  LegionSquadStaked,
  LegionSquadUnstaked,
  MapTilePlaced,
  MapTilesClaimed,
  MapTilesInitialized,
  TempleCreated,
  TempleEntered,
} from "../generated/CorruptionCrypts/CorruptionCrypts";
import {
  CryptsMapTile,
  CryptsSquad,
  CryptsTemple,
  CryptsUserMapTile,
} from "../generated/schema";
import { bytesFromBigInt, getOrCreateConfig, getOrCreateUser } from "./helpers";

export function handleConfigUpdated(event: ConfigUpdated): void {
  const params = event.params._newConfig;
  const config = getOrCreateConfig();
  config.cryptsLegionsUnstakeCooldown = params.legionUnstakeCooldown;
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
  config.save();
}

export function handleLegionSquadStaked(event: LegionSquadStaked): void {
  const params = event.params;
  const temple = CryptsTemple.load(Bytes.fromI32(params._targetTemple));
  if (!temple) {
    log.error("[crypts] Squad staked targeting unknown temple: {}", [
      params._targetTemple.toString(),
    ]);
    return;
  }

  const squad = new CryptsSquad(bytesFromBigInt(params._legionSquadId));
  squad.squadId = params._legionSquadId;
  squad.user = getOrCreateUser(params._user).id;
  squad.legionTokenIds = params._legionIds.map<i32>((value) => value.toI32());
  squad.stakedTimestamp = event.block.timestamp;
  squad.targetTemple = temple.id;
  squad.name = params._legionSquadName;
  squad.positionX = -1;
  squad.positionY = -1;
  squad.inTemple = false;
  squad.save();
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
  userMapTile.save();
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

  squad.inTemple = true;
  squad.save();
}
