import * as common from "../mapping";
import { Pilgrimage } from "../../generated/schema";
import {
  NoPilgrimagesToFinish,
  PilgrimagesFinished,
  PilgrimagesStarted,
} from "../../generated/Pilgrimage/Pilgrimage";
import { BigInt, log, store } from "@graphprotocol/graph-ts";

export function handleNoPilgrimagesToFinish(event: NoPilgrimagesToFinish): void {
  let params = event.params;
  let user = params._user;

  log.info('Nothing to do for {}', [user.toHexString()])
}

export function handlePilgrimagesFinished(event: PilgrimagesFinished): void {
  let params = event.params;

  let pilgrimageIds = params._finishedPilgrimageIds;
  let user = params._user;

  for (let index = 0; index < pilgrimageIds.length; index++) {
    let pilgrimageId = pilgrimageIds[index];

    store.remove(
      "Pilgrimage",
      `${user.toHexString()}-${pilgrimageId.toHexString()}`
    );
  }
}

export function handlePilgrimagesStarted(event: PilgrimagesStarted): void {
  let params = event.params;

  let ids = params._ids1155;
  let amounts = params._amounts1155;
  let contract = params._legionContract;
  let pilgrimageIds = params._pilgrimageIds;

  let user = params._user;
  let finishTime = params._finishTime;

  for (let index = 0; index < ids.length; index++) {
    let tokenId = ids[index];
    let amount = amounts[index];
    let pilgrimageId = pilgrimageIds[index];
    let id = `${contract.toHexString()}-${tokenId.toHexString()}`;

    let pilgrimage = new Pilgrimage(
      `${user.toHexString()}-${pilgrimageId.toHexString()}`
    );

    pilgrimage.pilgrimageEndTimestamp = finishTime.times(BigInt.fromI32(1000));
    pilgrimage.pilgrimageId = pilgrimageId;
    pilgrimage.quantity = amount;
    pilgrimage.token = id;
    pilgrimage.user = user.toHexString();

    pilgrimage.save();

    common.handleTransfer(
      contract,
      params._user,
      event.address,
      tokenId,
      amount
    );
  }
}
