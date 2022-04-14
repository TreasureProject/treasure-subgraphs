import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  ApprovalForAll,
  TransferBatch,
  TransferSingle,
} from "../../generated/Treasure Fragment/ERC1155";
import {
  Approval,
  Token,
  TreasureFragmentInfo,
  User,
  UserApproval,
} from "../../generated/schema";
import { getAddressId, isMint } from "../helpers";
import * as common from "../mapping";

function getCategories(tokenId: i32): string[] {
  switch (true) {
    case [1, 2, 3, 4, 5].includes(tokenId):
      return ["Alchemy", "Arcana"];
    case [6, 7, 8, 9, 10].includes(tokenId):
      return ["Enchanter", "Leatherworking"];
    case [11, 12, 13, 14, 15].includes(tokenId):
      return ["Smithing", "Brewing"];
    default:
      log.error("Unhandled treasure fragment category: {}", [
        tokenId.toString(),
      ]);

      return [];
  }
}

function getTier(tokenId: i32): i32 {
  switch (true) {
    case [1, 6, 11].includes(tokenId):
      return 1;
    case [2, 7, 12].includes(tokenId):
      return 2;
    case [3, 8, 13].includes(tokenId):
      return 3;
    case [4, 9, 14].includes(tokenId):
      return 4;
    case [5, 10, 15].includes(tokenId):
      return 5;
    default:
      log.error("Unhandled treasure fragment tier: {}", [tokenId.toString()]);

      return 0;
  }
}

function setMetadata(contract: Address, tokenId: BigInt): void {
  let token = Token.load(getAddressId(contract, tokenId));

  if (!token) {
    log.error("[treasure-fragment-metadata] Unknown token: {}", [
      tokenId.toString(),
    ]);

    return;
  }

  let metadata = new TreasureFragmentInfo(`${token.id}-metadata`);

  metadata.categories = getCategories(tokenId.toI32());
  metadata.tier = getTier(tokenId.toI32());

  metadata.save();

  token.category = "TreasureFragment";
  token.metadata = metadata.id;

  token.save();
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  let params = event.params;

  let userId = params.account.toHexString();
  let user = User.load(userId);

  if (!user) {
    log.error("[treasure-fragment-approval] Unknown user: {}", [userId]);

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

    if (getTier(id.toI32()) == 0) {
      continue;
    }

    common.handleTransfer(event.address, params.from, params.to, id, value);

    if (isMint(params.from)) {
      setMetadata(event.address, id);
    }
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let params = event.params;

  if (getTier(params.id.toI32()) == 0) {
    return;
  }

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
