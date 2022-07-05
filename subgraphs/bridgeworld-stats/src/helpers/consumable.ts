import { BigInt, log } from "@graphprotocol/graph-ts";

export function getConsumableName(tokenId: BigInt): string {
  const id = tokenId.toI32();
  switch (id) {
    case 1:
      return "Small Prism";
    case 2:
      return "Medium Prism";
    case 3:
      return "Large Prism";
    case 4:
      return "Small Extractor";
    case 5:
      return "Medium Extractor";
    case 6:
      return "Large Extractor";
    case 7:
      return "Harvester Part";
    case 8:
      return "Essence of Starlight";
    case 9:
      return "Prism Shards";
    case 10:
      return "Universal Lock";
    case 11:
      return "Azurite Dust";
    case 12:
      return "Essence of Honeycomb";
    case 13:
      return "Essence of Grin";
    case 14:
      return "Shrouded Tesseract";
    default:
      log.error("Unhandled consumable name: {}", [tokenId.toString()]);
      return "";
  }
}
