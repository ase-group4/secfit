import { fetchIngredients } from "./ingredient-utils.js";

// JSDoc type imports.
/** @typedef {import("./types.js").Ingredient} Ingredient */
/** @typedef {import("./types.js").IngredientInMeal} IngredientInMeal */

// When the DOM loads, populates the ingredient overview and listens for new ingredients.
window.addEventListener("DOMContentLoaded", async () => {
  /**
   * List of ingredients in the ingredients overview.
   * Updates on fetch from API and ingredient creation.
   *
   * @type {Ingredient[]}
   */
  let ingredients = [];

  ingredients = await fetchIngredients();

  let searchText = "";
  const ingredientSearch = document.querySelector("#ingredient-search-field");
  ingredientSearch.addEventListener("input", (event) => {
    searchText = event.target.value;
    filterSearchResults(event.target.value);
  });

  if (ingredients !== undefined) {
    updateIngredientList(ingredients);
  }

  const addIngredientModal = document.querySelector("create-ingredient-modal");
  addIngredientModal.addEventListener("ingredientCreated", (event) => {
    ingredients.push(event.detail);
    updateIngredientList(ingredients, searchText);
  });
});

/**
 * Takes a list of ingredients and populates the ingredient overview page with them.
 *
 * @param {Ingredient[]} ingredients
 */
function updateIngredientList(ingredients, searchText = "") {
  // Clears out any existing ingredient elements.
  const container = document.querySelector("#div-content");
  while (container.firstChild) {
    container.removeChild(container.lastChild);
  }

  const ingredientTemplate = document.querySelector("#template-ingredient");

  ingredients.sort(sortByName);

  for (const ingredient of ingredients) {
    const ingredientElement = ingredientTemplate.content.firstElementChild.cloneNode(true);

    const header = ingredientElement.querySelector(".ingredient-name");
    header.textContent = ingredient.name;

    const publisherField = ingredientElement.querySelector(".publisher-field");
    publisherField.textContent += ` ${ingredient.publisher_name}`;

    const tableRows = ingredientElement.querySelector("table").querySelectorAll("tr");
    tableRows[0].querySelectorAll("td")[1].textContent = `${ingredient.calories} kcal`;
    tableRows[1].querySelectorAll("td")[1].textContent = `${ingredient.protein} g`;
    tableRows[2].querySelectorAll("td")[1].textContent = `${ingredient.fat} g`;
    tableRows[3].querySelectorAll("td")[1].textContent = `${ingredient.carbohydrates} g`;

    container.appendChild(ingredientElement);

    if (!ingredient.name.toLowerCase().includes(searchText.toLowerCase())) {
      ingredientElement.classList.add("hide");
    }
  }
}

/**
 * Sorts the given ingredients by name.
 *
 * @param {Ingredient} ingredient1
 * @param {Ingredient} ingredient2
 * @returns {number}
 */
function sortByName(ingredient1, ingredient2) {
  if (ingredient1.name < ingredient2.name) {
    return -1;
  }
  if (ingredient1.name > ingredient2.name) {
    return 1;
  }
  return 0;
}

/**
 * Hides all ingredient elements without `searchText` in their name.
 *
 * @param {string} searchText
 */
function filterSearchResults(searchText) {
  const ingredientElements = document.querySelectorAll(".ingredient");

  for (const element of ingredientElements) {
    const name = element.querySelector(".ingredient-name").innerText;

    if (name.toLowerCase().includes(searchText.toLowerCase())) {
      element.classList.remove("hide");
    } else {
      element.classList.add("hide");
    }
  }
}
