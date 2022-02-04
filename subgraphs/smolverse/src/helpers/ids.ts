import { Bytes, BigInt } from "@graphprotocol/graph-ts";

export function getTokenId(tokenAddress: Bytes, tokenId: BigInt): string {
  return [tokenAddress.toHexString(), tokenId.toHexString()].join("-");
}
