// Type definitions for JSDoc documentation.

/** @typedef {import("../utils/types.js").ApiUrl} ApiUrl */

/**
 * A workout submitted by a user on SecFit.
 * @typedef {Object} Workout
 * @property {number} id
 * @property {string} name
 * @property {notes} notes
 * @property {string} owner_username
 * @property {"PU" | "PR" | "CO"} visibility Whether the workout is public, private or visible to coaches.
 * @property {string} date Date when the workout was created, in string format yyyy-mm-ddThh:mm:ssZ.
 * @property {ExerciseInstance[]} exercise_instances Instances of exercises on this workout.
 * @property {WorkoutFile[]} files Files submitted as part of this workout.
 * @property {ApiUrl} url API URL to this workout.
 * @property {ApiUrl} owner API URL to the user that created the workout.
 */

/**
 * An exercise that is part of a workout.
 * @typedef {Object} ExerciseInstance
 * @property {number} id
 * @property {number} sets The number of sets to complete for the exercise.
 * @property {number} number The number of 'units' of the exercise (type of unit defined on the exercise).
 * @property {ApiUrl} url API URL to this exercise instance.
 * @property {ApiUrl} exercise API URL to the exercise that the instance is tied to.
 * @property {ApiUrl} workout API URL to the workout that the instance is tied to.
 */

/**
 * A file posted as part of a workout.
 * @typedef {Object} WorkoutFile
 * @property {number} id
 * @property {string} owner Name of the user that crated the file.
 * @property {ApiUrl} url API URL to the backend object for this workout file instance.
 * @property {ApiUrl} file API URL to the actual file.
 * @property {ApiUrl} workout API URL to the workout that the instance is tied to.
 */

// Necessary empty export for other files to import the types.
export {};
