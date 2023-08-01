import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import { BURNER_ADDRESS } from "@treasure/constants";

import {
  TransferBatch,
  TransferSingle,
} from "../generated/Smol Treasures/ERC1155";
import { Global, Token } from "../generated/schema";

const TOKEN_NAMES = [
  "",
  "MoonRock",
  "Stardust",
  "CometShard",
  "LunarGold",
  "AlienRelic",
];

const getOrCreateGlobal = (): Global => {
  const id = Bytes.fromI32(1);
  let global = Global.load(id);
  if (!global) {
    global = new Global(id);
    global.burnCount = 0;
  }

  return global;
};

const getOrCreateToken = (tokenId: BigInt): Token => {
  const id = Bytes.fromI32(tokenId.toI32());
  let token = Token.load(id);
  if (!token) {
    token = new Token(id);
    token.name = TOKEN_NAMES[tokenId.toI32()];
    token.burnCount = 0;
  }

  return token;
};

const handleTransferCommon = (
  tokenId: BigInt,
  to: Address,
  quantity: i32 = 1
): void => {
  // Ignore transfers not sent to the burn address
  if (!to.equals(BURNER_ADDRESS)) {
    return;
  }

  const token = getOrCreateToken(tokenId);
  (token.burnCount += quantity), token.save();

  const global = getOrCreateGlobal();
  global.burnCount += quantity;
  global.save();
};

export function handleTransferSingle(event: TransferSingle): void {
  const params = event.params;
  handleTransferCommon(params.id, params.to, params.value.toI32());
}

export function handleTransferBatch(event: TransferBatch): void {
  const params = event.params;
  for (let i = 0; i < params.ids.length; i += 1) {
    handleTransferCommon(params.ids[i], params.to, params.values[i].toI32());
  }
}
