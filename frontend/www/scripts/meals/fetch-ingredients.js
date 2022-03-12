/**
 * Sends an API request to get all ingredients, and returns them.
 * If backend returns an error, shows it at the top of the page and returns nothing.
 *
 * @return {Promise<{
 *  id: number,
 *  name: string,
 *  publisher_name: string,
 *  calories: number,
 *  protein: number,
 *  fat: number,
 *  carbohydrates: number,
 * }[] | undefined>} The API response, or `undefined` in case of error.
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
