import { BigInt, Bytes, store } from "@graphprotocol/graph-ts";

import { TraitAdded } from "../generated/Smols Trait Storage/SmolsTraitStorage";
import {
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

export function handleRecipeAdded(event: SmolRecipeAdded): void {
  const params = event.params;
  const data = params.smolData;
  const smol = data.smol;

  const recipe = getOrCreateRecipe(params.seasonId, params.smolRecipeId);
  recipe.background =
    smol.background > 0 ? Bytes.fromI32(smol.background) : null;
  recipe.body = smol.body > 0 ? Bytes.fromI32(smol.body) : null;
  recipe.clothes = smol.clothes > 0 ? Bytes.fromI32(smol.clothes) : null;
  recipe.mouth = smol.mouth > 0 ? Bytes.fromI32(smol.mouth) : null;
  recipe.glasses = smol.glasses > 0 ? Bytes.fromI32(smol.glasses) : null;
  recipe.hat = smol.hat > 0 ? Bytes.fromI32(smol.hat) : null;
  recipe.hair = smol.hair > 0 ? Bytes.fromI32(smol.hair) : null;
  recipe.skin = smol.skin > 0 ? Bytes.fromI32(smol.skin) : null;
  recipe.smolCost = data.smolInputAmount;
  recipe.treasureCost = data.treasureAmount;
  recipe.treasureTokenId = data.treasureId;
  recipe.save();
}

export function handleRecipeAdjusted(event: SmolRecipeAdjusted): void {
  const params = event.params;
  const data = params.smolData;
  const smol = data.smol;

  const recipe = getOrCreateRecipe(params.seasonId, params.smolRecipeId);
  recipe.background =
    smol.background > 0 ? Bytes.fromI32(smol.background) : null;
  recipe.body = smol.body > 0 ? Bytes.fromI32(smol.body) : null;
  recipe.clothes = smol.clothes > 0 ? Bytes.fromI32(smol.clothes) : null;
  recipe.mouth = smol.mouth > 0 ? Bytes.fromI32(smol.mouth) : null;
  recipe.glasses = smol.glasses > 0 ? Bytes.fromI32(smol.glasses) : null;
  recipe.hat = smol.hat > 0 ? Bytes.fromI32(smol.hat) : null;
  recipe.hair = smol.hair > 0 ? Bytes.fromI32(smol.hair) : null;
  recipe.skin = smol.skin > 0 ? Bytes.fromI32(smol.skin) : null;
  recipe.smolCost = data.smolInputAmount;
  recipe.treasureCost = data.treasureAmount;
  recipe.treasureTokenId = data.treasureId;
  recipe.save();
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
