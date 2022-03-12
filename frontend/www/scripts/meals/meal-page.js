import { fetchIngredients, updateNutritionTotals } from "./ingredient-utils.js";
import {
  updateIngredients,
  getIngredientsInMeal,
  addIngredientInput,
  handleCreatedIngredient,
} from "./meal-page-ingredients.js";

// Global references to form buttons.
let cancelMealButton;
let okMealButton;
let deleteMealButton;
let editMealButton;

window.addEventListener("DOMContentLoaded", async () => {
  cancelMealButton = document.querySelector("#btn-cancel-meal");
  okMealButton = document.querySelector("#btn-ok-meal");
  deleteMealButton = document.querySelector("#btn-delete-meal");
  editMealButton = document.querySelector("#btn-edit-meal");

  updateIngredients(await fetchIngredients());
  updateNutritionTotals(getIngredientsInMeal());

  const createIngredientButton = document.querySelector("#meal-create-new-ingredient");
  const addIngredientButton = document.querySelector("#meal-ingredient-add-button");
  const addIngredientModal = document.querySelector("create-ingredient-modal");

  const urlParams = new URLSearchParams(window.location.search);
  let currentUser = await getCurrentUser();

  if (urlParams.has("id")) {
    const id = urlParams.get("id");
    let mealData = await retrieveMeal(id);

    for (const hiddenButton of [createIngredientButton, addIngredientButton]) {
      hiddenButton.classList.add("hide");
    }

    const buttonsToDisable = [];
    for (const existingIngredient of mealData.ingredient_weights) {
      buttonsToDisable.push(...addIngredientInput(existingIngredient));
    }
    updateNutritionTotals(getIngredientsInMeal());
    for (const disabledButton of buttonsToDisable) {
      disabledButton.disabled = true;
    }

    if (mealData["owner"] == currentUser.url) {
      editMealButton.classList.remove("hide");
      editMealButton.addEventListener("click", handleEditMealButtonClick);
      deleteMealButton.addEventListener(
        "click",
        (async (id) => await deleteMeal(id)).bind(undefined, id)
      );
      okMealButton.addEventListener(
        "click",
        (async (id) => await updateMeal(id)).bind(undefined, id)
      );
    }
  } else {
    let ownerInput = document.querySelector("#inputOwner");
    ownerInput.value = currentUser.username;
    setReadOnly(false, "#form-meal");
    ownerInput.readOnly = !ownerInput.readOnly;

    okMealButton.className = okMealButton.className.replace(" hide", "");
    cancelMealButton.className = cancelMealButton.className.replace(" hide", "");

    okMealButton.addEventListener("click", async () => await createMeal());
    cancelMealButton.addEventListener("click", handleCancelDuringMealCreate);

    addIngredientButton.addEventListener("click", () => addIngredientInput());
    addIngredientModal.addEventListener("ingredientCreated", (event) => {
      handleCreatedIngredient(event.detail);
    });
  }
});

async function retrieveMeal(id) {
  let mealData = null;
  let response = await sendRequest("GET", `${HOST}/api/meals/${id}/`);
  if (!response.ok) {
    let data = await response.json();
    let alert = createAlert("Could not retrieve your meal data!", data);
    document.body.prepend(alert);
  } else {
    mealData = await response.json();
    let form = document.querySelector("#form-meal");
    let formData = new FormData(form);

    for (let key of formData.keys()) {
      let selector = `input[name="${key}"], textarea[name="${key}"]`;
      let input = form.querySelector(selector);
      let newVal = mealData[key];
      if (key == "date") {
        // Creating a valid datetime-local string with the correct local time
        let date = new Date(newVal);
        date = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString(); // get ISO format for local time
        newVal = date.substring(0, newVal.length - 1); // remove Z (since this is a local time, not UTC)
      }
      if (key != "files") {
        input.value = newVal;
      }
    }

    let input = form.querySelector("select:disabled");
    // files
    let filesDiv = document.querySelector("#uploaded-files");
    for (let file of mealData.files) {
      let a = document.createElement("a");
      a.href = file.file;
      let pathArray = file.file.split("/");
      a.text = pathArray[pathArray.length - 1];
      a.className = "me-2";
      filesDiv.appendChild(a);
    }
  }
  return mealData;
}

function handleCancelDuringMealEdit() {
  location.reload();
}

function handleEditMealButtonClick() {
  setReadOnly(false, "#form-meal");
  document.querySelector("#inputOwner").readOnly = true; // owner field should still be readonly

  editMealButton.className += " hide"; // The edit button should be hidden when in edit mode
  okMealButton.className = okMealButton.className.replace(" hide", ""); // The ok button should not be hidden when in edit mode
  cancelMealButton.className = cancelMealButton.className.replace(" hide", ""); // See above
  deleteMealButton.className = deleteMealButton.className.replace(" hide", ""); // See above
  cancelMealButton.addEventListener("click", handleCancelDuringMealEdit);
}

async function deleteMeal(id) {
  let response = await sendRequest("DELETE", `${HOST}/api/meals/${id}/`);
  if (!response.ok) {
    let data = await response.json();
    let alert = createAlert(`Could not delete this meal. ID: ${id}!`, data);
    document.body.prepend(alert);
  } else {
    window.location.replace("meals.html");
  }
}

async function updateMeal(id) {
  let submitForm = generateMealForm();

  let response = await sendRequest("PUT", `${HOST}/api/meals/${id}/`, submitForm, "");
  if (!response.ok) {
    let data = await response.json();
    let alert = createAlert("Could not update your meal! :-( ", data);
    document.body.prepend(alert);
  } else {
    location.reload();
  }
}

function generateMealForm() {
  let form = document.querySelector("#form-meal");

  let formData = new FormData(form);
  let submitForm = new FormData();

  submitForm.append("name", formData.get("name"));
  let date = new Date(formData.get("date")).toISOString();
  submitForm.append("date", date);
  submitForm.append("notes", formData.get("notes"));

  const ingredientsInMeal = getIngredientsInMeal().map((ingredientInMeal) => ({
    ...ingredientInMeal,
    ingredient: ingredientInMeal.ingredient.id,
  }));
  submitForm.append("ingredient_weights", JSON.stringify(ingredientsInMeal));

  // Adds the files
  for (let file of formData.getAll("files")) {
    submitForm.append("files", file);
  }
  return submitForm;
}

async function createMeal() {
  let submitForm = generateMealForm();

  let response = await sendRequest("POST", `${HOST}/api/meals/`, submitForm, "");

  if (response.ok) {
    window.location.replace("meals.html");
  } else {
    let data = await response.json();
    let alert = createAlert("Could not create new meal", data);
    document.body.prepend(alert);
  }
}

function handleCancelDuringMealCreate() {
  window.location.replace("meals.html");
}
