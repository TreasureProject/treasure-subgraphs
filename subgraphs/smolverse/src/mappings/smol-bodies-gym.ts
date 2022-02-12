import { SMOL_BODIES_ADDRESS } from "@treasure/constants";

import { DropGym, JoinGym } from "../../generated/Smol Bodies Gym/Gym";
import { LOCATION_GYM } from "../helpers/constants";
import { handleStake, handleUnstake } from "./common";

export function handleJoinGym(event: JoinGym): void {
  handleStake(
    event.transaction.from,
    SMOL_BODIES_ADDRESS,
    event.params.tokenId,
    LOCATION_GYM
  );
}

export function handleDropGym(event: DropGym): void {
  handleUnstake(
    SMOL_BODIES_ADDRESS,
    event.params.tokenId,
    LOCATION_GYM
  );
}
