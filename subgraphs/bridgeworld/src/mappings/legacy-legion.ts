import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  ApprovalForAll,
  TransferBatch,
  TransferSingle,
} from "../../generated/Legacy Legion/ERC1155";
import { Approval, Token, User, UserApproval } from "../../generated/schema";
import { LEGION_IPFS, LEGION_PFP_IPFS } from "../helpers";
import { getLegacyLegionImage } from "../helpers/legion";
import * as common from "../mapping";

function setMetadata(contract: Address, tokenId: BigInt): void {
  let token = Token.load(`${contract.toHexString()}-${tokenId.toHexString()}`);

  if (!token) {
    log.error("Unknown token: {}", [tokenId.toString()]);

    return;
  }

  token.generation = 1;
  token.image = getLegacyLegionImage(LEGION_IPFS, tokenId);
  token.imageAlt = getLegacyLegionImage(LEGION_PFP_IPFS, tokenId);
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

    setMetadata(event.address, id);
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

  setMetadata(event.address, params.id);
}
