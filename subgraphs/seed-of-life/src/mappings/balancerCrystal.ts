import { BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  ApprovalForAll,
  TransferBatch,
  TransferSingle,
} from "../../generated/BalancerCrystal/ERC1155";
import { UserApproval } from "../../generated/schema";
import { ApprovalHelpers } from "../helpers/ApprovalHelpers";
import { TransferHelpers } from "../helpers/TransferHelpers";
import { UserApprovalHelpers } from "../helpers/UserApprovalHelpers";
import { UserHelpers } from "../helpers/UserHelpers";

export function handleTransferBatch(event: TransferBatch): void {
  let params = event.params;

  for (let index = 0; index < params.ids.length; index++) {
    let id = params.ids[index];

    TransferHelpers.handleTransfer(
      event.address,
      params.from,
      params.to,
      id,
      nameForId(id),
      params.values[index]
    );
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  TransferHelpers.handleTransfer(
    event.address,
    event.params.from,
    event.params.to,
    event.params.id,
    nameForId(event.params.id),
    event.params.value
  );
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  let user = UserHelpers.getOrCreateUser(event.params.account.toHexString());

  let contract = event.address;
  let operator = event.params.operator;

  let approval = ApprovalHelpers.getOrCreateApproval(contract, operator);

  let userApprovalId = UserApprovalHelpers.getUserApprovalId(user, approval);

  if (event.params.approved) {
    let userApproval = new UserApproval(userApprovalId);

    userApproval.approval = approval.id;
    userApproval.user = user.id;

    userApproval.save();
  } else {
    store.remove("UserApproval", userApprovalId);
  }
}

function nameForId(id: BigInt): string {
  switch (id.toI32()) {
    case 1:
      return "Balancer Crystal";
    default:
      log.error("[BalancerCrystal] Unknown id: {}", [id.toHexString()]);
      return "Unknown";
  }
}
