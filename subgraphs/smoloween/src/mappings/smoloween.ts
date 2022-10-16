import { log } from "@graphprotocol/graph-ts";

import {
  AttackResolved,
  Converted,
  Midnight,
  RandomnessRequested,
  SentToAttack,
  SentToCopy,
  Staked,
  Unstaked,
} from "../../generated/Smoloween/Smoloween";
import { Attack, Mission, Random, Stat, Token } from "../../generated/schema";
import { getOrCreateConfig } from "../helpers/config";

const getOrCreateStat = (): Stat => {
  let stat = Stat.load("only");
  if (!stat) {
    stat = new Stat("only");
    stat.totalStaked = 0;
    stat.totalGhouls = 0;
    stat.aliveSmols = [];
    stat.save();
  }

  return stat;
};

export function handleStaked(event: Staked): void {
  const params = event.params;

  const randomId = params.requestId.toString();
  const random = Random.load(randomId);
  if (!random) {
    log.error("[smoloween] Random not found for request: {}", [randomId]);
    return;
  }

  const id = params.gameId.toString();
  let token = Token.load(id);
  if (!token) {
    token = new Token(id);
    token.isGhoul = false;
    token.attackers = [];
    token.points = 0;
  }

  token.isStaked = true;
  token.stakingUser = params.owner;
  token.save();

  random.token = token.id;
  random.save();

  const stat = getOrCreateStat();
  stat.totalStaked += 1;
  stat.aliveSmols = stat.aliveSmols.concat([token.id]);
  stat.save();
}

export function handleUnstaked(event: Unstaked): void {
  const params = event.params;

  const id = params.gameId.toString();
  const token = Token.load(id);
  if (!token) {
    log.error("[smoloween] Unstaking unknown Token: {}", [id]);
    return;
  }

  token.isStaked = false;
  token.stakingUser = null;
  token.save();

  const stat = getOrCreateStat();

  for (let i = 0; i < stat.aliveSmols.length; i++) {
    if (stat.aliveSmols[i] === token.id) {
      const firstArr = stat.aliveSmols.slice(0, i);
      const secondArr = stat.aliveSmols.slice(i + 1);
      stat.aliveSmols = firstArr.concat(secondArr);
      break;
    }
  }

  stat.totalStaked -= 1;
  if (token.isGhoul) {
    stat.totalGhouls -= 1;
  }
  stat.save();
}

export function handleRandomnessRequested(event: RandomnessRequested): void {
  const params = event.params;

  const randomId = params.requestId.toString();
  const random = Random.load(randomId);
  if (!random) {
    log.error("[smoloween] Random not found for request: {}", [randomId]);
    return;
  }

  const day = params.day.toI32();
  random.witchDay = day + 1;
  random.save();

  const config = getOrCreateConfig();
  config.currentDay = day;
  config.save();
}

export function handleMidnight(event: Midnight): void {
  const config = getOrCreateConfig();
  config.currentDay = event.params.newDay.toI32();

  const stat = getOrCreateStat();
  for (let i = 0; i < stat.aliveSmols.length; i++) {
    const token = Token.load(stat.aliveSmols[i]);

    if (token) {
      token.points += 1;
      token.save();
    }
  }
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

  const stat = getOrCreateStat();

  for (let i = 0; i < stat.aliveSmols.length; i++) {
    if (stat.aliveSmols[i] === token.id) {
      const firstArr = stat.aliveSmols.slice(0, i);
      const secondArr = stat.aliveSmols.slice(i + 1);
      stat.aliveSmols = firstArr.concat(secondArr);
      break;
    }
  }

  stat.totalGhouls += 1;
  stat.save();
}

export function handleSentToAttack(event: SentToAttack): void {
  const params = event.params;
  const attackerId = params.gameId.toString();
  const targetId = params.targetId.toString();
  const day = params.day.toI32();

  const target = Token.load(targetId);
  if (!target) {
    log.error("[smoloween] Attack is targeting unknown Token: {}", [targetId]);
    return;
  }

  target.attackers = target.attackers.concat([attackerId]);
  target.save();

  const id = `${attackerId}-${targetId}-${day.toString()}`;
  const attack = new Attack(id);
  attack.user = params.sender;
  attack.attacker = attackerId;
  attack.target = targetId;
  attack.day = day;
  attack.timestamp = event.block.timestamp;
  attack.save();
}

export function handleSentToCopy(event: SentToCopy): void {
  const params = event.params;
  const sidekickId = params.sidekickId.toString();
  const targetId = params.targetId.toString();
  const day = params.day.toI32();

  const id = `${sidekickId}-${targetId}-${day.toString()}`;
  const mission = new Mission(id);
  mission.user = params.sender;
  mission.sidekickId = params.sidekickId;
  mission.target = targetId;
  mission.trait = params.trait.toI32();
  mission.day = day;
  mission.timestamp = event.block.timestamp;
  mission.save();
}

export function handleAttackResolved(event: AttackResolved): void {
  const params = event.params;
  const targetId = params.targetId.toString();

  const target = Token.load(targetId);
  if (!target) {
    log.error("[smoloween] Resolving attack for unknown target Token: {}", [
      targetId,
    ]);
    return;
  }

  // Only increment counts if attack was successful
  if (params.success) {
    const numAttackers = target.attackers.length;
    for (let i = 0; i < numAttackers; i++) {
      const attacker = Token.load(target.attackers[i]);
      if (!attacker) {
        log.error(
          "[smoloween] Resolving attack for unknown attacker Token: {}",
          [targetId]
        );
        continue;
      }

      attacker.points += 1;
      attacker.save();
    }
  }

  // Clear queue of attackers for the next round
  target.attackers = [];
  target.save();
}
