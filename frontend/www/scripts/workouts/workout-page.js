import { sendRequest, getCurrentUser } from "../utils/requests.js";
import { HOST } from "../utils/host.js";
import { createAlert, setReadOnly } from "../utils/dom.js";

let cancelWorkoutButton;
let okWorkoutButton;
let deleteWorkoutButton;
let editWorkoutButton;
let galleryButton;

async function retrieveWorkout(id) {
  let workoutData = null;
  const response = await sendRequest("GET", `${HOST}/api/workouts/${id}/`);
  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert("Could not retrieve workout data!", data);
    document.body.prepend(alert);
  } else {
    workoutData = await response.json();
    const form = document.querySelector("#form-workout");
    const formData = new FormData(form);

    for (const key of formData.keys()) {
      const selector = `input[name="${key}"], textarea[name="${key}"]`;
      const input = form.querySelector(selector);
      let newVal = workoutData[key];
      if (key == "date") {
        // Creating a valid datetime-local string with the correct local time
        let date = new Date(newVal);
        date = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString(); // get ISO format for local time
        newVal = date.substring(0, newVal.length - 1); // remove Z (since this is a local time, not UTC)
      }
      if (key != "files") {
        input.value = newVal;
      }
    }

    const input = form.querySelector("select:disabled");
    input.value = workoutData["visibility"];
    // files
    const filesDiv = document.querySelector("#uploaded-files");
    for (const file of workoutData.files) {
      const a = document.createElement("a");
      a.href = file.file;
      const pathArray = file.file.split("/");
      a.text = pathArray[pathArray.length - 1];
      a.className = "me-2";

      filesDiv.appendChild(a);
    }

    // create exercises

    // fetch exercise types
    const exerciseTypeResponse = await sendRequest("GET", `${HOST}/api/exercises/`);
    const exerciseTypes = await exerciseTypeResponse.json();

    //TODO: This should be in its own method.
    for (let i = 0; i < workoutData.exercise_instances.length; i++) {
      const templateExercise = document.querySelector("#template-exercise");
      const divExerciseContainer = templateExercise.content.firstElementChild.cloneNode(true);

      const exerciseTypeLabel = divExerciseContainer.querySelector(".exercise-type");
      exerciseTypeLabel.for = `inputExerciseType${i}`;

      const exerciseTypeSelect = divExerciseContainer.querySelector("select");
      exerciseTypeSelect.id = `inputExerciseType${i}`;
      exerciseTypeSelect.disabled = true;

      const splitUrl = workoutData.exercise_instances[i].exercise.split("/");
      const currentExerciseTypeId = splitUrl[splitUrl.length - 2];
      let currentExerciseType = "";

      for (let j = 0; j < exerciseTypes.count; j++) {
        const option = document.createElement("option");
        option.value = exerciseTypes.results[j].id;
        if (currentExerciseTypeId == exerciseTypes.results[j].id) {
          currentExerciseType = exerciseTypes.results[j];
        }
        option.innerText = exerciseTypes.results[j].name;
        exerciseTypeSelect.append(option);
      }

      exerciseTypeSelect.value = currentExerciseType.id;

      const exerciseSetLabel = divExerciseContainer.querySelector(".exercise-sets");
      exerciseSetLabel.for = `inputSets${i}`;

      const exerciseSetInput = divExerciseContainer.querySelector("input[name='sets']");
      exerciseSetInput.id = `inputSets${i}`;
      exerciseSetInput.value = workoutData.exercise_instances[i].sets;
      exerciseSetInput.readOnly = true;

      const exerciseNumberLabel = divExerciseContainer.querySelector(".exercise-number");
      (exerciseNumberLabel.for = "for"), `inputNumber${i}`;
      exerciseNumberLabel.innerText = currentExerciseType.unit;

      const exerciseNumberInput = divExerciseContainer.querySelector("input[name='number']");
      exerciseNumberInput.id = `inputNumber${i}`;
      exerciseNumberInput.value = workoutData.exercise_instances[i].number;
      exerciseNumberInput.readOnly = true;

      const exercisesDiv = document.querySelector("#div-exercises");
      exercisesDiv.appendChild(divExerciseContainer);
    }
  }
  return workoutData;
}

function handleCancelDuringWorkoutEdit() {
  location.reload();
}

