import { Transfer } from "../../generated/TreasureMarketplace/ERC721";
import {
  createBattleflyFoundersCollection,
  createErc721Collection,
} from "../helpers";
import * as common from "../mapping";

export function handleTransferBattlefly(event: Transfer): void {
  createErc721Collection(event.address, "BattleFly");

  common.handleTransfer721(event);
}

export function handleTransferFounder(event: Transfer): void {
  createBattleflyFoundersCollection(
    event.address,
    "BattleFly v1 Founders NFT",
    1
  );
  createBattleflyFoundersCollection(
    event.address,
    "BattleFly v2 Founders NFT",
    2
  );

  common.handleTransfer721(event);
}
