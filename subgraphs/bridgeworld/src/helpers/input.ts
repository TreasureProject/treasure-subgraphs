import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

class Parsed {
  constructor(public tokenIds: BigInt[], public prismIds: BigInt[]) {}
}

const OFFSET: i32 = 1 * 32;

function decodeBigIntArray(data: Bytes, length: i32): BigInt[] {
  let decoded = ethereum.decode(`uint256[${length}]`, data);

  if (!decoded) {
    return [];
  }

  return decoded.toBigIntArray();
}

function decodeI32(data: Bytes): i32 {
  let decoded = ethereum.decode("uint256", data);

  if (!decoded) {
    return 0;
  }

  return decoded.toBigInt().toI32();
}

function slice(data: Bytes, offset: i32): Bytes {
  return changetype<Bytes>(data.subarray(offset));
}

export function parse(input: Bytes): Parsed {
  let data = slice(input, 4);
  let pointer: i32 = 0;

  let tokenIdsOffset = decodeI32(slice(data, pointer));
  let tokenIdsLength = decodeI32(slice(data, tokenIdsOffset));
  let tokenIds = decodeBigIntArray(
    slice(data, tokenIdsOffset + OFFSET),
    tokenIdsLength
  );

  pointer += OFFSET;

  let prismIdsOffset = decodeI32(slice(data, pointer));
  let prismIdsLength = decodeI32(slice(data, prismIdsOffset));
  let prismIds = decodeBigIntArray(
    slice(data, prismIdsOffset + OFFSET),
    prismIdsLength
  );

  return new Parsed(tokenIds, prismIds);
}
