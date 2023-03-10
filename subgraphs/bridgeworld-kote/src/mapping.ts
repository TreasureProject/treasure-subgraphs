import { Address, Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  KOTE_POTIONS_ADDRESS,
  KOTE_TRINKETS_ADDRESS,
} from "@treasure/constants";

import { TransferSingle } from "../generated/KOTE Potions/ERC1155";
import { KoteSquires, Transfer } from "../generated/KOTE Squires/KoteSquires";
import { Item, Squire, UserItem } from "../generated/schema";

const SQUIRE_TYPES = ["", "Strength", "Wisdom", "Luck", "Faith"];
const POTION_NAMES = [
  "Luck Potion",
  "Levitation Potion",
  "Strong Brew",
  "Pava Root Potion",
  "Spring Water Flask",
  "Mirroring Potion",
  "Phial of Defense",
  "Slime Vial",
  "Ichor Draft",
  "Holy Water",
  "Murky Flask",
  "Arcane Brew",
  "Berserkers Brew",
  "Spirit Vial",
  "Flask of Resolve",
  "Lucidity Elixir",
  "Philter of Redemption",
  "Lavender Extract",
  "Trippie Draught",
  "Phantom Phial",
  "Bloodlust Flask",
  "Misty Phial",
  "Spirit Elixir",
  "Dew Drop Vial",
  "Master Brew",
];
const TRINKET_NAMES = [
  "Wee Red Mushroom",
  "Pine Resin",
  "Birdcage",
  "Glowing Rune",
  "Ether Crystal",
  "Rabbit Foot",
  "Poisonous Frog",
  "Acorns",
  "Torch",
  "Dream Amulet",
  "Dusty Scroll",
  "Crustacean Claw",
  "Goblet",
  "Draca Fangs",
  "Gargoyle",
  "Bat Wing",
  "Runic Tome",
  "Lucky Die",
  "Golem Eye",
  "Phoenix Egg",
  "Abyssal Talisman",
  "Enchanted Goggles",
  "Magic Coinpurse",
  "Hand Candle",
  "Mask of Valathor",
  "Wild Cucumber",
  "Underdark Egg",
];

const getSquireMetadata = (genesis: i32, type: i32): string[] => {
  const typeName = SQUIRE_TYPES[type];
  return [
    genesis == 1 ? `Genesis ${typeName}` : typeName,
    `https://knightsoftheether.com/squires/images/${typeName.toLowerCase()}${
      genesis == 1 ? "G" : ""
    }.png`,
  ];
};

const getItemMetadata = (contract: Address, tokenId: i32): string[] => {
  const index = tokenId % 100;
  let itemType = "";
  let itemName = "";
  if (contract.equals(KOTE_POTIONS_ADDRESS)) {
    itemType = "Potions";
    itemName = POTION_NAMES[index];
  } else if (contract.equals(KOTE_TRINKETS_ADDRESS)) {
    itemType = "Trinkets";
    itemName = TRINKET_NAMES[index];
  }

  return [
    itemType,
    itemName,
    `https://knightsoftheether.com/squires/images/${itemType.toLowerCase()}/${itemName.replaceAll(
      " ",
      "%20"
    )}.png`,
  ];
};

export function handleTransfer(event: Transfer): void {
  const params = event.params;
  const tokenId = params.tokenId;

  const contract = KoteSquires.bind(event.address);
  const squireId = Bytes.fromI32(tokenId.toI32());
  let squire = Squire.load(squireId);
  if (!squire) {
    squire = new Squire(squireId);
    squire.tokenId = tokenId.toI32();

    const type = contract.try_squireTypeByTokenId(tokenId);
    if (type.reverted) {
      log.error("Error reading Squire type value: {}", [tokenId.toString()]);
      return;
    }

    const genesis = contract.try_genesisByTokenId(tokenId);
    if (genesis.reverted) {
      log.error("Error reading Squire genesis value: {}", [tokenId.toString()]);
      return;
    }

    const metadata = getSquireMetadata(
      genesis.value.toI32(),
      type.value.toI32()
    );
    squire.genesis = genesis.value.toI32();
    squire.type = type.value.toI32();
    squire.name = metadata[0];
    squire.image = metadata[1];
  }

  const faith = contract.try_faithByTokenId(tokenId);
  if (faith.reverted) {
    log.warning("Error reading Squire faith value: {}", [tokenId.toString()]);
    squire.faith = 0;
  } else {
    squire.faith = faith.value.toI32();
  }

  const luck = contract.try_luckByTokenId(tokenId);
  if (luck.reverted) {
    log.warning("Error reading Squire luck value: {}", [tokenId.toString()]);
    squire.luck = 0;
  } else {
    squire.luck = luck.value.toI32();
  }

  const strength = contract.try_strengthByTokenId(tokenId);
  if (strength.reverted) {
    log.warning("Error reading Squire strength value: {}", [
      tokenId.toString(),
    ]);
    squire.strength = 0;
  } else {
    squire.strength = strength.value.toI32();
  }

  const wisdom = contract.try_wisdomByTokenId(tokenId);
  if (wisdom.reverted) {
    log.warning("Error reading Squire wisdom value: {}", [tokenId.toString()]);
    squire.wisdom = 0;
  } else {
    squire.wisdom = wisdom.value.toI32();
  }

  squire.owner = params.to;
  squire.save();
}

export function handleItemTransfer(event: TransferSingle): void {
  const params = event.params;
  const itemId = event.address.concatI32(params.id.toI32());
  let item = Item.load(itemId);
  if (!item) {
    item = new Item(itemId);

    const metadata = getItemMetadata(event.address, params.id.toI32());
    item.contract = event.address;
    item.tokenId = params.id.toI32();
    item.type = metadata[0];
    item.name = metadata[1];
    item.image = metadata[2];
    item.save();
  }

  if (params.from.notEqual(Address.zero())) {
    const fromUserItem = UserItem.load(params.from.concat(itemId));
    if (fromUserItem) {
      fromUserItem.quantity -= params.value.toI32();
      if (fromUserItem.quantity == 0) {
        store.remove("UserItem", fromUserItem.id.toHexString());
      } else {
        fromUserItem.save();
      }
    } else {
      log.warning("User item not found: {}, {}", [
        params.from.toHexString(),
        params.id.toString(),
      ]);
    }
  }

  const userItemId = params.to.concat(itemId);
  let toUserItem = UserItem.load(userItemId);
  if (!toUserItem) {
    toUserItem = new UserItem(userItemId);
    toUserItem.owner = params.to;
    toUserItem.item = item.id;
    toUserItem.quantity = 0;
  }

  toUserItem.quantity += params.value.toI32();
  toUserItem.save();
}
