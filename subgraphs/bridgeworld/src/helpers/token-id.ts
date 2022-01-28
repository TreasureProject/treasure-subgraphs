import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import { LEGION_ADDRESS } from "@treasure/constants";
import { getAddressId } from ".";
import { LegionInfo, Pilgrimage, Token, User } from "../../generated/schema";

const TREASURE_IDS: number[] = [
  39,
  46,
  47,
  48,
  49,
  51,
  52,
  53,
  54,
  68,
  69,
  71,
  72,
  73,
  74,
  75,
  76,
  77,
  79,
  82,
  91,
  92,
  93,
  94,
  95,
  96,
  97,
  98,
  99,
  100,
  103,
  104,
  105,
  114,
  115,
  116,
  117,
  132,
  133,
  141,
  151,
  152,
  153,
  161,
  162,
  164,
];

function isTreasure(tokenId: number): boolean {
  return TREASURE_IDS.includes(tokenId);
}

export function getImageHash(tokenId: BigInt, name: string): string {
  let id = tokenId.toI32();

  switch (true) {
    case id == 151:
      return `ipfs://Qmbyy8EWMzrSTSGG1bDNsYZfvnkcjAFNM5TXJqvsbuY8Dz/Silver Penny.gif`;
    case isTreasure(id):
      return `ipfs://Qmbyy8EWMzrSTSGG1bDNsYZfvnkcjAFNM5TXJqvsbuY8Dz/${name}.gif`;
    case [45, 70, 90, 131, 150, 160].includes(id):
      return `ipfs://QmTd8siTE6Ys2XTLNerPySYQowdeDkZjSTViYpBf54GnXx/${name}.gif`;
    default:
      return `ipfs://QmRqosGZZ6icx6uSDjLuFFMJiWDefZAiAZdpJdBK9BP5S4/${name}.png`;
  }
}

export function getName(tokenId: BigInt): string {
  let id = tokenId.toI32();

  switch (id) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
    case 18:
    case 19:
    case 20:
    case 21:
    case 22:
    case 23:
    case 24:
    case 25:
    case 26:
    case 27:
    case 28:
    case 29:
    case 30:
    case 31:
    case 32:
    case 33:
    case 34:
    case 35:
    case 36:
    case 37:
    case 38:
      return `All-Class ${id}`;
    case 39:
      return "Ancient Relic";
    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
      return `Assassin ${id - 39}`;
    case 45:
      return "Assassin";
    case 46:
      return "Bag of Rare Mushrooms";
    case 47:
      return "Bait for Monsters";
    case 48:
      return "Beetle-wing";
    case 49:
      return "Blue Rupee";
    case 50:
      return "Bombmaker";
    case 51:
      return "Bottomless Elixir";
    case 52:
      return "Cap of Invisibility";
    case 53:
      return "Carriage";
    case 54:
      return "Castle";
    case 55:
      return "Clocksnatcher";
    case 56:
    case 57:
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 65:
    case 66:
    case 67:
      return `Common ${id - 55}`;
    case 68:
      return "Common Bead";
    case 69:
      return "Common Feather";
    case 70:
      return "Common Legion";
    case 71:
      return "Common Relic";
    case 72:
      return "Cow";
    case 73:
      return "Diamond";
    case 74:
      return "Divine Hourglass";
    case 75:
      return "Divine Mask";
    case 76:
      return "Donkey";
    case 77:
      return "Dragon Tail";
    case 78:
      return "Dreamwinder";
    case 79:
      return "Emerald";
    case 80:
      return "Extra Life";
    case 81:
      return "Fallen";
    case 82:
      return "Favor from the Gods";
    case 83:
    case 84:
    case 85:
    case 86:
    case 87:
    case 88:
    case 89:
      return `Fighter ${id - 82}`;
    case 90:
      return "Fighter";
    case 91:
      return "Framed Butterfly";
    case 92:
      return "Gold Coin";
    case 93:
      return "Grain";
    case 94:
      return "Green Rupee";
    case 95:
      return "Grin";
    case 96:
      return "Half-Penny";
    case 97:
      return "Honeycomb";
    case 98:
      return "Immovable Stone";
    case 99:
      return "Ivory Breastpin";
    case 100:
      return "Jar of Fairies";
    case 102:
      return "Keys";
    case 103:
      return "Lumber";
    case 104:
      return "Military Stipend";
    case 105:
      return "Mollusk Shell";
    case 106:
    case 107:
    case 108:
    case 109:
    case 110:
    case 111:
    case 112:
    case 113:
      return `Numeraire ${id - 105}`;
    case 114:
      return "Ox";
    case 115:
      return "Pearl";
    case 116:
      return "Pot of Gold";
    case 117:
      return "Quarter-Penny";
    case 118:
    case 119:
    case 120:
    case 121:
    case 122:
    case 123:
    case 124:
    case 125:
    case 126:
    case 127:
    case 128:
    case 129:
    case 130:
      return `Range ${id - 117}`;
    case 131:
      return "Range";
    case 132:
      return "Red Feather";
    case 133:
      return "Red Rupee";
    case 134:
    case 135:
    case 136:
    case 137:
    case 138:
    case 139:
    case 140:
      return `Riverman ${id - 133}`;
    case 141:
      return "Score of Ivory";
    case 142:
    case 143:
      return `Seed of Life ${id - 141}`;
    case 144:
    case 145:
    case 146:
    case 147:
    case 148:
    case 149:
      return `Siege ${id - 143}`;
    case 150:
      return "Siege";
    case 151:
      return "Silver Coin";
    case 152:
      return "Small Bird";
    case 153:
      return "Snow White Feather";
    case 154:
    case 155:
    case 156:
    case 157:
    case 158:
    case 159:
      return `Spellcaster ${id - 153}`;
    case 160:
      return "Spellcaster";
    case 161:
      return "Thread of Divine Silk";
    case 162:
      return "Unbreakable Pocketwatch";
    case 163:
      return "Warlock";
    case 164:
      return "Witches Broom";
    default:
      log.error(`Name not handled: {}`, [id.toString()]);

      return "";
  }
}

