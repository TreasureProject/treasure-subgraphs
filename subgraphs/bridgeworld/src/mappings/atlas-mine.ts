import {
  Address,
  BigDecimal,
  BigInt,
  log,
  store,
} from "@graphprotocol/graph-ts";

import {
  Deposit as DepositEvent,
  Staked,
  Unstaked,
  Withdraw as WithdrawEvent,
} from "../../generated/Atlas Mine/AtlasMine";
import {
  AtlasMine,
  Deposit,
  StakedToken,
  Withdraw,
} from "../../generated/schema";
import { LOCK_PERIOD_IN_SECONDS, ZERO_BI } from "../helpers/constants";
import { getOrCreateUser, getUserOrMultisigAddress } from "../helpers/user";
import { getAddressId } from "../helpers/utils";

const ONE = BigDecimal.fromString((1e18).toString());

const getOrCreateAtlasMine = (address: Address): AtlasMine =>
  new AtlasMine(address);

export function handleDeposit(event: DepositEvent): void {
  const params = event.params;

  const userId = params.user;
  const user = getOrCreateUser(userId);
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
  deposit.mine = getOrCreateAtlasMine(event.address).id;
  deposit.user = user.id;
  deposit.save();
}

export function handleStaked(event: Staked): void {
  const params = event.params;
  const quantity = params.amount;

  let userId = getUserOrMultisigAddress(event);
  const user = getOrCreateUser(userId);
  user.boosts = user.boosts + quantity.toI32();
  user.boost = params.currentBoost.divDecimal(ONE).toString();
  user.save();

  const addressId = getAddressId(params.nft, params.tokenId);
  const stakedTokenId = userId.concat(addressId);
  let stakedToken = StakedToken.load(stakedTokenId);
  if (!stakedToken) {
    stakedToken = new StakedToken(stakedTokenId);
    stakedToken.mine = event.address;
    stakedToken.quantity = ZERO_BI;
    stakedToken.token = addressId;
    stakedToken.user = user.id;
  }

  stakedToken.quantity = stakedToken.quantity.plus(quantity);
  stakedToken.save();
}

export function handleUnstaked(event: Unstaked): void {
  const params = event.params;
  const quantity = params.amount;

  const userId = getUserOrMultisigAddress(event);
  const user = getOrCreateUser(userId);
  user.boosts = user.boosts - quantity.toI32();
  user.boost = params.currentBoost.divDecimal(ONE).toString();
  user.save();

  const stakedToken = StakedToken.load(
    userId.concat(getAddressId(params.nft, params.tokenId))
  );
  if (stakedToken) {
    stakedToken.quantity = stakedToken.quantity.minus(quantity);
    stakedToken.save();
    if (stakedToken.quantity.toI32() == 0) {
      store.remove("StakedToken", stakedToken.id.toHexString());
    }
  }
}

export function handleWithdraw(event: WithdrawEvent): void {
  let params = event.params;
  let userId = params.user;
  let id = getAddressId(userId, params.index);

  let deposit = Deposit.load(id);
  if (!deposit) {
    log.error("Unknown deposit: {}", [id.toHexString()]);
    return;
  }

  let withdraw = Withdraw.load(id);
  if (!withdraw) {
    withdraw = new Withdraw(id);
    withdraw.deposit = id;
    withdraw.mine = event.address;
    withdraw.user = userId;
  }

  const user = getOrCreateUser(userId);
  user.deposited = user.deposited.minus(params.amount);
  user.save();

  deposit.withdrawal = id;
  deposit.save();

  withdraw.amount = withdraw.amount.plus(params.amount);
  withdraw.save();
}
