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
import { getAddressId } from "../helpers/utils";

const ONE = BigDecimal.fromString((1e18).toString());

const DAY = 86_400;
const ONE_WEEK = DAY * 7;
const TWO_WEEKS = ONE_WEEK * 2;
const ONE_MONTH = DAY * 30;
const THREE_MONTHS = ONE_MONTH * 3;
const SIX_MONTHS = ONE_MONTH * 6;
const TWELVE_MONTHS = DAY * 365;

const TIMESTAMPS = [
  TWO_WEEKS,
  ONE_MONTH,
  THREE_MONTHS,
  SIX_MONTHS,
  TWELVE_MONTHS,
];

export function handleDeposit(event: DepositEvent): void {
  let mine = event.address.toHexString();
  let params = event.params;
  let userId = params.user;
  let lock = params.lock;

  let deposit = new Deposit(getAddressId(userId, params.index));
  let user = User.load(userId.toHexString());

  if (user) {
    user.deposited = user.deposited.plus(params.amount);
    user.save();
  }

  deposit.amount = params.amount;
  deposit.depositId = params.index;
  deposit.endTimestamp = event.block.timestamp
    .plus(BigInt.fromI32(TIMESTAMPS[lock]))
    .times(BigInt.fromI32(1000));
  deposit.lock = lock;
  deposit.mine = mine;
  deposit.user = userId.toHexString();
  deposit.save();
}

export function handleStaked(event: Staked): void {
  let params = event.params;
  let nft = params.nft;
  let tokenId = params.tokenId;
  let quantity = params.amount;
  let boost = params.currentBoost;
  let addressId = getAddressId(nft, tokenId);
  let userId = event.transaction.from.toHexString();
  let stakedTokenId = `${userId}-${addressId}`;

  let user = User.load(userId);

  if (user) {
    user.boosts = user.boosts + quantity.toI32();
    user.boost = boost.divDecimal(ONE).toString();
    user.save();
  }

  let stakedToken = StakedToken.load(stakedTokenId);

  if (!stakedToken) {
    stakedToken = new StakedToken(stakedTokenId);

    stakedToken.token = addressId;
    stakedToken.user = userId;
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
  let userId = event.transaction.from.toHexString();
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
