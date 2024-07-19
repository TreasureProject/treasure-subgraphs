import { Address } from "@graphprotocol/graph-ts";

// Global
export const BURNER_ADDRESS = Address.fromString("{{ burner_address}}");
export const MAGIC_ADDRESS = Address.fromString(
  "{{magic_address}}{{^magic_address}}{{burner_address}}{{/magic_address}}"
);

// Bridgeworld
export const ADVANCED_QUESTING_ADDRESS = Address.fromString(
  "{{advanced_questing_address}}{{^advanced_questing_address}}{{burner_address}}{{/advanced_questing_address}}"
);
export const BEACON_ADDRESS = Address.fromString(
  "{{beacon_address}}{{^beacon_address}}{{burner_address}}{{/beacon_address}}"
);
export const CONSUMABLE_ADDRESS = Address.fromString(
  "{{consumable_address}}{{^consumable_address}}{{burner_address}}{{/consumable_address}}"
);
export const CORRUPTION_CRYPTS_ADDRESS = Address.fromString(
  "{{corruption_crypts_address}}{{^corruption_crypts_address}}{{burner_address}}{{/corruption_crypts_address}}"
);
export const CORRUPTION_REMOVAL_ADDRESS = Address.fromString(
  "{{corruption_removal_address}}{{^corruption_removal_address}}{{burner_address}}{{/corruption_removal_address}}"
);
export const CRAFTING_ADDRESS = Address.fromString(
  "{{crafting_address}}{{^crafting_address}}{{burner_address}}{{/crafting_address}}"
);
export const ERC1155_TOKEN_SET_CORRUPTION_HANDLER_ADDRESS = Address.fromString(
  "{{erc1155_token_set_corruption_handler_address}}{{^erc1155_token_set_corruption_handler_address}}{{burner_address}}{{/erc1155_token_set_corruption_handler_address}}"
);
export const KOTE_POTIONS_ADDRESS = Address.fromString(
  "{{kote_potions_address}}{{^kote_potions_address}}{{burner_address}}{{/kote_potions_address}}"
);
export const KOTE_SQUIRES_ADDRESS = Address.fromString(
  "{{kote_squires_address}}{{^kote_squires_address}}{{burner_address}}{{/kote_squires_address}}"
);
export const KOTE_TRINKETS_ADDRESS = Address.fromString(
  "{{kote_trinkets_address}}{{^kote_trinkets_address}}{{burner_address}}{{/kote_trinkets_address}}"
);
export const LEGACY_LEGION_GENESIS_ADDRESS = Address.fromString(
  "{{legacy_legion_genesis_address}}{{^legacy_legion_genesis_address}}{{burner_address}}{{/legacy_legion_genesis_address}}"
);
export const LEGION_ADDRESS = Address.fromString(
  "{{legion_address}}{{^legion_address}}{{burner_address}}{{/legion_address}}"
);
export const QUESTING_ADDRESS = Address.fromString(
  "{{questing_address}}{{^questing_address}}{{burner_address}}{{/questing_address}}"
);
export const RECRUIT_LEVEL_ADDRESS = Address.fromString(
  "{{recruit_level_address}}{{^recruit_level_address}}{{burner_address}}{{/recruit_level_address}}"
);
export const SUMMONING_ADDRESS = Address.fromString(
  "{{summoning_address}}{{^summoning_address}}{{burner_address}}{{/summoning_address}}"
);
export const TREASURE_ADDRESS = Address.fromString(
  "{{treasure_address}}{{^treasure_address}}{{burner_address}}{{/treasure_address}}"
);
export const TREASURE_CORRUPTION_HANDLER_ADDRESS = Address.fromString(
  "{{treasure_corruption_handler_address}}{{^treasure_corruption_handler_address}}{{burner_address}}{{/treasure_corruption_handler_address}}"
);
export const TREASURE_FRAGMENT_ADDRESS = Address.fromString(
  "{{treasure_fragment_address}}{{^treasure_fragment_address}}{{burner_address}}{{/treasure_fragment_address}}"
);

// MagicSwap
export const MAGICSWAP_FACTORY_ADDRESS = Address.fromString(
  "{{magicswap_factory_address}}{{^magicswap_factory_address}}{{burner_address}}{{/magicswap_factory_address}}"
);
export const USDC =
  "{{usdc_address}}{{^usdc_address}}{{burner_address}}{{/usdc_address}}";
export const USDT =
  "{{usdt_address}}{{^usdt_address}}{{burner_address}}{{/usdt_address}}";
export const DAI =
  "{{dai_address}}{{^dai_address}}{{burner_address}}{{/dai_address}}";
export const NATIVE = MAGIC_ADDRESS;
export const USDC_WETH_PAIR =
  "{{usdc_weth_pair_address}}{{^usdc_weth_pair_address}}{{burner_address}}{{/usdc_weth_pair_address}}";
export const DAI_WETH_PAIR =
  "{{dai_weth_pair}}{{^dai_weth_pair}}{{burner_address}}{{/dai_weth_pair}}";
export const USDT_WETH_PAIR =
  "{{usdt_weth_pair}}{{^usdt_weth_pair}}{{burner_address}}{{/usdt_weth_pair}}";
export const MAGICSWAP_TOKEN_WHITELIST = [NATIVE.toHexString()];

// Magicswap v2
export const MAGICSWAP_V2_FACTORY_ADDRESS = Address.fromString(
  "{{magicswapv2_uniswapv2_factory_address}}{{^magicswapv2_uniswapv2_factory_address}}{{burner_address}}{{/magicswapv2_uniswapv2_factory_address}}"
);
export const MAGICSWAP_V2_ROUTER_ADDRESS = Address.fromString(
  "{{magicswapv2_router_address}}{{^magicswapv2_router_address}}{{burner_address}}{{/magicswapv2_router_address}}"
);
export const WETH_ADDRESS = Address.fromString(
  "{{weth_address}}{{^weth_address}}{{burner_address}}{{/weth_address}}"
);

// SMOL
export const SMOL_RENDERER_ADDRESS = Address.fromString(
  "{{smol_renderer_address}}{{^smol_renderer_address}}{{burner_address}}{{/smol_renderer_address}}"
);
