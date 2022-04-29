import { TREASURE_ADDRESS } from "@treasure/constants";

import { TreasureCardInfoSet } from "../../generated/Treasure Triad/TreasureTriad";
import { TreasureTriadCardInfo } from "../../generated/schema";
import { getAddressId } from "../helpers/utils";

export function handleTreasureCardInfoSet(event: TreasureCardInfoSet): void {
  const params = event.params;

  const cardInfo = new TreasureTriadCardInfo(params._treasureId.toString());
  cardInfo.token = getAddressId(TREASURE_ADDRESS, params._treasureId);
  cardInfo.north = params._cardInfo.north;
  cardInfo.east = params._cardInfo.east;
  cardInfo.south = params._cardInfo.south;
  cardInfo.west = params._cardInfo.west;
  cardInfo.save();
}
