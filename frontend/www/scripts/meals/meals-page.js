import { updateNutritionTotals } from "./ingredient-utils.js";
import { sendRequest, getCurrentUser } from "../utils/requests.js";
import { HOST } from "../utils/host.js";

window.addEventListener("DOMContentLoaded", async () => {
  const createButton = document.querySelector("#btn-create-meal");
  createButton.addEventListener("click", createMeal);

  let ordering = "-date";
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("ordering")) {
    ordering = urlParams.get("ordering");
    if (ordering == "name" || ordering == "owner" || ordering == "date") {
      const aSort = document.querySelector(`a[href="?ordering=${ordering}"`);
      aSort.href = `?ordering=-${ordering}`;
    }
  }

  const currentSort = document.querySelector("#current-sort");
  currentSort.innerHTML =
    (ordering.startsWith("-") ? "Descending" : "Ascending") + " " + ordering.replace("-", "");

  const currentUser = await getCurrentUser();
  // grab username
  if (ordering.includes("owner")) {
    ordering += "__username";
  }
  const meals = await fetchMeals(ordering);

  const tabEls = document.querySelectorAll('a[data-bs-toggle="list"]');
  for (let i = 0; i < tabEls.length; i++) {
    const tabEl = tabEls[i];
    tabEl.addEventListener("show.bs.tab", function (event) {
      const mealAnchors = document.querySelectorAll(".meal");
      for (let j = 0; j < meals.length; j++) {
        // I'm assuming that the order of meal objects matches
        // the other of the meal anchor elements. They should, given
        // that I just created them.
        const meal = meals[j];
        const mealAnchor = mealAnchors[j];

        switch (event.currentTarget.id) {
          case "list-my-meals-list":
            if (meal.owner == currentUser.url) {
              mealAnchor.classList.remove("hide");
            } else {
              mealAnchor.classList.add("hide");
            }
            break;
          default:
            mealAnchor.classList.remove("hide");
            break;
        }
      }
    });
  }
});

function createMeal() {
  window.location.replace("meal.html");
}

async function fetchMeals(ordering) {
  const response = await sendRequest("GET", `${HOST}/api/meals/?ordering=${ordering}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    const data = await response.json();

    const meals = data.results;
    const container = document.getElementById("div-content");
    meals.forEach((meal) => {
      const templateMeal = document.querySelector("#template-meal");
      const cloneMeal = templateMeal.content.cloneNode(true);

      const aMeal = cloneMeal.querySelector("a");
      aMeal.href = `meal.html?id=${meal.id}`;

      const h5 = aMeal.querySelector("h5");
      h5.textContent = meal.name;

      const localDate = new Date(meal.date);

      const table = aMeal.querySelector("table");
      const rows = table.querySelectorAll("tr");
      rows[0].querySelectorAll("td")[1].textContent = localDate.toLocaleDateString(); // Date
      rows[1].querySelectorAll("td")[1].textContent = localDate.toLocaleTimeString(); // Time
      rows[2].querySelectorAll("td")[1].textContent = meal.owner_username; //Owner

      updateNutritionTotals(meal.ingredient_weights, aMeal);

      container.appendChild(aMeal);
    });
    return meals;
  }
}
