import { getCookieValue, setCookie } from "./cookies.js";
import { HOST } from "./host.js";

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
    let tokenBody = JSON.stringify({ refresh: getCookieValue("refresh") });
    myInit = { headers: myHeaders, method: "POST", body: tokenBody };
    myRequest = new Request(`${HOST}/api/token/refresh/`, myInit);
    response = await fetch(myRequest);

    if (response.ok) {
      // refresh successful, received new access token
      let data = await response.json();
      setCookie("access", data.access, 86400, "/");

      let myHeaders = new Headers({
        Authorization: "Bearer " + getCookieValue("access"),
        "Content-Type": contentType,
      });
      let myInit = { headers: myHeaders, method: method, body: body };
      let myRequest = new Request(url, myInit);
      response = await fetch(myRequest);

      if (!response.ok) window.location.replace("logout.html");
    }
  }

  return response;
}

export async function getCurrentUser() {
  let user = null;
  let response = await sendRequest("GET", `${HOST}/api/users/?user=current`);
  if (!response.ok) {
    console.log("COULD NOT RETRIEVE CURRENTLY LOGGED IN USER");
  } else {
    let data = await response.json();
    user = data.results[0];
  }

  return user;
}
