import { setReadOnly, populateDropdown, populateForm, getFormAnswers } from "../utils/dom.js";
import {
  createExercise,
  deleteExercise,
  fetchCategories,
  fetchExercise,
  fetchMuscleGroups,
  updateExercise,
} from "./requests.js";

// JSDoc type imports.
/** @typedef {import("./types.js").Exercise} Exercise */

/**
 * Container object for buttons on the exercise page.
 * @typedef {Object} ExercisePageButtons
 * @property {HTMLButtonElement} ok The "OK" button on the exercise page.
 * @property {HTMLButtonElement} cancel The "Cancel" button on the exercise page.
 * @property {HTMLButtonElement} delete The "Delete" button on the exercise page.
 * @property {HTMLButtonElement} edit The "Edit" button on the exercise page.
 */

/**
 * Previous state of the form that is saved before editing the form.
 * @type {FormData | undefined}
 */
let oldFormData;

// Entry point of the script on the gallery page.
window.addEventListener("DOMContentLoaded", async () => {
  /** @type {ExercisePageButtons} */
  const buttons = {
    ok: document.querySelector("#btn-ok-exercise"),
    cancel: document.querySelector("#btn-cancel-exercise"),
    delete: document.querySelector("#btn-delete-exercise"),
    edit: document.querySelector("#btn-edit-exercise"),
  };

  const urlParams = new URLSearchParams(window.location.search);

  // Fetches for the form dropdowns are done concurrently, to reduce wait time.
  await Promise.all([initializeMuscleGroups(), initializeCategories()]);

  // If URL parameter "id" is passed, the page should be in view mode.
  // Else, the page should show exercise creation.
  if (urlParams.has("id")) {
    const exerciseId = urlParams.get("id");

    // Exercise data is initialized after the dropdowns,
    // in order to display the correct dropdown value.
    await initializeExerciseData(exerciseId);

    setPageMode("view", buttons, exerciseId);
  } else {
    setPageMode("create", buttons);
  }
});

/**
 * Fetches the exercise of the given ID, and populates the exercise form fields with the response data.
 * @param {number} exerciseId
 */
async function initializeExerciseData(exerciseId) {
  const { ok, data: exercise } = await fetchExercise(exerciseId);
  if (!ok) return;

  const form = document.querySelector("#form-exercise");
  const formData = new FormData(form);

  for (const key of formData.keys()) {
    const selector =
      key === "muscle_group" || key === "category"
        ? `select[name="${key}"]`
        : `input[name="${key}"], textarea[name="${key}"]`;

    const input = document.querySelector(selector);

    input.value = exercise[key];
  }
}

/** Fetches muscle groups, and populates the muscle group dropdown with them. */
async function initializeMuscleGroups() {
  const { ok, data: muscleGroups } = await fetchMuscleGroups();
  if (!ok) return;

  populateDropdown(muscleGroups, "muscle_group", "muscle");
}

/** Fetches exercise categories, and populates the category dropdown with them. */
async function initializeCategories() {
  const { ok, data: categories } = await fetchCategories();
  if (!ok) return;

  populateDropdown(categories, "category", "name");
}

/**
 * Sets appropriate form and button states according to the given `mode`.
 * @param {"view" | "edit" | "create"} mode
 * @param {ExercisePageButtons} buttons Buttons on the exercise page.
 * @param {number} [exerciseId] If passed with view mode, sets up button listeners for view/edit page.
 */
function setPageMode(mode, buttons, exerciseId) {
  switch (mode) {
    case "view":
      setReadOnly(true, "#form-exercise");

      buttons.edit.classList.remove("hide");
      for (const button of ["ok", "delete", "cancel"]) {
        buttons[button].classList.add("hide");
      }

      if (!exerciseId) {
        break;
      }

      buttons.edit.addEventListener("click", () => {
        handleEditExerciseButtonClick(buttons);
      });
      buttons.ok.addEventListener("click", async () => {
        await handleUpdateExercise(exerciseId, buttons);
      });
      buttons.cancel.addEventListener("click", () => {
        handleCancelButtonDuringEdit(buttons);
      });
      buttons.delete.addEventListener("click", async () => {
        await handleDeleteExercise(exerciseId);
      });

      break;
    case "edit":
      setReadOnly(false, "#form-exercise");

      for (const button of ["ok", "delete", "cancel"]) {
        buttons[button].classList.remove("hide");
      }
      buttons.edit.classList.add("hide");

      break;
    case "create":
      setReadOnly(false, "#form-exercise");

      for (const button of ["ok", "cancel"]) {
        buttons[button].classList.remove("hide");
      }
      for (const button of ["edit", "delete"]) {
        buttons[button].classList.add("hide");
      }

      buttons.ok.addEventListener("click", async () => await handleCreateExercise());
      buttons.cancel.addEventListener("click", () => {
        window.location.replace("exercises.html");
      });

      break;
  }
}

/**
 * Event handler for clicking the "Edit" button while viewing an exercise.
 * @param {ExercisePageButtons} buttons Buttons on the exercise page.
 */
function handleEditExerciseButtonClick(buttons) {
  setReadOnly(false, "#form-exercise");

  buttons.edit.classList.add("hide");
  for (const button of ["ok", "cancel", "delete"]) {
    buttons[button].classList.remove("hide");
  }

  const form = document.querySelector("#form-exercise");
  oldFormData = new FormData(form);
}

/**
 * Reads the input in the exercise form, and sends a request to create the exercise.
 * Redirects to Exercises page on success.
 */
async function handleCreateExercise() {
  /** @type {Exercise} */
  const body = getFormAnswers("#form-exercise");

  const { ok } = await createExercise(body);

  if (ok) {
    window.location.replace("exercises.html");
  }
}

/**
 * Reads the form inputs on the exercise page,
 * and sends a request to update the exercise of the given ID.
 * Returns the page to view mode on success.
 * @param {number} id ID of the exercise to update.
 * @param {ExercisePageButtons} buttons Buttons on the exercise page.
 */
async function handleUpdateExercise(id, buttons) {
  /** @type {Exercise} */
  const body = getFormAnswers("#form-exercise");

  const { ok } = await updateExercise(id, body);

  if (ok) {
    setPageMode("view", buttons);
  }
}

/**
 * Event handler when pressing the "Cancel" button while editing an exercise.
 * @param {ExercisePageButtons} buttons Buttons on the exercise page.
 */
function handleCancelButtonDuringEdit(buttons) {
  /** @type {HTMLFormElement} */
  const form = document.querySelector("#form-exercise");
  populateForm(form, oldFormData);

  setPageMode("view", buttons);
}

/**
 * Sends a request to delete the exercise of the given ID.
 * Redirects to Exercises page on success.
 * @param {number} id ID of the exercise to delete.
 */
async function handleDeleteExercise(id) {
  const { ok } = deleteExercise(id);

  if (ok) {
    window.location.replace("exercises.html");
  }
}
