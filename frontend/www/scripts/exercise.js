import { setReadOnly, createAlert } from "./utils/dom.js";
import { sendRequest } from "./utils/api.js";
import { HOST } from "./utils/host.js";

let cancelButton;
let okButton;
let deleteButton;
let editButton;
let oldFormData;

let unusedVariable;

class MuscleGroup {
  constructor(type) {
    this.isValidType = false;
    this.validTypes = ["Legs", "Chest", "Back", "Arms", "Abdomen", "Shoulders"];

    this.type = this.validTypes.includes(type) ? type : undefined;
  }

  setMuscleGroupType(newType) {
    this.isValidType = false;

    if (this.validTypes.includes(newType)) {
      this.isValidType = true;
      this.type = newType;
    } else {
      alert("Invalid muscle group!");
    }
  }

  getMuscleGroupType() {
    console.log(this.type, "SWIOEFIWEUFH");
    return this.type;
  }
}

function handleCancelButtonDuringEdit() {
  setReadOnly(true, "#form-exercise");
  document.querySelector("select").setAttribute("disabled", "");
  okButton.className += " hide";
  deleteButton.className += " hide";
  cancelButton.className += " hide";
  editButton.className = editButton.className.replace(" hide", "");

  cancelButton.removeEventListener("click", handleCancelButtonDuringEdit);

  const form = document.querySelector("#form-exercise");
  if (oldFormData.has("name")) form.name.value = oldFormData.get("name");
  if (oldFormData.has("description")) form.description.value = oldFormData.get("description");
  if (oldFormData.has("duration")) form.duration.value = oldFormData.get("duration");
  if (oldFormData.has("calories")) form.calories.value = oldFormData.get("calories");
  if (oldFormData.has("muscleGroup")) form.muscleGroup.value = oldFormData.get("muscleGroup");
  if (oldFormData.has("unit")) form.unit.value = oldFormData.get("unit");
  if (oldFormData.has("category")) form.category.value = oldFormData.get("category");

  oldFormData.delete("name");
  oldFormData.delete("description");
  oldFormData.delete("duration");
  oldFormData.delete("calories");
  oldFormData.delete("muscleGroup");
  oldFormData.delete("unit");
  oldFormData.delete("category");
}

function handleCancelButtonDuringCreate() {
  window.location.replace("exercises.html");
}

async function createExercise() {
  document.querySelector("select").removeAttribute("disabled");
  const form = document.querySelector("#form-exercise");
  const formData = new FormData(form);
  const body = {
    name: formData.get("name"),
    description: formData.get("description"),
    duration: formData.get("duration"),
    calories: formData.get("calories"),
    muscleGroup: formData.get("muscleGroup"),
    category: formData.get("category"),
    unit: formData.get("unit"),
  };

  const response = await sendRequest("POST", `${HOST}/api/exercises/`, body);

  if (response.ok) {
    window.location.replace("exercises.html");
  } else {
    const data = await response.json();
    const alert = createAlert("Could not create new exercise!", data);
    document.body.prepend(alert);
  }
}

function handleEditExerciseButtonClick() {
  setReadOnly(false, "#form-exercise");

  document.querySelector("select").removeAttribute("disabled");

  editButton.className += " hide";
  okButton.className = okButton.className.replace(" hide", "");
  cancelButton.className = cancelButton.className.replace(" hide", "");
  deleteButton.className = deleteButton.className.replace(" hide", "");

  cancelButton.addEventListener("click", handleCancelButtonDuringEdit);

  const form = document.querySelector("#form-exercise");
  oldFormData = new FormData(form);
}

async function deleteExercise(id) {
  const response = await sendRequest("DELETE", `${HOST}/api/exercises/${id}/`);
  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert(`Could not delete exercise ${id}`, data);
    document.body.prepend(alert);
  } else {
    window.location.replace("exercises.html");
  }
}

