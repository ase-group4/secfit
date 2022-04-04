import { getCookieValue, setCookie } from "./cookies.js";
import { HOST } from "./host.js";
import { displayAlert } from "./dom.js";

// JSDoc type imports.
/** @typedef {import("./types.js").ApiResponse} ApiResponse */

export async function sendRequest(
  method,
  url,
  body,
  contentType = "application/json; charset=UTF-8"
) {
  if (body && contentType.includes("json")) {
    body = JSON.stringify(body);
  }

  let myHeaders = new Headers();

  if (contentType) myHeaders.set("Content-Type", contentType);
  if (getCookieValue("access"))
    myHeaders.set("Authorization", "Bearer " + getCookieValue("access"));
  let myInit = { headers: myHeaders, method: method, body: body };
  let myRequest = new Request(url, myInit);

  let response = await fetch(myRequest);
  if (response.status == 401 && getCookieValue("refresh")) {
    // access token not accepted. getting refresh token
    myHeaders = new Headers({ "Content-Type": "application/json; charset=UTF-8" });
    const tokenBody = JSON.stringify({ refresh: getCookieValue("refresh") });
    myInit = { headers: myHeaders, method: "POST", body: tokenBody };
    myRequest = new Request(`${HOST}/api/token/refresh/`, myInit);
    response = await fetch(myRequest);

    if (response.ok) {
      // refresh successful, received new access token
      const data = await response.json();
      setCookie("access", data.access, 86400, "/");

      const myHeaders = new Headers({
        Authorization: "Bearer " + getCookieValue("access"),
        "Content-Type": contentType,
      });
      const myInit = { headers: myHeaders, method: method, body: body };
      const myRequest = new Request(url, myInit);
      response = await fetch(myRequest);

      if (!response.ok) window.location.replace("logout.html");
    }
  }

  return response;
}

/**
 * Fetches data from the given URL, and displays an error alert if it fails.
 * @param {string} url The API URL to fetch data from.
 * @param {string} alertTextOnFail The text to display in the alert if fetching failed.
 * @returns {Promise<ApiResponse>} Result of the fetch.
 */
export async function fetchData(url, alertTextOnFail, list) {
  const response = await sendRequest("GET", url);
  const data = await response.json();

  if (!response.ok) {
    displayAlert(alertTextOnFail, data);
    return { ok: false };
  }

  const result = { ok: true };
  if (list) {
    result.data = data.results;
  } else {
    result.data = data;
  }
  return result;
}

export async function getCurrentUser() {
  let user = null;
  const response = await sendRequest("GET", `${HOST}/api/users/?user=current`);
  if (!response.ok) {
    console.log("COULD NOT RETRIEVE CURRENTLY LOGGED IN USER");
  } else {
    const data = await response.json();
    user = data.results[0];
  }

  return user;
}
