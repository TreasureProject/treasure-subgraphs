import { BigInt, log } from "@graphprotocol/graph-ts";

export function getTreasureTokenName(tokenId: BigInt): string {
  const id = tokenId.toI32();

  switch (id) {
    case 0: return "Moon Rock";
    case 1: return "Stardust";
    case 2: return "Comet Shard";
    case 3: return "Lunar Gold";
    case 4: return "Alien Relic";
    default:
      log.error("Token name not handled: {}", [id.toString()]);
      return "";
  }
}
