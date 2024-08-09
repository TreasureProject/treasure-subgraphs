import {
  NFTLiquidityAdded,
  NFTLiquidityRemoved,
  NFTNFTLiquidityAdded,
  NFTNFTLiquidityRemoved,
} from "../../generated/MagicswapV2Router/MagicswapV2Router";
import { getOrCreateTransaction, getOrCreateUser } from "../helpers";

export function handleNftLiquidityAdded(event: NFTLiquidityAdded): void {
  const transaction = getOrCreateTransaction(event);
  transaction.type = "Deposit";
  transaction.user = getOrCreateUser(event.params.to).id;
  transaction.save();
}

export function handleNftLiquidityRemoved(event: NFTLiquidityRemoved): void {
  const transaction = getOrCreateTransaction(event);
  transaction.type = "Withdrawal";
  transaction.user = getOrCreateUser(event.params.to).id;
  transaction.save();
}

export function handleNftNftLiquidityAdded(event: NFTNFTLiquidityAdded): void {
  const transaction = getOrCreateTransaction(event);
  transaction.type = "Deposit";
  transaction.user = getOrCreateUser(event.params.to).id;
  transaction.save();
}

export function handleNftNftLiquidityRemoved(
  event: NFTNFTLiquidityRemoved
): void {
  const transaction = getOrCreateTransaction(event);
  transaction.type = "Withdrawal";
  transaction.user = getOrCreateUser(event.params.to).id;
  transaction.save();
}
