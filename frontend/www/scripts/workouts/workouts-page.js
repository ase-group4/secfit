import { sendRequest, getCurrentUser } from "../utils/requests.js";
import { HOST } from "../utils/host.js";

async function fetchWorkouts(ordering) {
  const response = await sendRequest("GET", `${HOST}/api/workouts/?ordering=${ordering}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    const data = await response.json();

    const workouts = data.results;
    const container = document.getElementById("div-content");
    workouts.forEach((workout) => {
      const templateWorkout = document.querySelector("#template-workout");
      const cloneWorkout = templateWorkout.content.cloneNode(true);

      const aWorkout = cloneWorkout.querySelector("a");
      aWorkout.href = `workout.html?id=${workout.id}`;

      const h5 = aWorkout.querySelector("h5");
      h5.textContent = workout.name;

      const localDate = new Date(workout.date);

      const table = aWorkout.querySelector("table");
      const rows = table.querySelectorAll("tr");
      rows[0].querySelectorAll("td")[1].textContent = localDate.toLocaleDateString(); // Date
      rows[1].querySelectorAll("td")[1].textContent = localDate.toLocaleTimeString(); // Time
      rows[2].querySelectorAll("td")[1].textContent = workout.owner_username; //Owner
      rows[3].querySelectorAll("td")[1].textContent = workout.exercise_instances.length; // Exercises

      container.appendChild(aWorkout);
    });
    return workouts;
  }
}

function createWorkout() {
  window.location.replace("workout.html");
}

function filterWorkouts(searchValue, authorFilter, workouts, currentUser) {
  const workoutAnchors = document.querySelectorAll(".workout");
  for (let j = 0; j < workouts.length; j++) {
    // I'm assuming that the order of workout objects matches
    // the other of the workout anchor elements. They should, given
    // that I just created them.
    const workout = workouts[j];
    const workoutAnchor = workoutAnchors[j];
    if (workout.name.toLowerCase().includes(searchValue.toLowerCase())) {
      switch (authorFilter) {
        case "list-my-workouts-list":
          if (workout.owner == currentUser.url) {
            workoutAnchor.classList.remove("hide");
          } else {
            workoutAnchor.classList.add("hide");
          }
          break;
        case "list-athlete-workouts-list":
          if (currentUser.athletes && currentUser.athletes.includes(workout.owner)) {
            workoutAnchor.classList.remove("hide");
          } else {
            workoutAnchor.classList.add("hide");
          }
          break;
        case "list-public-workouts-list":
          if (workout.visibility == "PU") {
            workoutAnchor.classList.remove("hide");
          } else {
            workoutAnchor.classList.add("hide");
          }
          break;
        default:
          workoutAnchor.classList.remove("hide");
          break;
      }
    } else {
      workoutAnchor.classList.add("hide");
    }
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const createButton = document.querySelector("#btn-create-workout");
  createButton.addEventListener("click", createWorkout);
  let ordering = "-date";

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("ordering")) {
    ordering = urlParams.get("ordering");
    if (ordering == "name" || ordering == "owner" || ordering == "date") {
      const aSort = document.querySelector(`a[href="?ordering=${ordering}"`);
      aSort.href = `?ordering=-${ordering}`;
    }
  }

  const currentSort = document.querySelector("#current-sort");
  currentSort.innerHTML =
    (ordering.startsWith("-") ? "Descending" : "Ascending") + " " + ordering.replace("-", "");

  const currentUser = await getCurrentUser();
  // grab username
  if (ordering.includes("owner")) {
    ordering += "__username";
  }
  const workouts = await fetchWorkouts(ordering);

  const searchInput = document.querySelector("[data-search]");
  let searchValue = "";
  searchInput.addEventListener("input", (e) => {
    searchValue = e.target.value;
    filterWorkouts(searchValue, authorFilter, workouts, currentUser);
  });

  let authorFilter = "list-my-workouts-list";
  const tabEls = document.querySelectorAll('a[data-bs-toggle="list"]');
  for (let i = 0; i < tabEls.length; i++) {
    const tabEl = tabEls[i];
    tabEl.addEventListener("show.bs.tab", function (event) {
      authorFilter = event.currentTarget.id;
      filterWorkouts(searchValue, authorFilter, workouts, currentUser);
    });
  }
});
