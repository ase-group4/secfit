import {
  getNutritionalValueText,
  getIngredientFormData,
  createIngredientOption,
  updateNutritionTotals,
} from "./ingredient-utils.js";

// Type definitions for JSDoc documentation.
/**
 * @typedef {{
 *  id: number,
 *  name: string,
 *  publisher_name: string,
 *  calories: number,
 *  protein: number,
 *  fat: number,
 *  carbohydrates: number,
 * }} Ingredient An entry from SecFit's ingredient database.
 *
 * @typedef {{
 *  ingredient: Ingredient,
 *  weight: number,
 * }} IngredientInMeal An ingredient in a meal, with weight.
 */

/**
 * Global map of all ingredients fetched from the API.
 * Maps ingredient IDs to ingredients for quick access.
 *
 * @type {Object.<number, Ingredient>}
 */
let allIngredients = {};

/**
 * Takes a list of ingredients, turns them into a map,
 * and updates the global `allIngredients`.
 *
 * @param {Ingredient[]} ingredientList
 */
export function updateIngredients(ingredientList) {
  const newIngredients = {};

  for (const ingredient of ingredientList) {
    newIngredients[ingredient.id] = ingredient;
  }

  allIngredients = newIngredients;
}

/**
 * Adds the new ingredient to the global `allIngredients`,
 * and adds it as an option on all ingredient forms.
 *
 * @param {Ingredient} ingredient
 */
export function handleCreatedIngredient(ingredient) {
  allIngredients[ingredient.id] = ingredient;

  const ingredientSelects = document.querySelectorAll(".meal-ingredient-select");
  for (const select of ingredientSelects) {
    select.appendChild(createIngredientOption(ingredient));
  }
}

/**
 * Searches the page for all ingredient input forms, and returns a list of objects with the parsed input.
 *
 * @return {IngredientInMeal[]}
 */
export function getIngredientsInMeal() {
  const ingredientsInMeal = [];

  for (const ingredientForm of document.querySelectorAll(".meal-ingredient-input-form")) {
    const ingredientFormData = getIngredientFormData(ingredientForm, allIngredients);
    if (ingredientFormData.ingredient === undefined || ingredientFormData.weight === 0) {
      continue;
    }

    ingredientsInMeal.push({
      ingredient: ingredientFormData.ingredient,
      weight: ingredientFormData.weight,
    });
  }

  return ingredientsInMeal;
}

/**
 * Adds an element for adding an ingredient to a meal.
 * If `ingredientInMeal` is provided, assumes that the input is for viewing only,
 * sets the input's values to the given ingredient, and returns inputs to disable.
 *
 * @param {IngredientInMeal} [ingredientInMeal]
 *
 * @returns {HTMLInputElement[] | undefined} Buttons to disable, if `ingredientInMeal` was provided.
 */
export function addIngredientInput(ingredientInMeal) {
  const ingredientTemplate = document.querySelector("#meal-ingredient-input-template");
  const ingredientElement = ingredientTemplate.content.firstElementChild.cloneNode(true);
  const ingredientContainer = document.querySelector("#meal-ingredient-input-container");
  ingredientContainer.appendChild(ingredientElement);

  const ingredientSelect = ingredientElement.querySelector(".meal-ingredient-select");
  const weightInput = ingredientElement.querySelector(".meal-ingredient-weight-input");
  const removeButton = ingredientElement.querySelector(".meal-ingredient-remove-button");

  for (const ingredient of Object.values(allIngredients)) {
    ingredientSelect.appendChild(createIngredientOption(ingredient));
  }

  if (ingredientInMeal) {
    ingredientSelect.value = ingredientInMeal.ingredient.id;
    weightInput.value = ingredientInMeal.weight;
    removeButton.classList.add("hide");

    updateNutritionFields(ingredientElement);

    const buttonsToDisable = [ingredientSelect, weightInput];
    return buttonsToDisable;
  }

  updateNutritionFields(ingredientElement);

  const updateAllNutritionalValues = () => {
    updateNutritionFields(ingredientElement);
    updateNutritionTotals(getIngredientsInMeal());
  };
  ingredientSelect.addEventListener("change", updateAllNutritionalValues);
  weightInput.addEventListener("change", updateAllNutritionalValues);

  removeButton.addEventListener("click", () => {
    ingredientContainer.removeChild(ingredientElement);
    updateNutritionTotals(getIngredientsInMeal());
  });
}

/**
 * Reads the form on the given ingredient element, and updates nutrition fields to match input.
 *
 * @param {HTMLElement} ingredientElement
 */
function updateNutritionFields(ingredientElement) {
  const ingredientForm = ingredientElement.querySelector(".meal-ingredient-input-form");
  const formData = getIngredientFormData(ingredientForm, allIngredients);

  for (const nutritionalValue of ["protein", "fat", "carbohydrates", "calories"]) {
    const nutritionalValueField = ingredientElement.querySelector(
      `.meal-ingredient-${nutritionalValue}-field`
    );

    let value = 0;
    if (formData.ingredient !== undefined && formData.weight !== 0) {
      const grams = (formData.ingredient[nutritionalValue] * formData.weight) / 100;
      value = Math.round(grams * 10) / 10;
    }
    nutritionalValueField.textContent = getNutritionalValueText(nutritionalValue, value);
  }
}
