/**
 * Calculates the total nutritional value of the given list of ingredients.
 *
 * @param {{
 *  ingredient: {
 *    calories: number,
 *    protein: number,
 *    fat: number,
 *    carbohydrates: number,
 *  },
 *  weight: number,
 * }[]} ingredientWeights List of ingredients, with corresponding weights.
 *
 * @returns {{
 *  calories: number,
 *  protein: number,
 *  fat: number,
 *  carbohydrates: number
 * }} Object with nutritional value totals.
 */
export function calculateNutritionTotals(ingredientWeights) {
  const nutritionalValues = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbohydrates: 0,
  };

  for (const ingredientWeight of ingredientWeights) {
    const { ingredient, weight } = ingredientWeight;

    for (const nutritionalValue of Object.keys(nutritionalValues)) {
      const grams = (ingredient[nutritionalValue] * weight) / 100;
      nutritionalValues[nutritionalValue] += Math.round(grams * 10) / 10;
    }
  }

  return nutritionalValues;
}
