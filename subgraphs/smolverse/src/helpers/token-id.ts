import { BigInt, log } from "@graphprotocol/graph-ts";

export function getTokenName(tokenId: BigInt): string {
  const id = tokenId.toI32();

  switch (id) {
    case 1: return "Moon Rock";
    case 2: return "Stardust";
    case 3: return "Comet Shard";
    case 4: return "Lunar Gold";
    case 5: return "Alien Relic";
    default:
      log.error("Token name not handled: {}", [id.toString()]);
      return "";
  }
}
