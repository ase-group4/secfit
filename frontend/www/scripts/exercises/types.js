// Type definitions for JSDoc documentation.

/**
 * An exercise submitted by a user on SecFit, that can be added to workouts.
 * @typedef {Object} Exercise
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} muscleGroup
 * @property {number} category ID of the backend exercise category of this exercise.
 * @property {string} unit How to measure consecutive completions of an exercise, e.g. repetitions.
 * @property {number} duration
 * @property {number} calories Number of kcal burned from completing the exercise.
 * @property {ApiUrl} url API URL to this exercise.
 * @property {ApiUrl[]} exercise_instances API URLs to instances of this exercise on workouts.
 */

export {};
