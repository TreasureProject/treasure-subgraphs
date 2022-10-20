import { assert, test } from "matchstick-as";

import { Address, Bytes } from "@graphprotocol/graph-ts";

import {
  handleApprovalERC20,
  handleApprovalERC721,
  handleApprovalERC1155,
} from "../src/mapping";
import {
  createApprovalAllERC721Event,
  createApprovalAllERC1155Event,
  createApprovalERC20Event,
} from "./helpers/approval";

const ADDRESS = "0x88f9efb3a7f728fdb2b8872fe994c84b1d148f65";
const USER = "0xb013abd83f0bd173e9f14ce7d6e420ad711483b4";
const OPERATOR = "0x2830eb1183c6e03489a3a72621e1f3fe2b9158c3";
const ID = Address.fromString(ADDRESS)
  .concat(Address.fromString(OPERATOR))
  .concat(Address.fromString(USER))
  .concat(Bytes.fromI32(1))
  .toHexString();
const APPROVAL_ENTITY = "Approval";
const USER_ENTITY = "User";

test("erc1155 approval is handled", () => {
  handleApprovalERC1155(
    createApprovalAllERC1155Event(ADDRESS, USER, OPERATOR, true)
  );

  assert.fieldEquals(APPROVAL_ENTITY, ID, "contract", ADDRESS);
  assert.fieldEquals(APPROVAL_ENTITY, ID, "operator", OPERATOR);
  assert.fieldEquals(USER_ENTITY, USER, "approvals", `[${ID}]`);

  handleApprovalERC1155(
    createApprovalAllERC1155Event(ADDRESS, USER, OPERATOR, false)
  );

  assert.fieldEquals(USER_ENTITY, USER, "approvals", "[]");
});

test("erc721 approval is handled", () => {
  handleApprovalERC721(
    createApprovalAllERC721Event(ADDRESS, USER, OPERATOR, true)
  );

  assert.fieldEquals(APPROVAL_ENTITY, ID, "contract", ADDRESS);
  assert.fieldEquals(APPROVAL_ENTITY, ID, "operator", OPERATOR);
  assert.fieldEquals(USER_ENTITY, USER, "approvals", `[${ID}]`);

  handleApprovalERC721(
    createApprovalAllERC721Event(ADDRESS, USER, OPERATOR, false)
  );

  assert.fieldEquals(USER_ENTITY, USER, "approvals", "[]");
});

test("erc20 approval is handled", () => {
  handleApprovalERC20(createApprovalERC20Event(ADDRESS, USER, OPERATOR, 100));

  assert.fieldEquals(APPROVAL_ENTITY, ID, "contract", ADDRESS);
  assert.fieldEquals(APPROVAL_ENTITY, ID, "operator", OPERATOR);
  assert.fieldEquals(APPROVAL_ENTITY, ID, "amount", "100");
  assert.fieldEquals(USER_ENTITY, USER, "approvals", `[${ID}]`);

  handleApprovalERC20(createApprovalERC20Event(ADDRESS, USER, OPERATOR, 0));

  assert.fieldEquals(USER_ENTITY, USER, "approvals", "[]");
});
