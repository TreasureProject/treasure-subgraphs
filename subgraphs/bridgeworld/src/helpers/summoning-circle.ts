import { BigDecimal } from "@graphprotocol/graph-ts";

import { SUMMONING_SUCCESS_SENSITIVITY } from ".";
import { SummoningCircle } from "../../generated/schema";

enum Entity {
  Crafter,
  Summoner,
}

function getSummoningCircle(): SummoningCircle {
  let circle = SummoningCircle.load("only");

  if (!circle) {
    circle = new SummoningCircle("only");

    circle.crafters = 0;
    circle.summoners = 0;
  }

  return circle;
}

function updateSummoningCircle(entity: Entity, value: i32): void {
  let circle = getSummoningCircle();

  switch (entity) {
    case Entity.Crafter:
      circle.crafters += value;

      break;
    case Entity.Summoner:
      circle.summoners += value;

      break;
    default:
      throw new Error("Unknown entity for summoning circle.");
  }

  let crafters: f32 = circle.crafters == 0 ? 1 : (circle.crafters as f32);
  let summoners: f32 = circle.summoners as f32;
  let rate: f32 =
    1 / (1 + (summoners / (crafters * SUMMONING_SUCCESS_SENSITIVITY)) ** 2);

  circle.successRate = `${rate}`;
  circle.save();
}

export function addCrafterToCircle(): void {
  updateSummoningCircle(Entity.Crafter, 1);
}

export function addSummonerToCircle(): void {
  updateSummoningCircle(Entity.Summoner, 1);
}

export function removeCrafterFromCircle(): void {
  updateSummoningCircle(Entity.Crafter, -1);
}

export function removeSummonerFromCircle(): void {
  updateSummoningCircle(Entity.Summoner, -1);
}
