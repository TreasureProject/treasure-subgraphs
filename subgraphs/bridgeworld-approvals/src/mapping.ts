import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";

import { ApprovalForAll as ApprovalForAllERC721 } from "../generated/Legion/ERC721";
import { Approval as ApprovalERC20 } from "../generated/Magic/ERC20";
import { ApprovalForAll as ApprovalForAllERC1155 } from "../generated/Treasure/ERC1155";
import { Approval, User } from "../generated/schema";
import {
  BALANCER_CRYSTAL_ADDRESS,
  CONSUMABLE_ADDRESS,
  LEGACY_LEGION_ADDRESS,
  LEGACY_LEGION_GENESIS_ADDRESS,
  LEGION_ADDRESS,
  MAGIC_ADDRESS,
  TREASURE_ADDRESS,
  TREASURE_FRAGMENT_ADDRESS,
} from "@treasure/constants";

const SUPPORTED_OPERATORS = [
  CONSUMABLE_ADDRESS.toHexString(),
  BALANCER_CRYSTAL_ADDRESS.toHexString(),
  LEGION_ADDRESS.toHexString(),
  LEGACY_LEGION_ADDRESS.toHexString(),
  LEGACY_LEGION_GENESIS_ADDRESS.toHexString(),
  MAGIC_ADDRESS.toHexString(),
  TREASURE_ADDRESS.toHexString(),
  TREASURE_FRAGMENT_ADDRESS.toHexString(),
];

const ensureUser = (id: Address): User => {
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.approvals = new Array<Bytes>();
    user.save();
  }

  return user;
};

const handleApproval = (
  userAddress: Address,
  contract: Address,
  operator: Address,
  approved: boolean,
  block: BigInt,
  amount: BigInt | null = null
): void => {
  if (!SUPPORTED_OPERATORS.includes(operator.toHexString())) {
    log.debug("[approvals] Ignoring unsupported operator: {}", [
      operator.toHexString(),
    ]);
    return;
  }

  const user = ensureUser(userAddress);
  const base = contract.concat(operator);
  const id = base.concat(user.id).concatI32(block.toI32());

  for (let index = 0; index < user.approvals.length; index++) {
    const approval = user.approvals[index].toHexString();
    if (approval.startsWith(base.toHexString())) {
      user.approvals = user.approvals
        .slice(0, index)
        .concat(user.approvals.slice(index + 1));
      user.save();
    }
  }

  if (approved) {
    const approval = new Approval(id);
    approval.user = user.id;
    approval.contract = contract;
    approval.operator = operator;
    approval.amount = amount;
    approval.save();

    user.approvals = user.approvals.concat([id]);
    user.save();
  }
};

export function handleApprovalERC1155(event: ApprovalForAllERC1155): void {
  const params = event.params;
  handleApproval(
    params.account,
    event.address,
    params.operator,
    params.approved,
    event.block.number
  );
}

export function handleApprovalERC721(event: ApprovalForAllERC721): void {
  const params = event.params;
  handleApproval(
    params.owner,
    event.address,
    params.operator,
    params.approved,
    event.block.number
  );
}

export function handleApprovalERC20(event: ApprovalERC20): void {
  const params = event.params;
  const amount = params.value;
  handleApproval(
    params.owner,
    event.address,
    params.spender,
    amount.gt(BigInt.zero()),
    event.block.number,
    amount
  );
}
