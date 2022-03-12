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
 * Sends an API request to get all ingredients, and returns them.
 * If backend returns an error, shows it at the top of the page and returns nothing.
 *
 * @return {Promise<Ingredient[] | undefined>} The API response, or `undefined` in case of error.
 */
export async function fetchIngredients() {
  const response = await sendRequest("GET", `${HOST}/api/ingredients`);
  const data = await response.json();

  if (!response.ok) {
    const alert = createAlert("Could not fetch ingredients!", data);
    document.body.prepend(alert);
    return;
  }

  return data.results;
}

/**
 * Calculates the total nutritional value of the given list of ingredients in a meal.
 *
 * @param {IngredientInMeal[]} ingredientsInMeal List of ingredients, with corresponding weights.
 *
 * @returns {{
 *  calories: number,
 *  protein: number,
 *  fat: number,
 *  carbohydrates: number
 * }} Object with nutritional value totals.
 */
export function calculateNutritionTotals(ingredientsInMeal) {
  const nutritionalValues = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbohydrates: 0,
  };

  for (const ingredientInMeal of ingredientsInMeal) {
    const { ingredient, weight } = ingredientInMeal;

    for (const nutritionalValue of Object.keys(nutritionalValues)) {
      const grams = (ingredient[nutritionalValue] * weight) / 100;
      nutritionalValues[nutritionalValue] += Math.round(grams * 10) / 10;
    }
  }

  return nutritionalValues;
}

/**
 * Takes a list of ingredients in a meal, and calculates the nutrition value totals for it.
 * Then searches for elements with class `meal-ingredient-{nutritionalValue}-total` in the given parent,
 * where `nutritionalValue` is a key from the return of `calculateNutritionTotals`.
 * If found, sets the text of the appropriate element to the calculated nutrition total.
 *
 * @param {IngredientInMeal[]} ingredientsInMeal
 * @param {HTMLElement} [parent]
 * The parent element on which to search for nutritional value fields, or `document` if left out.
 */
export function updateNutritionTotals(ingredientsInMeal, parent = document) {
  const nutritionalValues = calculateNutritionTotals(ingredientsInMeal);

  for (const [key, value] of Object.entries(nutritionalValues)) {
    const nutritionElement = parent.querySelector(`.meal-ingredient-${key}-total`);

    if (!nutritionElement) {
      continue;
    }

    nutritionElement.textContent = getNutritionalValueText(key, value);
  }
}

/**
 * Formats the given nutrition key and value as text to display.
 *
 * @param {string} key
 * @param {number} value
 * @return {string}
 */
export function getNutritionalValueText(key, value) {
  // Capitalizes the first letter of the key.
  let text = `${key.charAt(0).toUpperCase()}${key.slice(1)}: `;

  if (value === 0) {
    text += "—";
    return text;
  }

  text += `${value} ${key === "calories" ? "kcal" : "g"}`;
  return text;
}

/**
 * Reads the form data from the given form, and returns it as numbers in an object.
 *
 * @param {HTMLFormElement} ingredientForm
 * @param {Object.<number, Ingredient>} allIngredients Map of all ingredients on the site.
 * @returns {IngredientInMeal} The ingredient from the form's inputs.
 */
export function getIngredientFormData(ingredientForm, allIngredients) {
  const formData = new FormData(ingredientForm);
  const data = {
    ingredient: undefined,
    weight: 0,
  };

  const ingredientId = parseInt(formData.get("ingredient"));
  if (!Number.isNaN(ingredientId)) {
    data.ingredient = allIngredients[ingredientId];
  }

  const weight = parseInt(formData.get("weight"));
  if (!Number.isNaN(weight)) {
    data.weight = weight;
  }

  return data;
}

/**
 * Returns an option element for the given ingredient.
 * Sets `data-value` field rather than `value`,
 * to enable using datalists with different display text from values.
 *
 * @param {Ingredient} ingredient
 *
 * @returns {HTMLOptionElement}
 */
export function createIngredientOption(ingredient) {
  const option = document.createElement("option");
  option.setAttribute("data-value", ingredient.id);
  option.textContent = ingredient.name;
  return option;
}