function handleEditWorkoutButtonClick() {
  const addExerciseButton = document.querySelector("#btn-add-exercise");
  const removeExerciseButton = document.querySelector("#btn-remove-exercise");

  setReadOnly(false, "#form-workout");
  document.querySelector("#inputOwner").readOnly = true; // owner field should still be readonly

  editWorkoutButton.className += " hide";
  galleryButton.className += " hide";
  okWorkoutButton.className = okWorkoutButton.className.replace(" hide", "");
  cancelWorkoutButton.className = cancelWorkoutButton.className.replace(" hide", "");
  deleteWorkoutButton.className = deleteWorkoutButton.className.replace(" hide", "");
  addExerciseButton.className = addExerciseButton.className.replace(" hide", "");
  removeExerciseButton.className = removeExerciseButton.className.replace(" hide", "");

  cancelWorkoutButton.addEventListener("click", handleCancelDuringWorkoutEdit);
}

function handleGalleryButtonClick() {
  const urlParams = new URLSearchParams(window.location.search);

  const id = urlParams.get("id");
  window.location.replace(`gallery.html?id=${id}`);
}

async function deleteWorkout(id) {
  const response = await sendRequest("DELETE", `${HOST}/api/workouts/${id}/`);
  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert(`Could not delete workout ${id}!`, data);
    document.body.prepend(alert);
  } else {
    window.location.replace("workouts.html");
  }
}

async function updateWorkout(id) {
  const submitForm = generateWorkoutForm();

  const response = await sendRequest("PUT", `${HOST}/api/workouts/${id}/`, submitForm, "");
  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert("Could not update workout!", data);
    document.body.prepend(alert);
  } else {
    location.reload();
  }
}

function generateWorkoutForm() {
  const form = document.querySelector("#form-workout");

  const formData = new FormData(form);
  const submitForm = new FormData();

  submitForm.append("name", formData.get("name"));
  const date = new Date(formData.get("date")).toISOString();
  submitForm.append("date", date);
  submitForm.append("notes", formData.get("notes"));
  submitForm.append("visibility", formData.get("visibility"));

  // adding exercise instances
  const exerciseInstances = [];
  const exerciseInstancesTypes = formData.getAll("type");
  const exerciseInstancesSets = formData.getAll("sets");
  const exerciseInstancesNumbers = formData.getAll("number");
  for (let i = 0; i < exerciseInstancesTypes.length; i++) {
    exerciseInstances.push({
      exercise: `${HOST}/api/exercises/${exerciseInstancesTypes[i]}/`,
      number: exerciseInstancesNumbers[i],
      sets: exerciseInstancesSets[i],
    });
  }

  submitForm.append("exercise_instances", JSON.stringify(exerciseInstances));
  // adding files
  for (const file of formData.getAll("files")) {
    submitForm.append("files", file);
  }
  return submitForm;
}

async function createWorkout() {
  const submitForm = generateWorkoutForm();

  const response = await sendRequest("POST", `${HOST}/api/workouts/`, submitForm, "");

  if (response.ok) {
    window.location.replace("workouts.html");
  } else {
    const data = await response.json();
    const alert = createAlert("Could not create new workout!", data);
    document.body.prepend(alert);
  }
}

function handleCancelDuringWorkoutCreate() {
  window.location.replace("workouts.html");
}

async function createBlankExercise() {
  const exerciseTypeResponse = await sendRequest("GET", `${HOST}/api/exercises/`);
  const exerciseTypes = await exerciseTypeResponse.json();

  const exerciseTemplate = document.querySelector("#template-exercise");
  const divExerciseContainer = exerciseTemplate.content.firstElementChild.cloneNode(true);
  const exerciseTypeSelect = divExerciseContainer.querySelector("select");

  for (const result of exerciseTypes.results) {
    const option = document.createElement("option");
    option.value = result.id;
    option.innerText = result.name;
    exerciseTypeSelect.append(option);
  }

  if (exerciseTypes.results.length > 0) {
    const currentExerciseType = exerciseTypes.results[0];
    exerciseTypeSelect.value = currentExerciseType.name;
  }

  const divExercises = document.querySelector("#div-exercises");
  divExercises.appendChild(divExerciseContainer);
}

function removeExercise() {
  const divExerciseContainers = document.querySelectorAll(".div-exercise-container");
  if (divExerciseContainers && divExerciseContainers.length > 0) {
    divExerciseContainers[divExerciseContainers.length - 1].remove();
  }
}