async function retrieveExercise(id) {
  const response = await sendRequest("GET", `${HOST}/api/exercises/${id}/`);

  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert("Could not retrieve exercise data!", data);
    document.body.prepend(alert);
  } else {
    document.querySelector('select[name="muscleGroup"]').removeAttribute("disabled");
    const exerciseData = await response.json();
    const form = document.querySelector("#form-exercise");
    const formData = new FormData(form);

    const categorySelector = document.querySelector('select[name="category"]');
    categorySelector.value = exerciseData["category"];

    for (const key of formData.keys()) {
      let selector;
      key !== "muscleGroup"
        ? (selector = `input[name="${key}"], textarea[name="${key}"]`)
        : (selector = `select[name=${key}]`);
      const input = form.querySelector(selector);
      const newVal = exerciseData[key];
      input.value = newVal;
    }
    document.querySelector('select[name="muscleGroup"]').setAttribute("disabled", "");
  }
}

async function updateExercise(id) {
  const form = document.querySelector("#form-exercise");
  const formData = new FormData(form);

  const muscleGroupSelector = document.querySelector('select[name="muscleGroup"]');
  muscleGroupSelector.removeAttribute("disabled");

  const selectedMuscleGroup = new MuscleGroup(formData.get("muscleGroup"));

  const body = {
    name: formData.get("name"),
    description: formData.get("description"),
    duration: formData.get("duration"),
    calories: formData.get("calories"),
    category: formData.get("category"),
    muscleGroup: selectedMuscleGroup.getMuscleGroupType(),
    unit: formData.get("unit"),
  };
  const response = await sendRequest("PUT", `${HOST}/api/exercises/${id}/`, body);

  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert(`Could not update exercise ${id}`, data);
    document.body.prepend(alert);
  } else {
    muscleGroupSelector.setAttribute("disabled", "");
    // duplicate code from handleCancelButtonDuringEdit
    // you should refactor this
    setReadOnly(true, "#form-exercise");
    okButton.className += " hide";
    deleteButton.className += " hide";
    cancelButton.className += " hide";
    editButton.className = editButton.className.replace(" hide", "");

    cancelButton.removeEventListener("click", handleCancelButtonDuringEdit);

    oldFormData.delete("name");
    oldFormData.delete("description");
    oldFormData.delete("duration");
    oldFormData.delete("calories");
    oldFormData.delete("muscleGroup");
    oldFormData.delete("unit");
    oldFormData.delete("category");
  }
}

async function getCategories() {
  const response = await sendRequest("GET", `${HOST}/api/exercise-categories/`);

  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert("Could not retrieve category data!", data);
    document.body.prepend(alert);
    return;
  } else {
    const categoriesData = await response.json();
    const categoryDrop = document.querySelector('select[name="category"]');

    let output = "";
    categoriesData["results"].forEach((category) => {
      output += `<option value=${category.id}>${category.name}</option>`;
    });
    categoryDrop.innerHTML = output;
    return categoriesData["results"];
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  cancelButton = document.querySelector("#btn-cancel-exercise");
  okButton = document.querySelector("#btn-ok-exercise");
  deleteButton = document.querySelector("#btn-delete-exercise");
  editButton = document.querySelector("#btn-edit-exercise");
  oldFormData = null;

  const urlParams = new URLSearchParams(window.location.search);

  const categories = await getCategories();

  // view/edit
  if (urlParams.has("id")) {
    const exerciseId = urlParams.get("id");
    await retrieveExercise(exerciseId, categories);

    editButton.addEventListener("click", handleEditExerciseButtonClick);
    deleteButton.addEventListener(
      "click",
      (async (id) => await deleteExercise(id)).bind(undefined, exerciseId)
    );
    okButton.addEventListener(
      "click",
      (async (id) => await updateExercise(id)).bind(undefined, exerciseId)
    );
  }
  //create
  else {
    setReadOnly(false, "#form-exercise");

    editButton.className += " hide";
    okButton.className = okButton.className.replace(" hide", "");
    cancelButton.className = cancelButton.className.replace(" hide", "");

    okButton.addEventListener("click", async () => await createExercise());
    cancelButton.addEventListener("click", handleCancelButtonDuringCreate);
  }
});
