import { store } from "@graphprotocol/graph-ts";

import {
  ApprovalForAll,
  TransferBatch,
  TransferSingle,
} from "../../generated/SeedOfLife/ERC1155";
import { UserApproval } from "../../generated/schema";
import { getOrCreateApproval } from "../helpers/approval";
import { handleTransfer } from "../helpers/transfer";
import { getNameForTokenId } from "../helpers/treasure";
import { getOrCreateUser } from "../helpers/user";
import { getUserApprovalId } from "../helpers/user-approval";

export function handleTransferBatch(event: TransferBatch): void {
  let params = event.params;

  for (let index = 0; index < params.ids.length; index++) {
    let id = params.ids[index];

    handleTransfer(
      event.address,
      params.from,
      params.to,
      id,
      getNameForTokenId(id),
      params.values[index]
    );
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  handleTransfer(
    event.address,
    event.params.from,
    event.params.to,
    event.params.id,
    getNameForTokenId(event.params.id),
    event.params.value
  );
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  let user = getOrCreateUser(event.params.account.toHexString());

  let contract = event.address;
  let operator = event.params.operator;

  let approval = getOrCreateApproval(contract, operator);

  let userApprovalId = getUserApprovalId(user, approval);

  if (event.params.approved) {
    let userApproval = new UserApproval(userApprovalId);

    userApproval.approval = approval.id;
    userApproval.user = user.id;

    userApproval.save();
  } else {
    store.remove("UserApproval", userApprovalId);
  }
}
