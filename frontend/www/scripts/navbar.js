import { getCookieValue } from "./utils/cookies.js";

class NavBar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <a class="navbar-brand fw-bold ms-5 me-3" href="#">SecFit</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse ms-1" id="navbarNavAltMarkup">
            <div class="navbar-nav me-auto">
              <a class="nav-link" id="nav-index" href="index.html">Home</a>
              <a class="nav-link hide" id="nav-workouts" href="workouts.html">Workouts</a>
              <a class="nav-link hide" id="nav-exercises" href="exercises.html">Exercises</a>
              <a class="nav-link hide" id="nav-mycoach" href="mycoach.html">Coach</a>
              <a class="nav-link hide" id="nav-myathletes" href="myathletes.html">Athletes</a>
              <a class="nav-link hide" id="nav-meals" href="meals.html">Meals</a>
              <hr>
            </div>
            <div class="my-2 my-lg-0 me-5">
              <a role="button" class="btn btn-primary hide" id="btn-register" href="register.html">Register</a>
              <a role="button" class="btn btn-secondary hide" id="btn-login-nav" href="login.html">Log in</a>
              <a role="button" class="btn btn-secondary hide" id="btn-logout" href="logout.html">Log out</a>
            </div>
          </div>
        </div>
      </nav>
    `;
  }
}

customElements.define("navbar-el", NavBar);

function updateNavBar() {
  // Emphasize link to current page
  if (window.location.pathname == "/" || window.location.pathname == "/index.html") {
    makeNavLinkActive("nav-index");
  } else if (window.location.pathname == "/workouts.html") {
    makeNavLinkActive("nav-workouts");
  } else if (window.location.pathname == "/exercises.html") {
    makeNavLinkActive("nav-exercises");
  } else if (window.location.pathname == "/mycoach.html") {
    makeNavLinkActive("nav-mycoach");
  } else if (window.location.pathname == "/myathletes.html") {
    makeNavLinkActive("nav-myathletes");
  } else if (window.location.pathname == "/meals.html") {
    makeNavLinkActive("nav-meals");
  }

  if (isUserAuthenticated()) {
    document.getElementById("btn-logout").classList.remove("hide");

    document.querySelector('a[href="logout.html"').classList.remove("hide");
    document.querySelector('a[href="workouts.html"').classList.remove("hide");
    document.querySelector('a[href="mycoach.html"').classList.remove("hide");
    document.querySelector('a[href="exercises.html"').classList.remove("hide");
    document.querySelector('a[href="myathletes.html"').classList.remove("hide");
    document.querySelector('a[href="meals.html"').classList.remove("hide");
  } else {
    document.getElementById("btn-login-nav").classList.remove("hide");
    document.getElementById("btn-register").classList.remove("hide");
  }
}

export function makeNavLinkActive(id) {
  const link = document.getElementById(id);
  link.classList.add("active");
  link.setAttribute("aria-current", "page");
}

function isUserAuthenticated() {
  return getCookieValue("access") != null || getCookieValue("refresh") != null;
}

window.addEventListener("DOMContentLoaded", updateNavBar);
