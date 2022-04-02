import { sendRequest } from "../utils/api.js";
import { HOST } from "../utils/host.js";
import { createAlert } from "../utils/dom.js";

// JSDoc type imports.
/** @typedef {import("./types.js").ExerciseCategory} ExerciseCategory */

/**
 * Fetches SecFit's default exercise categories.
 * @returns {Promise<{ ok: true, categories: ExerciseCategory[] } | { ok: false }>} Result of the fetch.
 */
export async function fetchCategories() {
  const response = await sendRequest("GET", `${HOST}/api/exercise-categories/`);
  const data = await response.json();

  if (!response.ok) {
    const alert = createAlert("Could not retrieve category data!", data);
    document.body.prepend(alert);
    return { ok: false };
  }

  return { ok: true, categories: data.results };
}
