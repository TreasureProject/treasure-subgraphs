import { Address, BigInt } from "@graphprotocol/graph-ts";

// Global
export const BURNER_ADDRESS = Address.fromString("{{ burner_address}}");
export const EXPLORER = "{{ explorer }}";
export const MAGIC_ADDRESS = Address.fromString(
  "{{magic_address}}{{^magic_address}}{{burner_address}}{{/magic_address}}"
);
export const HOURLY_STAT_INTERVAL_START_BLOCK = BigInt.fromString(
  "{{hourly_stat_interval_start_block}}{{^hourly_stat_interval_start_block}}0{{/hourly_stat_interval_start_block}}"
);

// Bridgeworld
export const ADVANCED_QUESTING_ADDRESS = Address.fromString(
  "{{advanced_questing_address}}{{^advanced_questing_address}}{{burner_address}}{{/advanced_questing_address}}"
);
export const BALANCER_CRYSTAL_ADDRESS = Address.fromString(
  "{{balancer_crystal_address}}{{^balancer_crystal_address}}{{burner_address}}{{/balancer_crystal_address}}"
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
export const EXTRA_LIFE_ADDRESS = Address.fromString(
  "{{extra_life_address}}{{^extra_life_address}}{{burner_address}}{{/extra_life_address}}"
);
export const KEYS_ADDRESS = Address.fromString(
  "{{keys_address}}{{^keys_address}}{{burner_address}}{{/keys_address}}"
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
export const LEGACY_LEGION_ADDRESS = Address.fromString(
  "{{legacy_legion_address}}{{^legacy_legion_address}}{{burner_address}}{{/legacy_legion_address}}"
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
export const TREASURE_TRIAD_ADDRESS = Address.fromString(
  "{{treasure_triad_address}}{{^treasure_triad_address}}{{burner_address}}{{/treasure_triad_address}}"
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

export const MAGICSWAP_V2_FACTORY_ADDRESS = Address.fromString(
  "{{magicswap_v2_factory_address}}{{^magicswap_v2_factory_address}}{{burner_address}}{{/magicswap_v2_factory_address}}"
);

// Smolverse
export const SMOL_BODIES_ADDRESS = Address.fromString(
  "{{smol_bodies_address}}{{^smol_bodies_address}}{{burner_address}}{{/smol_bodies_address}}"
);
export const SMOL_BODIES_GYM_ADDRESS = Address.fromString(
  "{{smol_bodies_gym_address}}{{^smol_bodies_gym_address}}{{burner_address}}{{/smol_bodies_gym_address}}"
);
export const SMOL_BODIES_PETS_ADDRESS = Address.fromString(
  "{{smol_bodies_pets_address}}{{^smol_bodies_pets_address}}{{burner_address}}{{/smol_bodies_pets_address}}"
);
export const SMOL_BRAINS_ADDRESS = Address.fromString(
  "{{smol_brains_address}}{{^smol_brains_address}}{{burner_address}}{{/smol_brains_address}}"
);
export const SMOL_BRAINS_LAND_ADDRESS = Address.fromString(
  "{{smol_brains_land_address}}{{^smol_brains_land_address}}{{burner_address}}{{/smol_brains_land_address}}"
);
export const SMOL_BRAINS_PETS_ADDRESS = Address.fromString(
  "{{smol_brains_pets_address}}{{^smol_brains_pets_address}}{{burner_address}}{{/smol_brains_pets_address}}"
);
export const SMOL_BRAINS_SCHOOL_ADDRESS = Address.fromString(
  "{{smol_brains_school_address}}{{^smol_brains_school_address}}{{burner_address}}{{/smol_brains_school_address}}"
);
export const SMOL_CARS_ADDRESS = Address.fromString(
  "{{smol_cars_address}}{{^smol_cars_address}}{{burner_address}}{{/smol_cars_address}}"
);
export const SMOL_FARM_ADDRESS = Address.fromString(
  "{{smol_farm_address}}{{^smol_farm_address}}{{burner_address}}{{/smol_farm_address}}"
);
export const SMOL_TREASURES_ADDRESS = Address.fromString(
  "{{smol_treasures_address}}{{^smol_treasures_address}}{{burner_address}}{{/smol_treasures_address}}"
);
export const SMOL_RACING_ADDRESS = Address.fromString(
  "{{smol_racing_address}}{{^smol_racing_address}}{{burner_address}}{{/smol_racing_address}}"
);
export const SMOL_RACING_TROPHIES_ADDRESS = Address.fromString(
  "{{smol_racing_trophies_address}}{{^smol_racing_trophies_address}}{{burner_address}}{{/smol_racing_trophies_address}}"
);
export const SMOL_ROCKET_ADDRESS = Address.fromString(
  "{{smol_rocket_address}}{{^smol_rocket_address}}{{burner_address}}{{/smol_rocket_address}}"
);
export const SMOLOWEEN_ADDRESS = Address.fromString(
  "{{smoloween_address}}{{^smoloween_address}}{{burner_address}}{{/smoloween_address}}"
);
export const SMOLIDAYS_ADDRESS = Address.fromString(
  "{{smolidays_address}}{{^smolidays_address}}{{burner_address}}{{/smolidays_address}}"
);
export const SWOLERCYCLES_ADDRESS = Address.fromString(
  "{{swolercycles_address}}{{^swolercycles_address}}{{burner_address}}{{/swolercycles_address}}"
);
export const WRAPPED_SMOLS_ADDRESS = Address.fromString(
  "{{wrapped_smols_address}}{{^wrapped_smols_address}}{{burner_address}}{{/wrapped_smols_address}}"
);
export const BATTLEFLY_SMOLVERSE_FLYWHEEL_VAULT_ADDRESS = Address.fromString(
  "{{battlefly_smolverse_flywheel_vault_address}}{{^battlefly_smolverse_flywheel_vault_address}}{{burner_address}}{{/battlefly_smolverse_flywheel_vault_address}}"
);
