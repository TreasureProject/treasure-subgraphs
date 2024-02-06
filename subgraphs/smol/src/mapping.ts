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
  SmolTransmolgrified,
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
    recipe.minted = false;
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

  if (trait.traitType == "Background") {
    renderRecipes(trait.backgroundRecipes.load());
  } else if (trait.traitType == "Body") {
    renderRecipes(trait.bodyRecipes.load());
  } else if (trait.traitType == "Clothes") {
    renderRecipes(trait.clothesRecipes.load());
  } else if (trait.traitType == "Mouth") {
    renderRecipes(trait.mouthRecipes.load());
  } else if (trait.traitType == "Glasses") {
    renderRecipes(trait.glassesRecipes.load());
  } else if (trait.traitType == "Hat") {
    renderRecipes(trait.hatRecipes.load());
  } else if (trait.traitType == "Hair") {
    renderRecipes(trait.hairRecipes.load());
  } else if (trait.traitType == "Skin") {
    renderRecipes(trait.skinRecipes.load());
  }

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

const renderRecipe = (recipe: Recipe): void => {
  const contract = SmolRenderer.bind(SMOL_RENDERER_ADDRESS);
  const tuple = new SmolRenderer__generateSVGInput_smolStruct(10);
  tuple[0] = ethereum.Value.fromUnsignedBigInt(
    BigInt.fromI32(recipe.background ? (recipe.background as Bytes).toI32() : 0)
  );
  tuple[1] = ethereum.Value.fromUnsignedBigInt(
    BigInt.fromI32(recipe.body ? (recipe.body as Bytes).toI32() : 0)
  );
  tuple[2] = ethereum.Value.fromUnsignedBigInt(
    BigInt.fromI32(recipe.clothes ? (recipe.clothes as Bytes).toI32() : 0)
  );
  tuple[3] = ethereum.Value.fromUnsignedBigInt(
    BigInt.fromI32(recipe.mouth ? (recipe.mouth as Bytes).toI32() : 0)
  );
  tuple[4] = ethereum.Value.fromUnsignedBigInt(
    BigInt.fromI32(recipe.glasses ? (recipe.glasses as Bytes).toI32() : 0)
  );
  tuple[5] = ethereum.Value.fromUnsignedBigInt(
    BigInt.fromI32(recipe.hat ? (recipe.hat as Bytes).toI32() : 0)
  );
  tuple[6] = ethereum.Value.fromUnsignedBigInt(
    BigInt.fromI32(recipe.hair ? (recipe.hair as Bytes).toI32() : 0)
  );
  tuple[7] = ethereum.Value.fromUnsignedBigInt(
    BigInt.fromI32(recipe.skin ? (recipe.skin as Bytes).toI32() : 0)
  );
  tuple[8] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(recipe.gender));
  tuple[9] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(recipe.headSize));
  const result = contract.try_generateSVG(tuple);
  if (!result.reverted) {
    recipe.image = result.value.toString();
  } else {
    log.warning("Error rendering recipe: {}", [recipe.recipeId.toString()]);
    recipe.image = "";
  }
};

const renderRecipes = (recipes: Recipe[]): void => {
  for (let i = 0; i < recipes.length; i += 1) {
    renderRecipe(recipes[i]);
    recipes[i].save();
  }
};

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
  gender: i32,
  headSize: i32,
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
  recipe.gender = gender;
  recipe.headSize = headSize;
  recipe.smolCost = smolCost;
  recipe.treasureCost = treasureCost;
  recipe.treasureTokenId = treasureTokenId;
  renderRecipe(recipe);
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
    smol.gender,
    smol.headSize,
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
    smol.gender,
    smol.headSize,
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

export function handleTransmolgrified(event: SmolTransmolgrified): void {
  const params = event.params;
  const recipe = getOrCreateRecipe(params.seasonId, params.smolRecipeId);
  recipe.minted = true;
  recipe.save();
}
