import { fetchData } from "../utils/api.js";
import { HOST } from "../utils/host.js";
import { fetchExercises } from "./requests.js";

// JSDoc type imports.
/** @typedef {import("./types.js").Exercise} Exercise */
/** @typedef {import("./types.js").ExerciseCategory} ExerciseCategory */

async function fetchExerciseTypes() {
  const { ok, data: exercises } = await fetchExercises();
  if (!ok) return;

  const container = document.getElementById("div-content");
  const exerciseTemplate = document.querySelector("#template-exercise");

  for (const exercise of exercises) {
    const exerciseAnchor = exerciseTemplate.content.firstElementChild.cloneNode(true);
    exerciseAnchor.href = `exercise.html?id=${exercise.id}`;

    const h5 = exerciseAnchor.querySelector("h5");
    h5.textContent = exercise.name;

    const p = exerciseAnchor.querySelector("p");
    p.textContent = exercise.description;

    container.appendChild(exerciseAnchor);
  }

  return exercises;
}

async function populateCategoryBar() {
  const categoryBar = document.querySelector("#list-tab");

  /** @type {ApiResponse<ExerciseCategory[]>} */
  const response = await fetchData(
    `${HOST}/api/exercise-categories/`,
    "Could not retrieve category data!",
    true
  );
  if (!response.ok) return;

  const allTab = createTabElement({ id: "all", name: "All", active: true });
  categoryBar.appendChild(allTab);

  for (const category of response.data) {
    const categoryTab = createTabElement(category);
    categoryBar.appendChild(categoryTab);
  }
}

function createTabElement({ id, name, active }) {
  const tab = document.createElement("a");
  tab.innerText = name;
  tab.className = "list-group-item list-group-item-action";
  if (active) tab.classList.add("active");
  tab.id = `list-${id}`;
  tab.href = `#list-${id}`;
  tab.setAttribute("role", "tab");
  tab.setAttribute("data-bs-toggle", "list");
  tab.setAttribute("aria-controls", name);
  return tab;
}

function filterExercises(exercises, searchValue, categoryFilter) {
  const exerciseAnchors = document.querySelectorAll(".exercise");
  for (let j = 0; j < exercises.length; j++) {
    // I'm assuming that the order of exercise objects matches
    // the other of the exercise anchor elements. They should, given
    // that I just created them.
    const exercise = exercises[j];
    const exerciseAnchor = exerciseAnchors[j];
    if (exercise.name.toLowerCase().includes(searchValue.toLowerCase())) {
      if (isNaN(categoryFilter) || Number(categoryFilter) == exercise.category) {
        exerciseAnchor.classList.remove("hide");
      } else {
        exerciseAnchor.classList.add("hide");
      }
    } else {
      exerciseAnchor.classList.add("hide");
    }
  }
}

function createExercise() {
  window.location.replace("exercise.html");
}

window.addEventListener("DOMContentLoaded", async () => {
  const createButton = document.querySelector("#btn-create-exercise");
  createButton.addEventListener("click", createExercise);
  populateCategoryBar();

  const exercises = await fetchExerciseTypes();

  const searchInput = document.querySelector("[data-search]");
  let searchValue = "";
  let categoryFilter = "all";

  searchInput.addEventListener("input", (e) => {
    searchValue = e.target.value;
    filterExercises(exercises, searchValue, categoryFilter);
  });

  const tabEls = document.querySelectorAll('a[data-bs-toggle="list"]');
  for (let i = 0; i < tabEls.length; i++) {
    const tabEl = tabEls[i];
    tabEl.addEventListener("show.bs.tab", function (event) {
      categoryFilter = event.currentTarget.id.split("-")[1];
      filterExercises(exercises, searchValue, categoryFilter);
    });
  }
});
