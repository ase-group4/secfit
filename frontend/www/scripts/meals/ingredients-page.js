import { fetchIngredients } from "./fetch-ingredients.js";

// When the DOM loads, populates the ingredient overview and listens for new ingredients.
window.addEventListener("DOMContentLoaded", async () => {
  const ingredients = await fetchIngredients();

  if (ingredients !== undefined) {
    updateIngredientList(ingredients);
  }

  const addIngredientModal = document.querySelector("create-ingredient-modal");
  addIngredientModal.addEventListener("ingredientCreated", (event) => {
    updateIngredientList([...(ingredients ?? []), event.detail]);
  });
});

/** Takes a list of ingredients and populates the ingredient overview page with them. */
function updateIngredientList(ingredients) {
  const container = document.querySelector("#div-content");
  while (container.firstChild) {
    container.removeChild(container.lastChild);
  }

  const ingredientTemplate = document.querySelector("#template-ingredient");

  for (const ingredient of ingredients) {
    const ingredientElement = ingredientTemplate.content.firstElementChild.cloneNode(true);

    const header = ingredientElement.querySelector("h5");
    header.textContent = ingredient.name;

    const publisherField = ingredientElement.querySelector("#publisher-field");
    publisherField.textContent += ingredient.publisher_name;

    const tableRows = ingredientElement.querySelector("table").querySelectorAll("tr");
    tableRows[0].querySelectorAll("td")[1].textContent = `${ingredient.protein} g`;
    tableRows[1].querySelectorAll("td")[1].textContent = `${ingredient.fat} g`;
    tableRows[2].querySelectorAll("td")[1].textContent = `${ingredient.carbohydrates} g`;
    tableRows[3].querySelectorAll("td")[1].textContent = `${ingredient.calories} kcal`;

    container.appendChild(ingredientElement);
  }
}
