import { BigDecimal, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  Deposit as DepositEvent,
  Staked,
  Unstaked,
  UtilizationRate,
  Withdraw as WithdrawEvent,
} from "../../generated/Atlas Mine/AtlasMine";
import {
  AtlasMine,
  Deposit,
  StakedToken,
  User,
  Withdraw,
} from "../../generated/schema";
import { LOCK_PERIOD_IN_SECONDS } from "../helpers";
import { getUser, getUserOrMultisigAddress } from "../helpers/user";
import { getAddressId } from "../helpers/utils";

const ONE = BigDecimal.fromString((1e18).toString());

export function handleDeposit(event: DepositEvent): void {
  const params = event.params;

  const userId = params.user;
  const user = getUser(userId.toHexString());
  user.deposited = user.deposited.plus(params.amount);
  user.save();

  const lock = params.lock;
  const deposit = new Deposit(getAddressId(userId, params.index));
  deposit.transactionHash = event.transaction.hash;
  deposit.amount = params.amount;
  deposit.depositId = params.index;
  deposit.startTimestamp = event.block.timestamp.times(BigInt.fromI32(1000));
  deposit.endTimestamp = event.block.timestamp
    .plus(BigInt.fromI32(LOCK_PERIOD_IN_SECONDS[lock]))
    .times(BigInt.fromI32(1000));
  deposit.lock = lock;
  deposit.mine = event.address.toHexString();
  deposit.user = user.id;
  deposit.save();
}

export function handleStaked(event: Staked): void {
  const params = event.params;
  const quantity = params.amount;

  let userId = getUserOrMultisigAddress(event).toHexString();
  const user = getUser(userId);
  user.boosts = user.boosts + quantity.toI32();
  user.boost = params.currentBoost.divDecimal(ONE).toString();
  user.save();

  const addressId = getAddressId(params.nft, params.tokenId);
  const stakedTokenId = `${userId}-${addressId}`;
  let stakedToken = StakedToken.load(stakedTokenId);
  if (!stakedToken) {
    stakedToken = new StakedToken(stakedTokenId);
    stakedToken.mine = event.address.toHexString();
    stakedToken.quantity = BigInt.zero();
    stakedToken.token = addressId;
    stakedToken.user = user.id;
    stakedToken.expirationProcessed = false;
  }

  stakedToken.quantity = stakedToken.quantity.plus(quantity);
  stakedToken.save();
}

export function handleUnstaked(event: Unstaked): void {
  let params = event.params;
  let nft = params.nft;
  let tokenId = params.tokenId;
  let quantity = params.amount;
  let boost = params.currentBoost;
  let addressId = getAddressId(nft, tokenId);
  let userId = getUserOrMultisigAddress(event).toHexString();
  let stakedTokenId = `${userId}-${addressId}`;

  let user = User.load(userId);

  if (user) {
    user.boosts = user.boosts - quantity.toI32();
    user.boost = boost.divDecimal(ONE).toString();
    user.save();
  }

  let stakedToken = StakedToken.load(stakedTokenId);

  if (stakedToken) {
    stakedToken.quantity = stakedToken.quantity.minus(quantity);
    stakedToken.save();

    if (stakedToken.quantity.toI32() == 0) {
      store.remove("StakedToken", stakedToken.id);
    }
  }
}

export function handleUtilizationRate(event: UtilizationRate): void {
  let id = event.address.toHexString();
  let mine = AtlasMine.load(id);

  if (!mine) {
    mine = new AtlasMine(id);
  }

  mine.utilization = event.params.util;
  mine.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  let mine = event.address.toHexString();
  let params = event.params;
  let userId = params.user;
  let id = getAddressId(userId, params.index);
  let withdraw = Withdraw.load(id);
  let deposit = Deposit.load(id);

  if (!withdraw) {
    withdraw = new Withdraw(id);

    withdraw.amount = BigInt.zero();
    withdraw.deposit = id;
    withdraw.mine = mine;
    withdraw.user = userId.toHexString();
  }

  if (!deposit) {
    log.error("Unknown deposit: {}", [id]);

    return;
  }

  let user = User.load(userId.toHexString());

  if (user) {
    user.deposited = user.deposited.minus(params.amount);
    user.save();
  }

  deposit.withdrawal = id;
  deposit.save();

  withdraw.amount = withdraw.amount.plus(params.amount);
  withdraw.save();
}
