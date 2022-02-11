import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { SMOL_BODIES_ADDRESS, SMOL_FARM_ADDRESS } from "@treasure/constants";
import { newMockEvent } from "matchstick-as";

import { RewardClaimed, SmolStaked, SmolUnstaked, StartClaiming } from "../../generated/Smol Farm/SmolFarm";
import { getRandomId, getStakedTokenId } from "../../src/helpers/ids";

export function getClaimId(collectionId: string, tokenId: BigInt, location: string, requestId: BigInt): string {
  return [
    getStakedTokenId(collectionId, tokenId, location),
    getRandomId(requestId)
  ].join("-");
}

export const createSmolStakedEvent = (
  owner: string,
  tokenId: i32,
  stakeTime: i32
): SmolStaked => {
  const event = changetype<SmolStaked>(newMockEvent());
  event.address = SMOL_FARM_ADDRESS;
  event.parameters = [
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(Address.fromString(owner))),
    new ethereum.EventParam("_smolAddress", ethereum.Value.fromAddress(SMOL_BODIES_ADDRESS)),
    new ethereum.EventParam("_tokenid", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_stakeTime", ethereum.Value.fromI32(stakeTime))
  ];

  return event;
};

export const createSmolUnstakedEvent = (
  owner: string,
  tokenId: i32
): SmolUnstaked => {
  const event = changetype<SmolUnstaked>(newMockEvent());
  event.address = SMOL_FARM_ADDRESS;
  event.parameters = [
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(Address.fromString(owner))),
    new ethereum.EventParam("_smolAddress", ethereum.Value.fromAddress(SMOL_BODIES_ADDRESS)),
    new ethereum.EventParam("_tokenid", ethereum.Value.fromI32(tokenId))
  ];

  return event;
};

export const createStartClaimingEvent = (
  owner: string,
  tokenId: i32,
  requestId: i32
): StartClaiming => {
  const event = changetype<StartClaiming>(newMockEvent());
  event.address = SMOL_FARM_ADDRESS;
  event.parameters = [
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(Address.fromString(owner))),
    new ethereum.EventParam("_smolAddress", ethereum.Value.fromAddress(SMOL_BODIES_ADDRESS)),
    new ethereum.EventParam("_tokenid", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_requestId", ethereum.Value.fromI32(requestId))
  ];

  return event;
};

export const createRewardClaimedEvent = (
  owner: string,
  tokenId: i32,
  rewardTokenId: i32
): RewardClaimed => {
  const event = changetype<RewardClaimed>(newMockEvent());
  event.address = SMOL_FARM_ADDRESS;
  event.parameters = [
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(Address.fromString(owner))),
    new ethereum.EventParam("_smolAddress", ethereum.Value.fromAddress(SMOL_BODIES_ADDRESS)),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_claimedRewardId", ethereum.Value.fromI32(rewardTokenId))
  ];

  return event;
};
