// JSDoc type definitions.

/**
 * URL to some resource served by the backend.
 * Starts with the main URL to the API, e.g. localhost:8000/api.
 * @typedef {string} ApiUrl
 */

/**
 * Generic type for the response from the API.
 * @typedef {{ ok: true, data: ResponseData } | { ok: false }} ApiResponse
 * @template ResponseData
 */

export {};
