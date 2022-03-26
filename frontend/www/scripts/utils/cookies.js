export function setCookie(name, value, maxage, path = "") {
  document.cookie = `${name}=${value}; max-age=${maxage}; path=${path}`;
}

export function deleteCookie(name) {
  setCookie(name, "", 0, "/");
}

export function getCookieValue(name) {
  let cookieValue = null;
  let cookieByName = document.cookie.split("; ").find((row) => row.startsWith(name));

  if (cookieByName) {
    cookieValue = cookieByName.split("=")[1];
  }

  return cookieValue;
}