export function getRarity(tokenId: BigInt): string {
  let id = tokenId.toI32();

  switch (id) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
    case 18:
    case 19:
    case 20:
    case 21:
    case 22:
    case 23:
    case 24:
    case 25:
    case 26:
    case 27:
    case 28:
    case 29:
    case 30:
    case 31:
    case 32:
    case 33:
    case 34:
    case 35:
    case 36:
    case 37:
    case 38:
    case 68:
    case 72:
    case 75:
    case 82:
    case 91:
    case 100:
    case 116:
    case 141:
    case 152:
    case 162:
      return "Rare";
    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 49:
    case 69:
    case 71:
    case 76:
    case 83:
    case 84:
    case 85:
    case 86:
    case 87:
    case 88:
    case 89:
    case 90:
    case 93:
    case 94:
    case 103:
    case 114:
    case 118:
    case 119:
    case 120:
    case 121:
    case 122:
    case 123:
    case 124:
    case 125:
    case 126:
    case 127:
    case 128:
    case 129:
    case 130:
    case 131:
    case 144:
    case 145:
    case 146:
    case 147:
    case 148:
    case 149:
    case 150:
    case 154:
    case 155:
    case 156:
    case 157:
    case 158:
    case 159:
    case 160:
    case 164:
      return "Uncommon";
    case 39:
    case 50:
    case 51:
    case 52:
    case 54:
    case 55:
    case 78:
    case 81:
    case 95:
    case 97:
    case 163:
      return "Legendary";
    case 46:
    case 47:
    case 53:
    case 74:
    case 98:
    case 99:
    case 104:
    case 105:
    case 132:
    case 153:
    case 161:
      return "Epic";
    case 106:
    case 107:
    case 108:
    case 109:
    case 110:
    case 111:
    case 112:
    case 113:
    case 134:
    case 135:
    case 136:
    case 137:
    case 138:
    case 139:
    case 140:
      return "Special";
    default:
      return "Common";
  }
}

const RARITY = [
  "Legendary",
  "Rare",
  "Special",
  "Uncommon",
  "Common",
  "Recruit",
];

const CLASS = [
  "Recruit",
  "Siege",
  "Fighter",
  "Assassin",
  "Ranged",
  "Spellcaster",
  "Riverman",
  "Numeraire",
  "All-Class",
  "Origin",
];

const TYPE = ["Genesis", "Auxiliary", "Recruit"];

const BOOST_MATRIX = [
  // GENESIS
  // LEGENDARY,RARE,SPECIAL,UNCOMMON,COMMON,RECRUIT
  [600e16, 200e16, 75e16, 100e16, 50e16, 0],
  // AUXILIARY
  // LEGENDARY,RARE,SPECIAL,UNCOMMON,COMMON,RECRUIT
  [0, 25e16, 0, 10e16, 5e16, 0],
  // RECRUIT
  // LEGENDARY,RARE,SPECIAL,UNCOMMON,COMMON,RECRUIT
  [0, 0, 0, 0, 0, 0],
];

function getLegionId(tokenId: BigInt): string {
  return getAddressId(LEGION_ADDRESS, tokenId);
}

