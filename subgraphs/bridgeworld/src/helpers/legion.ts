import { BigInt, log } from "@graphprotocol/graph-ts";

import { LEGION_IPFS } from "./constants";
import { getName } from "./token-id";

export const TYPE = ["Genesis", "Auxiliary", "Recruit"];

export const RARITY = [
  "Legendary",
  "Rare",
  "Special",
  "Uncommon",
  "Common",
  "Recruit",
];

export const CLASS = [
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

const RARE_CLASS = [
  "Ashen Kingsguard",
  "Clockwork Marine",
  "Executioner",
  "Reaper",
  "Shadowguard",
];

const mapGenesisRareClass = (tokenId: BigInt): i32 => {
  const id = tokenId.toI32();
  switch (id) {
    case 1:
      return 2;
    case 2:
      return 1;
    case 3:
      return 4;
    case 4:
      return 0;
    case 5:
      return 3;
    case 6:
      return 3;
    case 7:
      return 3;
    case 8:
      return 3;
    case 9:
      return 3;
    case 10:
      return 4;
    case 11:
      return 4;
    case 12:
      return 4;
    case 13:
      return 2;
    case 14:
      return 2;
    case 15:
      return 2;
    case 16:
      return 2;
    case 17:
      return 1;
    case 18:
      return 1;
    case 19:
      return 1;
    case 20:
      return 1;
    case 21:
      return 0;
    case 22:
      return 0;
    case 23:
      return 0;
    case 24:
      return 3;
    case 25:
      return 4;
    case 26:
      return 2;
    case 27:
      return 1;
    case 28:
      return 3;
    case 29:
      return 4;
    case 30:
      return 2;
    case 31:
      return 1;
    case 32:
      return 3;
    case 33:
      return 2;
    case 34:
      return 1;
    case 35:
      return 3;
    case 36:
      return 4;
    case 37:
      return 2;
    case 38:
      return 1;
    default:
      log.error("Unknown Genesis Rare token ID: {}", [tokenId.toString()]);
      return 0;
  }
};

const mapGenesisVariant = (tokenId: BigInt): i32 => {
  const id = tokenId.toI32();
  switch (id) {
    // All-Class
    case 1:
      return 3;
    case 2:
      return 2;
    case 3:
      return 5;
    case 4:
      return 2;
    case 5:
      return 2;
    case 6:
      return 1;
    case 7:
      return 4;
    case 8:
      return 2;
    case 9:
      return 2;
    case 10:
      return 4;
    case 11:
      return 3;
    case 12:
      return 2;
    case 13:
      return 1;
    case 14:
      return 3;
    case 15:
      return 3;
    case 16:
      return 3;
    case 17:
      return 4;
    case 18:
      return 1;
    case 19:
      return 4;
    case 20:
      return 3;
    case 21:
      return 1;
    case 22:
      return 1;
    case 23:
      return 3;
    case 24:
      return 4;
    case 25:
      return 4;
    case 26:
      return 4;
    case 27:
      return 4;
    case 28:
      return 3;
    case 29:
      return 3;
    case 30:
      return 3;
    case 31:
      return 3;
    case 32:
      return 2;
    case 33:
      return 2;
    case 34:
      return 2;
    case 35:
      return 4;
    case 36:
      return 4;
    case 37:
      return 4;
    case 38:
      return 5;
    // Assassin
    case 40:
      return 1;
    case 41:
      return 3;
    case 42:
      return 2;
    case 43:
      return 5;
    case 44:
      return 4;
    // Fighter
    case 83:
      return 1;
    case 84:
      return 4;
    case 85:
      return 5;
    case 86:
      return 2;
    case 87:
      return 1;
    case 88:
      return 3;
    case 89:
      return 3;
    // Numeraire
    case 106:
      return 5;
    case 107:
      return 3;
    case 108:
      return 3;
    case 109:
      return 3;
    case 110:
      return 1;
    case 111:
      return 4;
    case 112:
      return 2;
    case 113:
      return 1;
    // Range
    case 118:
      return 3;
    case 119:
      return 2;
    case 120:
      return 3;
    case 121:
      return 4;
    case 122:
      return 4;
    case 123:
      return 2;
    case 124:
      return 2;
    case 125:
      return 1;
    case 126:
      return 5;
    case 127:
      return 4;
    case 128:
      return 3;
    case 129:
      return 2;
    case 130:
      return 5;
    // Riverman
    case 134:
      return 4;
    case 135:
      return 1;
    case 136:
      return 4;
    case 137:
      return 4;
    case 138:
      return 5;
    case 139:
      return 3;
    case 140:
      return 2;
    // Siege
    case 144:
      return 4;
    case 145:
      return 2;
    case 146:
      return 3;
    case 147:
      return 5;
    case 148:
      return 5;
    case 149:
      return 1;
    // Spellcaster
    case 154:
      return 5;
    case 155:
      return 3;
    case 156:
      return 2;
    case 157:
      return 2;
    case 158:
      return 4;
    case 159:
      return 1;
    default:
      log.error("Unknown Genesis token ID: {}", [tokenId.toString()]);
      return 0;
  }
};

const convertTokenIdToVariant = (
  tokenId: BigInt,
  mappedDigit1: string | null = null
): string => {
  let digits = tokenId.toString().slice(-2);
  if (digits.length == 1) {
    digits = `0${digits}`;
  }

  let variant = "";
  if (mappedDigit1) {
    variant += mappedDigit1;
  } else {
    const digit1 = parseInt(digits.charAt(0));
    if (digit1 <= 1) {
      variant += "1";
    } else if (digit1 <= 3) {
      variant += "2";
    } else if (digit1 <= 5) {
      variant += "3";
    } else if (digit1 <= 7) {
      variant += "4";
    } else if (digit1 <= 9) {
      variant += "5";
    }
  }

  const digit2 = parseInt(digits.charAt(1));
  if (digit2 <= 1) {
    variant += "A";
  } else if (digit2 <= 3) {
    variant += "B";
  } else if (digit2 <= 5) {
    variant += "C";
  } else if (digit2 <= 7) {
    variant += "D";
  } else if (digit2 <= 9) {
    variant += "E";
  }

  return variant;
};

export const getLegionImage = (
  ipfsPrefix: string,
  type: string,
  rarity: string,
  role: string,
  tokenId: BigInt,
  legacyTokenId: BigInt | null = null
): string => {
  let image = ipfsPrefix;
  if (type == "Recruit") {
    image += `/Recruit/${convertTokenIdToVariant(tokenId)}.jpg`;
  } else {
    let className = role;
    image += `/${type}/${rarity}`;
    if (type == "Genesis" && rarity != "Common" && legacyTokenId) {
      const tokenName = getName(legacyTokenId);
      if (rarity == "Legendary") {
        image += `/${tokenName}.jpg`;
      } else {
        const variantDigit1 = mapGenesisVariant(legacyTokenId);
        if (rarity == "Rare") {
          className = RARE_CLASS[mapGenesisRareClass(legacyTokenId)];
        }

        image += `/${className}/${convertTokenIdToVariant(
          tokenId,
          variantDigit1.toString()
        )}.jpg`;
      }
    } else {
      image += `/${className}/${convertTokenIdToVariant(tokenId)}.jpg`;
    }
  }

  return image;
};
