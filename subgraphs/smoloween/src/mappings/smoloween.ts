import { BigInt, log } from "@graphprotocol/graph-ts";

import {
  Converted,
  GotSidekick,
  Midnight,
  Staked,
  Unstaked,
} from "../../generated/Smoloween/Smoloween";
import { Config, Sidekick, Token } from "../../generated/schema";

const getOrCreateConfig = (): Config => {
  let config = Config.load("only");
  if (!config) {
    config = new Config("only");
    config.currentDay = 0;
    config.save();
  }

  return config;
};

const getOrCreateToken = (tokenId: BigInt): Token => {
  const id = tokenId.toString();
  let token = Token.load(id);
  if (!token) {
    token = new Token(id);
    token.tokenId = tokenId;
    token.save();
  }

  return token;
};

export function handleStaked(event: Staked): void {
  const params = event.params;
  const token = getOrCreateToken(params.smolId);
  token.isStaked = true;
  token.save();
}

export function handleUnstaked(event: Unstaked): void {
  const params = event.params;

  const id = params.id.toString();
  const token = Token.load(id);
  if (!token) {
    log.error("[smoloween] Unstaking unknown Token: {}", [id]);
    return;
  }

  token.isStaked = false;
  token.save();
}

export function handleMidnight(event: Midnight): void {
  const config = getOrCreateConfig();
  config.currentDay = event.params.newDay.toI32();
  config.save();
}

export function handleConverted(event: Converted): void {
  const params = event.params;

  const id = params.smol.toString();
  const token = Token.load(id);
  if (!token) {
    log.error("[smoloween] Converting unknown Token: {}", [id]);
    return;
  }

  token.isGhoul = true;
  token.save();
}

export function handleGotSidekick(event: GotSidekick): void {
  const params = event.params;

  const ownerId = params.smol.toString();
  const owner = Token.load(ownerId);
  if (!owner) {
    log.error("[smoloween] Adding sidekick to unknown Token: {}", [ownerId]);
    return;
  }

  const sidekick = new Sidekick(params.sidekick.toString());
  sidekick.owner = owner.id;
  sidekick.day = params.day.toI32();
  sidekick.save();
}