export function createLegion(
  owner: Address,
  tokenId: BigInt,
  generation: i32,
  role: i32,
  rarity: i32,
  pilgrimageId: string
): void {
  // let params = event.params;
  // let tokenId = params._tokenId;
  let id = getLegionId(tokenId);
  let token = Token.load(id);
  let ipfs = "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC";

  let tid = tokenId.toI32();

  if ([2, 659, 1358].includes(tid)) {
    log.warning("[cheese] pid: {}, token: {}", [
      pilgrimageId,
      token == null ? "no" : "yes",
    ]);
  }
  // let pilgrimage =

  if (!token) {
    token = new Token(id);

    token.contract = LEGION_ADDRESS;
    token.rarity = "None";
    token.tokenId = tokenId;
  }

  if (pilgrimageId != "") {
    // Handle setup
    let pilgrimage = Pilgrimage.load(pilgrimageId);

    if (pilgrimage) {
      let legacy = Token.load(pilgrimage.token);

      if (legacy) {
        let legacyId = legacy.tokenId.toI32();

        if ([50, 55, 78, 81, 163].includes(legacyId)) {
          token.name = legacy.name;
          token.rarity = "Legendary";
        }

        if (token.image == null || token.image == "") {
          switch (legacyId) {
            case 50:
            case 55:
            case 78:
            case 81:
            case 163:
              token.image = getImageHash(legacy.tokenId, legacy.name)
                .split(" ")
                .join("%20");

              break;
            case 56:
            case 57:
            case 58:
            case 59:
            case 60:
            case 61:
            case 62:
            case 63:
            case 64:
            case 65:
            case 66:
            case 67:
            case 70:
              token.image = "";

              break;
            default:
              token.image = getImageHash(legacy.tokenId, legacy.name)
                .split(" ")
                .join("%20");

              break;
          }
        }

        if ([2, 659, 1358].includes(tid)) {
          log.warning("[cheese] legacy: {}, image: {}", [
            legacy.tokenId.toString(),
            token.image,
          ]);
        }

        // // Now see if we are a 1/1
        // if ([].includes(legacy.tokenId.toI32())) {
        //   // 1/1
        //   token.image = getImageHash(legacy.tokenId, legacy.name);
        //   token.name = legacy.name;
        //   token.rarity = "Legendary";
        // } else if ([])
      }
      // now what???

      if (pilgrimage) {
        store.remove("Pilgrimage", pilgrimage.id);
      }
    }

    token.save();

    return;
  }

  let metadataId = `${id}-metadata`;
  let metadata = LegionInfo.load(metadataId);

  if ([2, 659, 1358].includes(tid)) {
    log.warning("[cheese] pid: {}, token: {}, meta: {}", [
      pilgrimageId,
      token == null ? "no" : "yes",
      metadata == null ? "no" : "yes",
    ]);
  }

  if (!metadata) {
    metadata = new LegionInfo(metadataId);
  }

  // TODO: Add Crafting XP
  // TODO: Add Questing XP
  metadata.boost = `${BOOST_MATRIX[generation][rarity] / 1e18}`;
  metadata.crafting = 1;
  metadata.questing = 1;
  metadata.rarity = RARITY[rarity];
  metadata.role = CLASS[role];
  metadata.type = TYPE[generation];
  metadata.summons = BigInt.zero();

  metadata.save();

  /*
    let name = getName(data.tokenId);

    token.contract = data.contract;
    token.image = getImageHash(data.tokenId, name)
      .split(" ")
      .join("%20");
    token.name = name;
    token.rarity = getRarity(data.tokenId);
    token.tokenId = data.tokenId;
  */
  // let ipfs = "ipfs://QmeR9k2WJcSiiuUGY3Wvjtahzo3UUaURiPpLEapFcDe9JC";

  if ([2, 659, 1358].includes(tid)) {
    log.warning("[cheese] before-image: {}", [token.image]);
  }

  // if (metadata.rarity == "Common") {
  if (token.image == "") {
    // log.warning("setting legion image for: {}, image = `{}`", [
    //   tokenId.toString(),
    //   token.image ? token.image : "null",
    // ]);
    token.image = `${ipfs}/${metadata.rarity}%20${metadata.role}.gif`;
  }

  if ([2, 659, 1358].includes(tid)) {
    log.warning("[cheese] after-image: {}", [token.image]);
  }
  // }

  token.category = "Legion";
  token.name = `${metadata.type} ${metadata.rarity}`;
  token.metadata = metadata.id;
  token.rarity = metadata.rarity.replace("Recruit", "None");

  if (metadata.type == "Recruit") {
    let user = User.load(owner.toHexString());

    if (user) {
      user.recruit = token.id;
      user.save();
    }

    token.image = `${ipfs}/Recruit.gif`;
    token.name = "Recruit";
  }

  token.save();
}
