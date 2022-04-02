import { sendRequest } from "../utils/api.js";
import { HOST } from "../utils/host.js";
import { createAlert } from "../utils/dom.js";

// JSDoc type imports.
/** @typedef {import("./types.js").Workout} Workout */
/** @typedef {import("./types.js").WorkoutFile} WorkoutFile */

/**
 * Fetches the workout with the given ID.
 * @param {number} id ID of the workout to fetch.
 * @returns {Promise<{ ok: true, workout: Workout } | { ok: false }>} Result of the fetch.
 */
export async function fetchWorkout(id) {
  const response = await sendRequest("GET", `${HOST}/api/workouts/${id}`);
  const data = await response.json();

  if (!response.ok) {
    const alert = createAlert("Could not retrieve workout data!", data);
    document.body.prepend(alert);
    return { ok: false };
  }

  return { ok: true, workout: data };
}

/**
 * Returns the file name of the given workout file.
 *
 * @param {WorkoutFile} file
 * @returns {string}
 */
export function getWorkoutFileName(file) {
  // First splits the file path, and assumes that the file name is the last part of the path.
  return file.file.split("/").at(-1);
}

/**
 * Returns the file type of the given workout file.
 *
 * @param {WorkoutFile} file
 * @returns {string}
 */
export function getWorkoutFileType(file) {
  // Takes the part after the last "." in the file name as the file type.
  return getWorkoutFileName(file).split(".").at(-1);
}
