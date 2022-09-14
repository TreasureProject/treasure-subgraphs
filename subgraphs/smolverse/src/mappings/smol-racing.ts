import {
  SmolStaked,
  SmolUnstaked,
  StartRacing,
  StopRacing,
} from "../../generated/Smol Racing/SmolRacing";
import { LOCATION_RACING } from "../helpers/constants";
import { handleStake, handleUnstake } from "./common";

export function handleSmolStaked(event: SmolStaked): void {
  const params = event.params;
  handleStake(
    params._owner,
    params._smolAddress,
    params._tokenId,
    LOCATION_RACING,
    params._stakeTime
  );
}

export function handleSmolUnstaked(event: SmolUnstaked): void {
  const params = event.params;
  handleUnstake(params._smolAddress, params._tokenId, LOCATION_RACING);
}

export function handleStartRacing(event: StartRacing): void {
  const params = event.params;
  handleStake(
    params._owner,
    params._vehicleAddress,
    params._tokenId,
    LOCATION_RACING,
    params._stakeTime
  );
}

export function handleStopRacing(event: StopRacing): void {
  const params = event.params;
  handleUnstake(params._vehicleAddress, params._tokenId, LOCATION_RACING);
}
