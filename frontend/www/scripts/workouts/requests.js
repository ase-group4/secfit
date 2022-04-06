import { changeData, fetchData } from "../utils/requests.js";
import { HOST } from "../utils/host";

// JSDoc type imports.
/** @typedef {import("./types.js").Workout} Workout */
/**
 * @typedef {import("../utils/types.js").ApiResponse<ResponseData>} ApiResponse<ResponseData>
 * @template ResponseData
 */

/**
 * Fetches the workout of the given ID.
 * @param {number} id
 * @returns {Promise<ApiResponse<Workout>>}
 */
export async function fetchWorkout(id) {
  return fetchData(`${HOST}/api/workouts/${id}`, "Could not retrieve workout data!");
}

/**
 * Deletes the workout file of the given ID.
 * @param {number} id
 * @returns {Promise<{ ok: boolean }>}
 */
export async function deleteWorkoutFile(id) {
  return changeData(
    "DELETE",
    `${HOST}/api/workout-files/${id}/`,
    `Could not delete workout file ${id}!`
  );
}
