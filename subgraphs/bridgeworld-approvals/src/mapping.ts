import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import { ApprovalForAll as ApprovalForAllERC721 } from "../generated/Legion/ERC721";
import { Approval as ApprovalERC20 } from "../generated/Magic/ERC20";
import { ApprovalForAll as ApprovalForAllERC1155 } from "../generated/Treasure/ERC1155";
import { Approval, User } from "../generated/schema";

const ensureUser = (id: Address): User => {
  let user = User.load(id);

  if (!user) {
    user = new User(id);
    user.save();
  }

  return user;
};

const handleApproval = (
  userAddress: Address,
  contract: Address,
  operator: Address,
  approved: boolean,
  amount: BigInt | null = null
): void => {
  const user = ensureUser(userAddress);
  const id = contract.concat(operator).concat(user.id);

  if (store.get("Approval", id.toHexString())) {
    store.remove("Approval", id.toHexString());
  }

  if (approved) {
    const approval = new Approval(id);

    approval.user = user.id;
    approval.contract = contract;
    approval.operator = operator;
    approval.amount = amount;

    approval.save();
  }
};

export function handleApprovalERC1155(event: ApprovalForAllERC1155): void {
  const params = event.params;
  handleApproval(
    params.account,
    event.address,
    params.operator,
    params.approved
  );
}

export function handleApprovalERC721(event: ApprovalForAllERC721): void {
  const params = event.params;
  handleApproval(params.owner, event.address, params.operator, params.approved);
}

export function handleApprovalERC20(event: ApprovalERC20): void {
  const params = event.params;
  const amount = params.value;
  handleApproval(
    params.owner,
    event.address,
    params.spender,
    amount.gt(BigInt.zero()),
    amount
  );
}
