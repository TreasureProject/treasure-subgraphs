import * as ERC721 from "./721";
import {
  DropSchool,
  JoinSchool,
  SmolBrainSet,
} from "../../generated/Smol Brains School/School";
import { Transfer } from "../../generated/Smol Brains/ERC721";
import { handleStake, handleStakingSet, handleUnstake } from "../mapping";

export function handleTransfer(event: Transfer): void {
  ERC721.handleTransfer(event, "Smol Brains");
}

export function handleDropSchool(event: DropSchool): void {
  handleUnstake(event.address, event.params.tokenId);
}

export function handleJoinSchool(event: JoinSchool): void {
  handleStake(event.address, event.params.tokenId);
}

export function handleSmolBrainSet(event: SmolBrainSet): void {
  handleStakingSet(event.address, event.params.smolBrain);
}
