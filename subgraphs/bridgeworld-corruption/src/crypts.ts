import { Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  ConfigUpdated,
  GlobalRandomnessRequested,
  LegionSquadAdded,
  LegionSquadMoved,
  LegionSquadRemoved,
  MapTilePlaced,
  MapTilesClaimed,
  MapTilesInitialized,
  TempleEntered,
  TreasureClaimed,
} from "../generated/CorruptionCrypts/CorruptionCrypts";
import {
  CryptsMapTile,
  CryptsSquad,
  CryptsUserMapTile,
} from "../generated/schema";
import {
  bigNumberToBytes,
  getOrCreateConfig,
  getOrCreateUser,
  getOrCreateUserMapTile,
  getOrCreateUserRound,
} from "./helpers";

export function handleConfigUpdated(event: ConfigUpdated): void {
  const params = event.params._newConfig;
  const config = getOrCreateConfig();
  config.cryptsLegionsUnstakeCooldown = params.legionUnstakeCooldown;
  config.maxCryptsSquadsPerUser = params.maximumLegionSquadsOnBoard.toI32();
  config.maxLegionsPerCryptsSquad = params.maximumLegionsInSquad.toI32();
  config.maxCryptsMapTilesInHand = params.maxMapTilesInHand.toI32();
  config.maxCryptsMapTilesOnBoard = params.maxMapTilesOnBoard.toI32();
  config.save();
}

export function handleGlobalRandomnessRequested(
  event: GlobalRandomnessRequested
): void {
  const params = event.params;
  const config = getOrCreateConfig();
  config.cryptsRequestId = bigNumberToBytes(params._globalRequestId);
  config.cryptsRound = params._roundId.toI32();
  config.save();
}

export function handleLegionSquadAdded(event: LegionSquadAdded): void {
  const params = event.params;
  const squad = new CryptsSquad(bigNumberToBytes(params._legionSquadId));
  squad.squadId = params._legionSquadId;
  squad.user = getOrCreateUser(params._user).id;
  squad.legionTokenIds = params._legionIds;
  squad.stakedTimestamp = event.block.timestamp;
  squad.targetTemple = params._targetTemple;
  squad.positionX = -1;
  squad.positionY = -1;
  squad.inTemple = false;
  squad.save();
}

export function handleLegionSquadMoved(event: LegionSquadMoved): void {
  const params = event.params;
  const squad = CryptsSquad.load(bigNumberToBytes(params._legionSquadId));
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
  store.remove(
    "CryptsSquad",
    bigNumberToBytes(event.params._legionSquadId).toString()
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

export function handleMapTilePlaced(event: MapTilePlaced): void {
  const params = event.params;
  const userMapTile = CryptsUserMapTile.load(
    params._user.concat(Bytes.fromI32(params._maptile.mapTileType))
  );
  if (!userMapTile) {
    log.error("[crypts] Received placement for unknown map tile: {}, {}", [
      params._user.toHexString(),
      params._maptile.mapTileType.toString(),
    ]);
    return;
  }

  userMapTile.positionX = params._coordinate.x;
  userMapTile.positionY = params._coordinate.y;
  userMapTile.save();
}

export function handleMapTilesClaimed(event: MapTilesClaimed): void {
  const params = event.params;
  const user = getOrCreateUser(params._user);
  const userMapTiles: Bytes[] = [];
  for (let i = 0; i < params._maptiles.length; i += 1) {
    userMapTiles.push(
      getOrCreateUserMapTile(
        user.id,
        Bytes.fromI32(params._maptiles[i].mapTileType)
      ).id
    );
  }

  const userRound = getOrCreateUserRound(user.id, params._roundId.toI32());
  userRound.mapTiles = userRound.mapTiles.concat(userMapTiles);
  userRound.save();
}

export function handleTempleEntered(event: TempleEntered): void {
  const params = event.params;
  const squad = CryptsSquad.load(bigNumberToBytes(params._legionSquadId));
  if (!squad) {
    log.error("[crypts] Unknown Legion squad entering temple: {}, {}", [
      params._legionSquadId.toString(),
      params._targetTemple.toString(),
    ]);
    return;
  }

  squad.inTemple = true;
  squad.save();
}

export function handleTreasureClaimed(event: TreasureClaimed): void {}
