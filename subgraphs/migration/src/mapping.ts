import {
  Address,
  BigInt,
  JSONValueKind,
  json,
  log,
} from "@graphprotocol/graph-ts";

import { BURNER_ADDRESS } from "@treasure/constants";

import {
  ERC1155,
  TransferBatch,
  TransferSingle,
} from "../generated/Treasure Fraction/ERC1155";
import { Transfer as TransferEvent } from "../generated/Treasure/ERC721";
import { L1Treasure } from "../generated/Treasure/L1Treasure";
import { Asset, Transfer, User, UserAsset } from "../generated/schema";
import { base64Decode } from "./helpers";

function addAssetToUser(asset: Asset, user: User): void {
  let id = `${user.id}-${asset.id}`;
  let userAsset = UserAsset.load(id);

  if (!userAsset) {
    userAsset = new UserAsset(id);

    userAsset.asset = asset.id;
    userAsset.quantity = 0;
    userAsset.user = user.id;
  }

  userAsset.quantity = userAsset.quantity + 1;
  userAsset.save();
}

function getAsset(name: string): Asset {
  let id = name
    .replace("Carrage", "Carriage")
    .replace("Silver Penny", "Silver Coin")
    .replace("Red FeatherSnow White Feather", "Snow White Feather")
    .replace("Red and White Feather", "Snow White Feather");

  let asset = Asset.load(id);

  if (!asset) {
    asset = new Asset(id);
    asset.save();
  }

  return asset;
}

function getFraction(address: Address, tokenId: BigInt): Asset | null {
  let contract = ERC1155.bind(address);

  // Base64 string
  let uri = contract.uri(tokenId);
  let bytes = base64Decode(uri);
  let length = bytes.length;
  let string = "";

  for (let index = 0; index < length; index++) {
    string += String.fromCharCode(bytes.at(index));
  }

  let data = json.fromString(string);

  if (data.kind == JSONValueKind.OBJECT) {
    let name = data.toObject().get("name");

    if (name != null) {
      return getAsset(name.toString());
    }
  }

  return null;
}

function getTransfer(
  user: Address,
  tokenId: BigInt,
  contract: string
): Transfer {
  let id = `${user.toHexString()}-${tokenId.toString()}`;
  let transfer = Transfer.load(id);

  if (!transfer) {
    transfer = new Transfer(id);

    transfer.contract = contract;
    transfer.quantity = 0;
    transfer.tokenId = tokenId;
    transfer.user = getUser(user).id;
  }

  return transfer;
}

function getUser(address: Address): User {
  let id = address.toHexString();
  let user = User.load(id);

  if (!user) {
    user = new User(id);
    user.save();
  }

  return user;
}

function handleTransfer(
  contract: string,
  from: Address,
  tokenId: BigInt,
  quantity: BigInt,
  to: Address,
  block: BigInt
): void {
  if (to.notEqual(BURNER_ADDRESS)) {
    return;
  }

  // Some were sent after this block, but this is when the migration closed
  if (block.gt(BigInt.fromString("13768569"))) {
    return;
  }

  let transfer = getTransfer(from, tokenId, contract);

  transfer.quantity = transfer.quantity + quantity.toI32();
  transfer.save();
}

export function handleTransfer721(event: TransferEvent): void {
  let params = event.params;
  let tokenId = params.tokenId;

  handleTransfer(
    "Treasure",
    params.from,
    tokenId,
    BigInt.fromI32(1),
    params.to,
    event.block.number
  );

  let contract = L1Treasure.bind(event.address);
  let assets: string[] = [];

  assets.push(contract.getAsset1(tokenId));
  assets.push(contract.getAsset2(tokenId));
  assets.push(contract.getAsset3(tokenId));
  assets.push(contract.getAsset4(tokenId));
  assets.push(contract.getAsset5(tokenId));
  assets.push(contract.getAsset6(tokenId));
  assets.push(contract.getAsset7(tokenId));
  assets.push(contract.getAsset8(tokenId));

  let user = getUser(params.from);

  for (let index = 0; index < 8; index++) {
    addAssetToUser(getAsset(assets[index]), user);
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let params = event.params;

  handleTransfer(
    "TreasureFraction",
    params.from,
    params.id,
    params.value,
    params.to,
    event.block.number
  );

  let asset = getFraction(event.address, params.id);

  if (asset) {
    addAssetToUser(asset, getUser(params.from));
  }
}

export function handleTransferBatch(event: TransferBatch): void {
  let params = event.params;
  let ids = params.ids;
  let quantities = params.values;
  let length = ids.length;
  let user = getUser(params.from);

  for (let index = 0; index < length; index++) {
    let id = ids[index];
    let quantity = quantities[index];

    handleTransfer(
      "TreasureFraction",
      params.from,
      id,
      quantity,
      params.to,
      event.block.number
    );

    let asset = getFraction(event.address, id);

    if (asset) {
      addAssetToUser(asset, user);
    }
  }
}
