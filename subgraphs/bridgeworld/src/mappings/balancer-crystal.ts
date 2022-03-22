import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  ApprovalForAll,
  TransferBatch,
  TransferSingle,
} from "../../generated/Consumable/ERC1155";
import { Approval, Token, User, UserApproval } from "../../generated/schema";
import { getAddressId, isMint } from "../helpers";
import * as common from "../mapping";

function getName(tokenId: i32): string {
  switch (tokenId) {
    case 1:
      return "Balancer Crystal";
    default:
      log.error("Unhandled balancer crystal name: {}", [tokenId.toString()]);

      return "";
  }
}

function setMetadata(contract: Address, tokenId: BigInt): void {
  let token = Token.load(getAddressId(contract, tokenId));

  if (!token) {
    log.error("Unknown balancer crystal token: {}", [tokenId.toString()]);

    return;
  }

  token.category = "Crystal";
  token.name = getName(tokenId.toI32());
  token.image =
    `ipfs://QmZxhxnzWZbhYDiBeoqHgGyBKefPkHaFYa2hqFFyhfa99S/${token.name}.gif`
      .split(" ")
      .join("%20");
  token.rarity = "None";

  token.save();
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  let params = event.params;

  let userId = params.account.toHexString();
  let user = User.load(userId);

  if (!user) {
    log.error("Unknown user: {}", [userId]);

    return;
  }

  let contract = event.address;
  let operator = params.operator;

  let approvalId = `${contract.toHexString()}-${operator.toHexString()}`;
  let approval = Approval.load(approvalId);

  if (!approval) {
    approval = new Approval(approvalId);

    approval.contract = contract;
    approval.operator = operator;

    approval.save();
  }

  let userApprovalId = `${user.id}-${approval.id}`;

  if (params.approved) {
    let userApproval = new UserApproval(userApprovalId);

    userApproval.approval = approval.id;
    userApproval.user = user.id;

    userApproval.save();
  } else {
    store.remove("UserApproval", userApprovalId);
  }
}

export function handleTransferBatch(event: TransferBatch): void {
  let params = event.params;

  for (let index = 0; index < params.ids.length; index++) {
    let id = params.ids[index];
    let value = params.values[index];

    common.handleTransfer(event.address, params.from, params.to, id, value);

    if (isMint(params.from)) {
      setMetadata(event.address, id);
    }
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let params = event.params;

  common.handleTransfer(
    event.address,
    params.from,
    params.to,
    params.id,
    params.value
  );

  if (isMint(params.from)) {
    setMetadata(event.address, params.id);
  }
}
