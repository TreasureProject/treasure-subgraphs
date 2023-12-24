import { Address, ethereum } from "@graphprotocol/graph-ts";

import { LiquidityPosition } from "../../generated/schema";
import { ZERO_BD } from "../helpers/constants";

// TODO: getLiquidityPosition
// export function getLiquidityPosition(id: string): LiquidityPosition {}

// TODO: getLiquidityPositions
// export function getLiquidityPositions(ids: string[]): LiquidityPosition[] {}

export function createLiquidityPosition(
  user: Address,
  pair: Address,
  block: ethereum.Block
): LiquidityPosition {
  const pairAddress = pair.toHex();

  const userAddress = user.toHex();

  const id = pairAddress.concat("-").concat(userAddress);

  let liquidityPosition = LiquidityPosition.load(id);

  if (liquidityPosition === null) {
    // const pair = Pair.load(pairAddress)
    // const pair = getPair(Address.fromString(pairAddress), block)

    // TODO: We should do the inverse when a liquidity provider becomes inactive (removes all liquidity)
    // pair.liquidityProviderCount = pair.liquidityProviderCount.plus(BigInt.fromI32(1))
    // pair.save()
    // const pairContract = PairContract.bind(pair)
    // const liquidityTokenBalance = pairContract.balanceOf(user).divDecimal(BigDecimal.fromString('1e18'))

    liquidityPosition = new LiquidityPosition(id);
    liquidityPosition.user = userAddress;
    liquidityPosition.pair = pairAddress;
    liquidityPosition.liquidityTokenBalance = ZERO_BD;
    liquidityPosition.block = block.number.toI32();
    liquidityPosition.timestamp = block.timestamp.toI32();
    liquidityPosition.save();
  }

  return liquidityPosition as LiquidityPosition;
}
