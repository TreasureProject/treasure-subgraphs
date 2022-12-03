import { Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  GlobalRandomnessRequested,
  LegionSquadAdded,
  LegionSquadMoved,
  LegionSquadRemoved,
  MapTilePlaced,
  MapTilesClaimed,
  TempleEntered,
  TreasureClaimed,
} from "../generated/CorruptionCrypts/CorruptionCrypts";
import { CryptsSquad, CryptsUserMapTile } from "../generated/schema";
import {
  bigNumberToBytes,
  getOrCreateConfig,
  getOrCreateUser,
  getOrCreateUserEpoch,
  getOrCreateUserMapTile,
} from "./helpers";

export function handleGlobalRandomnessRequested(
  event: GlobalRandomnessRequested
): void {
  const config = getOrCreateConfig();
  config.cryptsRequestId = bigNumberToBytes(event.params._globalRequestId);
  config.save();
}

export function handleLegionSquadAdded(event: LegionSquadAdded): void {
  const params = event.params;
  const squad = new CryptsSquad(bigNumberToBytes(params._legionSquadId));
  squad.squadId = params._legionSquadId;
  squad.user = getOrCreateUser(params._user).id;
  squad.legionTokenIds = params._legionIds;
  squad.positionX = -1;
  squad.positionY = -1;
  squad.inTemple = -1;
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

export function handleMapTilePlaced(event: MapTilePlaced): void {
  const params = event.params;
  const userMapTile = CryptsUserMapTile.load(
    params._user.concat(bigNumberToBytes(params._maptile.mapTileId))
  );
  if (!userMapTile) {
    log.error("[crypts] Received placement for unknown map tile: {}, {}", [
      params._user.toHexString(),
      params._maptile.mapTileId.toString(),
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
        bigNumberToBytes(params._maptiles[i].mapTileId)
      ).id
    );
  }

  const epoch = 1;
  const userEpoch = getOrCreateUserEpoch(user.id, epoch);
  userEpoch.mapTiles = userEpoch.mapTiles.concat(userMapTiles);
  userEpoch.save();
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

  squad.inTemple = params._targetTemple;
  squad.save();
}

export function handleTreasureClaimed(event: TreasureClaimed): void {}
