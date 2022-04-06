// JSDoc type imports.
/** @typedef {import("./types.js").WorkoutFile} WorkoutFile */

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
