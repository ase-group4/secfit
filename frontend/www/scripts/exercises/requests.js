import { fetchData, changeData } from "../utils/requests.js";
import { HOST } from "../utils/host.js";

// JSDoc type imports.
/** @typedef {import("./types.js").Exercise} Exercise */
/** @typedef {import("./types.js").MuscleGroup} MuscleGroup */
/** @typedef {import("./types.js").ExerciseCategory} ExerciseCategory */
/**
 * @typedef {import("../utils/types.js").ApiResponse<ResponseData>} ApiResponse<ResponseData>
 * @template ResponseData
 */

/**
 * Fetches all exercises on SecFit.
 * @returns {Promise<ApiResponse<Exercise[]>>}
 */
export async function fetchExercises() {
  return fetchData(`${HOST}/api/exercises/`, "Could not retrieve exercise data!", true);
}

/**
 * Fetches the exercise of the given ID.
 * @param {number} id
 * @returns {Promise<ApiResponse<Exercise>>}
 */
export async function fetchExercise(id) {
  return fetchData(`${HOST}/api/exercises/${id}/`, `Could not retrieve exercise with id ${id}.`);
}

/**
 * Fetches default muscle groups on SecFit.
 * @returns {Promise<ApiResponse<MuscleGroup[]>>}
 */
export async function fetchMuscleGroups() {
  return fetchData(`${HOST}/api/muscle-groups/`, "Could not retrieve muscle groups!", true);
}

/**
 * Fetches default muscle groups on SecFit.
 * @returns {Promise<ApiResponse<ExerciseCategory[]>>}
 */
export async function fetchCategories() {
  return fetchData(`${HOST}/api/exercise-categories/`, "Could not retrieve category data!", true);
}

/**
 * Sends a request to the API to create the given exercise.
 * @param {Exercise} exercise
 * @returns {Promise<{ ok: boolean }>}
 */
export async function createExercise(exercise) {
  return changeData("POST", `${HOST}/api/exercises/`, "Could not create new exercise!", exercise);
}

/**
 * Sends a request to the API to update the exercise of the given ID.
 * @param {number} id
 * @param {Exercise} exercise The updated exercise.
 * @returns {Promise<{ ok: boolean }>}
 */
export async function updateExercise(id, exercise) {
  return changeData(
    "PUT",
    `${HOST}/api/exercises/${id}/`,
    `Could not update exercise ${id}`,
    exercise
  );
}

/**
 * Sends a request to the API to delete the exercise of the given ID.
 * @param {number} id
 * @returns {Promise<{ ok: boolean }>}
 */
export async function deleteExercise(id) {
  return changeData("DELETE", `${HOST}/api/exercises/${id}/`, `Could not delete exercise ${id}`);
}
