import { BigDecimal } from "@graphprotocol/graph-ts";

import { SUMMONING_SUCCESS_SENSITIVITY } from ".";
import { SummoningCircle } from "../../generated/schema";

enum Entity {
  Crafter,
  Summoner,
}

function toBigDecimal(value: i32): BigDecimal {
  return BigDecimal.fromString(`${value}`);
}

function getSummoningCircle(): SummoningCircle {
  let circle = SummoningCircle.load("only");

  if (!circle) {
    circle = new SummoningCircle("only");
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

  let crafters = circle.crafters == 0 ? 1 : circle.crafters;
  let summoners = circle.summoners == 0 ? 1 : circle.summoners;
  let rate =
    10 ** 25 /
    (10 ** 20 +
      (((summoners * 10 ** 5) / crafters) *
        ((SUMMONING_SUCCESS_SENSITIVITY * 10 ** 5) / 100_000)) **
        2);

  circle.successRate = toBigDecimal(rate).div(toBigDecimal(100_000)).toString();
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
