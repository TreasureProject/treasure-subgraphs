import { Pilgrimage } from "../../generated/schema";
import {
  NoPilgrimagesToFinish,
  PilgrimagesFinished,
  PilgrimagesStarted,
} from "../../generated/Pilgrimage/Pilgrimage";
import { log } from "@graphprotocol/graph-ts";

export function handleNoPilgrimagesToFinish(
  event: NoPilgrimagesToFinish
): void {
  let params = event.params;
  let user = params._user;

  log.info("Nothing to do for {}", [user.toHexString()]);
}

export function handlePilgrimagesFinished(event: PilgrimagesFinished): void {
  let id = event.address.toHexString();
  let pilgrimage = Pilgrimage.load(id);
  let pilgrimageIds = event.params._finishedPilgrimageIds;

  if (!pilgrimage) {
    pilgrimage = new Pilgrimage(id);
  }

  for (let index = 0; index < pilgrimageIds.length; index++) {
    pilgrimage.current = pilgrimage.current - 1;
  }

  pilgrimage.save();
}

export function handlePilgrimagesStarted(event: PilgrimagesStarted): void {
  let id = event.address.toHexString();
  let pilgrimage = Pilgrimage.load(id);
  let amounts = event.params._amounts1155;

  if (!pilgrimage) {
    pilgrimage = new Pilgrimage(id);
  }

  for (let index = 0; index < amounts.length; index++) {
    let amount = amounts[index].toI32()

    pilgrimage.current = pilgrimage.current + amount;
    pilgrimage.total = pilgrimage.total + amount;
  }

  pilgrimage.save();
}
