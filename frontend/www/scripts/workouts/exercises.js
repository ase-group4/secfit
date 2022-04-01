import { sendRequest } from "../utils/api.js";
import { HOST } from "../utils/host.js";
import { createAlert } from "../utils/dom.js";

async function fetchExerciseTypes() {
  const response = await sendRequest("GET", `${HOST}/api/exercises/`);

  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert("Could not retrieve exercise types!", data);
    document.body.prepend(alert);
  } else {
    const data = await response.json();

    const exercises = data.results;
    const container = document.getElementById("div-content");
    const exerciseTemplate = document.querySelector("#template-exercise");
    exercises.forEach((exercise) => {
      const exerciseAnchor = exerciseTemplate.content.firstElementChild.cloneNode(true);
      exerciseAnchor.href = `exercise.html?id=${exercise.id}`;

      const h5 = exerciseAnchor.querySelector("h5");
      h5.textContent = exercise.name;

      const p = exerciseAnchor.querySelector("p");
      p.textContent = exercise.description;

      container.appendChild(exerciseAnchor);
    });
    return exercises;
  }
}

async function getCategories() {
  const response = await sendRequest("GET", `${HOST}/api/exercise-categories/`);
  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert("Could not retrieve category data!", data);
    document.body.prepend(alert);
  } else {
    const categoriesData = await response.json();
    const categorySelect = document.querySelector("#list-tab");

    let output = `<a class="list-group-item list-group-item-action active" id="list-all" data-bs-toggle="list" href="#list-all" role="tab" aria-controls="all">All</a>`;
    categoriesData["results"].forEach((category) => {
      output += `<a class="list-group-item list-group-item-action" id="list-${category.id}" data-bs-toggle="list" href="#list-${category.id}" role="tab" aria-controls=${category.name}>${category.name}</a>`;
    });
    categorySelect.innerHTML = output;
  }
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
  getCategories();

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
