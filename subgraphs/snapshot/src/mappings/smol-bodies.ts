import * as ERC721 from "./721";
import {
  DropGym,
  JoinGym,
  SmolBodiesSet,
} from "../../generated/Smol Bodies Gym/Gym";
import { Transfer } from "../../generated/Smol Bodies/ERC721";
import { handleStake, handleStakingSet, handleUnstake } from "../mapping";

export function handleTransfer(event: Transfer): void {
  ERC721.handleTransfer(event, "Smol Bodies");
}

export function handleDropGym(event: DropGym): void {
  handleUnstake(event.address, event.params.tokenId);
}

export function handleJoinGym(event: JoinGym): void {
  handleStake(event.address, event.params.tokenId);
}

export function handleSmolBodiesSet(event: SmolBodiesSet): void {
  handleStakingSet(event.address, event.params.smolBodies);
}
