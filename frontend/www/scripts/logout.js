import { deleteCookie } from "./utils/cookies.js";

deleteCookie("access");
deleteCookie("refresh");
deleteCookie("remember_me");
sessionStorage.removeItem("username");
window.location.replace("index.html");
