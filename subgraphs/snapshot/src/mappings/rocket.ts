import { log } from "@graphprotocol/graph-ts";

import {
  Board,
  DeadlineSet,
  SmolBrainSet,
} from "../../generated/Smol Rocket/Rocket";
import { Boarded, Rocket, Token } from "../../generated/schema";

export function handleBoard(event: Board): void {
  let params = event.params;
  let tokenId = params.smolBrainTokenId.toHexString();
  let timestamp = params.timestamp.toI32();

  let rocket = Rocket.load(event.address.toHexString());

  if (!rocket) {
    log.error("No rocket entity found!", []);

    return;
  }

  let token = Token.load(`${rocket.address}-${tokenId}`);

  if (!token) {
    log.error("tokenNotFound: Token for boarding not found!", []);

    return;
  }

  let id = `${rocket.id}-${tokenId}`;
  let boarded = Boarded.load(id);

  if (!boarded) {
    boarded = new Boarded(id);

    boarded.token = token.id;
  }

  boarded.beforeDeadline = timestamp <= rocket.deadline;
  boarded.timestamp = timestamp;
  boarded.save();

  if (!rocket.boarded.includes(boarded.id)) {
    rocket.boarded.push(boarded.id);
  }

  rocket.save();
}

export function handleDeadlineSet(event: DeadlineSet): void {
  let address = event.address;
  let deadline = event.params.deadline.toI32();

  let rocket = Rocket.load(address.toHexString());

  if (!rocket) {
    log.error("No rocket entity found!", []);

    return;
  }

  rocket.deadline = deadline;
  rocket.save();

  for (let index = 0; index < rocket.boarded.length; index++) {
    let boarded = Boarded.load(rocket.boarded[index]);

    if (boarded) {
      boarded.beforeDeadline = boarded.timestamp <= deadline;
      boarded.save();
    }
  }
}

export function handleSmolBrainSet(event: SmolBrainSet): void {
  let address = event.address.toHexString();
  let rocket = Rocket.load(address);

  if (!rocket) {
    rocket = new Rocket(address);

    rocket.boarded = [];

    // This was the initial deadline set on contract creation
    rocket.deadline = 1641511409;
  }

  rocket.address = event.params.smolBrain.toHexString();
  rocket.save();
}
