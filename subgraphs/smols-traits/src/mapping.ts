import { BigInt, Bytes, ethereum, log, store } from "@graphprotocol/graph-ts";

import { SMOL_RENDERER_ADDRESS } from "@treasure/constants";

import { TraitAdded } from "../generated/Smols Trait Storage/SmolsTraitStorage";
import {
  SmolRenderer,
  SmolRenderer__generateSVGInput_smolStruct,
} from "../generated/Transmolgrifier/SmolRenderer";
import {
  SeasonStateUpdated,
  SeasonTextUpdated,
  SmolRecipeAdded,
  SmolRecipeAdjusted,
  SmolRecipeDeleted,
} from "../generated/Transmolgrifier/Transmolgrifier";
import { Recipe, Season, Trait, TraitDependency } from "../generated/schema";

const GENDERS = ["Unset", "Male", "Female"];

const getOrCreateSeason = (seasonId: BigInt): Season => {
  const id = Bytes.fromI32(seasonId.toI32());
  let season = Season.load(id);
  if (!season) {
    season = new Season(id);
    season.seasonId = seasonId;
    season.name = `Season ${seasonId.toString()}`;
    season.isActive = false;
    season.save();
  }

  return season;
};

const getOrCreateRecipe = (seasonId: BigInt, recipeId: BigInt): Recipe => {
  const season = getOrCreateSeason(seasonId);
  const id = Bytes.fromI32(seasonId.toI32()).concatI32(recipeId.toI32());
  let recipe = Recipe.load(id);
  if (!recipe) {
    recipe = new Recipe(id);
    recipe.recipeId = recipeId;
    recipe.season = season.id;
    recipe.image = "";
  }

  return recipe;
};

export function handleTraitAdded(event: TraitAdded): void {
  const params = event.params;

  const id = Bytes.fromI32(params._traitId.toI32());
  let trait = Trait.load(id);
  if (!trait) {
    trait = new Trait(id);
  }

  trait.traitId = params._traitId.toI32();
  trait.gender = GENDERS[params._trait.gender];
  trait.traitName = params._trait.traitName.toString();
  trait.traitType = params._trait.traitType.toString();
  trait.isDetachable = params._trait.isDetachable;
  trait.save();

  const dependencyId = Bytes.fromI32(params._traitId.toI32()).concatI32(
    params._dependencyLevel.toI32()
  );
  let traitDependency = TraitDependency.load(dependencyId);
  if (!traitDependency) {
    traitDependency = new TraitDependency(dependencyId);
  }

  traitDependency.trait = id;
  traitDependency.dependencyLevel = params._dependencyLevel.toI32();
  traitDependency.maleImage = params._trait.pngImage.male.toString();
  traitDependency.femaleImage = params._trait.pngImage.female.toString();
  traitDependency.save();
}

const updateRecipe = (
  seasonId: BigInt,
  recipeId: BigInt,
  background: i32,
  body: i32,
  clothes: i32,
  mouth: i32,
  glasses: i32,
  hat: i32,
  hair: i32,
  skin: i32,
  smolCost: i32,
  treasureCost: i32,
  treasureTokenId: i32
): void => {
  const recipe = getOrCreateRecipe(seasonId, recipeId);
  recipe.background = background > 0 ? Bytes.fromI32(background) : null;
  recipe.body = body > 0 ? Bytes.fromI32(body) : null;
  recipe.clothes = clothes > 0 ? Bytes.fromI32(clothes) : null;
  recipe.mouth = mouth > 0 ? Bytes.fromI32(mouth) : null;
  recipe.glasses = glasses > 0 ? Bytes.fromI32(glasses) : null;
  recipe.hat = hat > 0 ? Bytes.fromI32(hat) : null;
  recipe.hair = hair > 0 ? Bytes.fromI32(hair) : null;
  recipe.skin = skin > 0 ? Bytes.fromI32(skin) : null;
  recipe.smolCost = smolCost;
  recipe.treasureCost = treasureCost;
  recipe.treasureTokenId = treasureTokenId;

  const contract = SmolRenderer.bind(SMOL_RENDERER_ADDRESS);
  const tuple = new SmolRenderer__generateSVGInput_smolStruct(10);
  tuple[0] = ethereum.Value.fromI32(background);
  tuple[1] = ethereum.Value.fromI32(body);
  tuple[2] = ethereum.Value.fromI32(clothes);
  tuple[3] = ethereum.Value.fromI32(mouth);
  tuple[4] = ethereum.Value.fromI32(glasses);
  tuple[5] = ethereum.Value.fromI32(hat);
  tuple[6] = ethereum.Value.fromI32(hair);
  tuple[7] = ethereum.Value.fromI32(skin);
  tuple[8] = ethereum.Value.fromI32(1); // gender
  tuple[9] = ethereum.Value.fromI32(0); // headSize
  const result = contract.try_generateSVG(tuple);
  if (!result.reverted) {
    recipe.image = result.value.toString();
  } else {
    log.warning("Error rendering recipe: {}", [recipeId.toString()]);
    recipe.image = "";
  }

  recipe.save();
};

export function handleRecipeAdded(event: SmolRecipeAdded): void {
  const params = event.params;
  const data = params.smolData;
  const smol = data.smol;
  updateRecipe(
    params.seasonId,
    params.smolRecipeId,
    smol.background,
    smol.body,
    smol.clothes,
    smol.mouth,
    smol.glasses,
    smol.hat,
    smol.hair,
    smol.skin,
    data.smolInputAmount,
    data.treasureAmount,
    data.treasureId
  );
}

export function handleRecipeAdjusted(event: SmolRecipeAdjusted): void {
  const params = event.params;
  const data = params.smolData;
  const smol = data.smol;
  updateRecipe(
    params.seasonId,
    params.smolRecipeId,
    smol.background,
    smol.body,
    smol.clothes,
    smol.mouth,
    smol.glasses,
    smol.hat,
    smol.hair,
    smol.skin,
    data.smolInputAmount,
    data.treasureAmount,
    data.treasureId
  );
}

export function handleRecipeDeleted(event: SmolRecipeDeleted): void {
  const params = event.params;
  store.remove(
    "Recipe",
    Bytes.fromI32(params.seasonId.toI32())
      .concatI32(params.smolRecipeId.toI32())
      .toHexString()
  );
}

export function handleSeasonStateUpdated(event: SeasonStateUpdated): void {
  const params = event.params;
  const season = getOrCreateSeason(params.seasonId);
  season.isActive = params.isActive;
  season.save();
}

export function handleSeasonTextUpdated(event: SeasonTextUpdated): void {
  const params = event.params;
  const season = getOrCreateSeason(params.seasonId);
  season.name = params.seasonText;
  season.save();
}
