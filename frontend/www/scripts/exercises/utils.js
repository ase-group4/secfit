import { sendRequest } from "../utils/api.js";
import { HOST } from "../utils/host.js";
import { displayAlert } from "../utils/dom.js";

// JSDoc type imports.
/** @typedef {import("./types.js").Exercise} Exercise */
/** @typedef {import("./types.js").MuscleGroup} MuscleGroup */
/** @typedef {import("./types.js").ExerciseCategory} ExerciseCategory */

/**
 * Fetches the exercise of the given ID.
 * @param {number} id
 * @returns {Promise<{ ok: true, exercise: Exercise } | { ok: false }>} Result of the fetch.
 */
export async function fetchExercises(id) {
  const response = await sendRequest("GET", `${HOST}/api/exercises/${id}/`);
  const data = await response.json();

  if (!response.ok) {
    displayAlert(`Could not retrieve exercise with id ${id}.`, data);
    return { ok: false };
  }

  return { ok: true, exercise: data };
}

/**
 * Fetches SecFit's default muscle groups.
 * @returns {Promise<{ ok: true, muscleGroups: MuscleGroup[] } | { ok: false }>} Result of the fetch.
 */
export async function fetchMuscleGroups() {
  const response = await sendRequest("GET", `${HOST}/api/muscle-groups/`);
  const data = await response.json();

  if (!response.ok) {
    displayAlert("Could not retrieve muscle groups!", data);
    return { ok: false };
  }

  return { ok: true, muscleGroups: data.results };
}

/**
 * Fetches SecFit's default exercise categories.
 * @returns {Promise<{ ok: true, categories: ExerciseCategory[] } | { ok: false }>} Result of the fetch.
 */
export async function fetchCategories() {
  const response = await sendRequest("GET", `${HOST}/api/exercise-categories/`);
  const data = await response.json();

  if (!response.ok) {
    displayAlert("Could not retrieve category data!", data);
    return { ok: false };
  }

  return { ok: true, categories: data.results };
}
