import { SMOL_BRAINS_ADDRESS } from "@treasure/constants";

import { DropSchool, JoinSchool } from "../../generated/Smol Brains School/School";
import { LOCATION_SCHOOL } from "../helpers/constants";
import { handleStake, handleUnstake } from "./common";

export function handleJoinSchool(event: JoinSchool): void {
  handleStake(
    event.transaction.from,
    SMOL_BRAINS_ADDRESS,
    event.params.tokenId,
    LOCATION_SCHOOL
  );
}

export function handleDropSchool(event: DropSchool): void {
  handleUnstake(
    SMOL_BRAINS_ADDRESS,
    event.params.tokenId,
    LOCATION_SCHOOL
  );
}
