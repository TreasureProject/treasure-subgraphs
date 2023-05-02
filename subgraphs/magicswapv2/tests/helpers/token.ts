import { createMockedFunction } from "matchstick-as";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export const mockToken = (id: string, name: string, symbol: string): void => {
  const address = Address.fromString(id);
  createMockedFunction(address, "name", "name():(string)").returns([
    ethereum.Value.fromString(name),
  ]);
  createMockedFunction(address, "symbol", "symbol():(string)").returns([
    ethereum.Value.fromString(symbol),
  ]);
  createMockedFunction(
    address,
    "totalSupply",
    "totalSupply():(uint256)"
  ).returns([
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString("1000000000000000000000000000")
    ),
  ]);
  createMockedFunction(address, "decimals", "decimals():(uint8)").returns([
    ethereum.Value.fromI32(18),
  ]);
};