function addComment(author, text, date, append) {
  /* Taken from https://www.bootdey.com/snippets/view/Simple-Comment-panel#css*/
  const commentList = document.querySelector("#comment-list");
  const listElement = document.createElement("li");
  listElement.className = "media";
  const commentBody = document.createElement("div");
  commentBody.className = "media-body";
  const dateSpan = document.createElement("span");
  dateSpan.className = "text-muted pull-right me-1";
  const smallText = document.createElement("small");
  smallText.className = "text-muted";

  if (date != "Now") {
    const localDate = new Date(date);
    smallText.innerText = localDate.toLocaleString();
  } else {
    smallText.innerText = date;
  }

  dateSpan.appendChild(smallText);
  commentBody.appendChild(dateSpan);

  const strong = document.createElement("strong");
  strong.className = "text-success";
  strong.innerText = author;
  commentBody.appendChild(strong);
  const p = document.createElement("p");
  p.innerHTML = text;

  commentBody.appendChild(strong);
  commentBody.appendChild(p);
  listElement.appendChild(commentBody);

  if (append) {
    commentList.append(listElement);
  } else {
    commentList.prepend(listElement);
  }
}

async function createComment(workoutid) {
  const commentArea = document.querySelector("#comment-area");
  const content = commentArea.value;
  const body = { workout: `${HOST}/api/workouts/${workoutid}/`, content: content };

  const response = await sendRequest("POST", `${HOST}/api/comments/`, body);
  if (response.ok) {
    addComment(sessionStorage.getItem("username"), content, "Now", false);
  } else {
    const data = await response.json();
    const alert = createAlert("Failed to create comment!", data);
    document.body.prepend(alert);
  }
}

async function retrieveComments(workoutid) {
  const response = await sendRequest("GET", `${HOST}/api/comments/`);
  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert("Could not retrieve comments!", data);
    document.body.prepend(alert);
  } else {
    const data = await response.json();
    const comments = data.results;
    for (const comment of comments) {
      const splitArray = comment.workout.split("/");
      if (splitArray[splitArray.length - 2] == workoutid) {
        addComment(comment.owner, comment.content, comment.timestamp, true);
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  cancelWorkoutButton = document.querySelector("#btn-cancel-workout");
  okWorkoutButton = document.querySelector("#btn-ok-workout");
  deleteWorkoutButton = document.querySelector("#btn-delete-workout");
  editWorkoutButton = document.querySelector("#btn-edit-workout");
  galleryButton = document.querySelector("#btn-gallery-workout");
  const postCommentButton = document.querySelector("#post-comment");
  const divCommentRow = document.querySelector("#div-comment-row");
  const buttonAddExercise = document.querySelector("#btn-add-exercise");
  const buttonRemoveExercise = document.querySelector("#btn-remove-exercise");

  buttonAddExercise.addEventListener("click", createBlankExercise);
  buttonRemoveExercise.addEventListener("click", removeExercise);

  galleryButton.addEventListener("click", handleGalleryButtonClick);

  const urlParams = new URLSearchParams(window.location.search);
  const currentUser = await getCurrentUser();

  if (urlParams.has("id")) {
    const id = urlParams.get("id");
    const workoutData = await retrieveWorkout(id);
    await retrieveComments(id);

    if (workoutData["owner"] == currentUser.url) {
      editWorkoutButton.classList.remove("hide");
      editWorkoutButton.addEventListener("click", handleEditWorkoutButtonClick);
      deleteWorkoutButton.addEventListener(
        "click",
        (async (id) => await deleteWorkout(id)).bind(undefined, id)
      );
      okWorkoutButton.addEventListener(
        "click",
        (async (id) => await updateWorkout(id)).bind(undefined, id)
      );
      postCommentButton.addEventListener(
        "click",
        (async (id) => await createComment(id)).bind(undefined, id)
      );
      divCommentRow.className = divCommentRow.className.replace(" hide", "");
    }
  } else {
    await createBlankExercise();
    const ownerInput = document.querySelector("#inputOwner");
    ownerInput.value = currentUser.username;
    setReadOnly(false, "#form-workout");
    ownerInput.readOnly = !ownerInput.readOnly;

    okWorkoutButton.className = okWorkoutButton.className.replace(" hide", "");
    cancelWorkoutButton.className = cancelWorkoutButton.className.replace(" hide", "");
    buttonAddExercise.className = buttonAddExercise.className.replace(" hide", "");
    buttonRemoveExercise.className = buttonRemoveExercise.className.replace(" hide", "");
    galleryButton.className += " hide";

    okWorkoutButton.addEventListener("click", async () => await createWorkout());
    cancelWorkoutButton.addEventListener("click", handleCancelDuringWorkoutCreate);
    divCommentRow.className += " hide";
  }
});
