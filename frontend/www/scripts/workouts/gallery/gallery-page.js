import { displayAlert } from "../../utils/dom.js";
import { getWorkoutFileType } from "../utils.js";
import { deleteWorkoutFile, fetchWorkout } from "../requests.js";

// JSDoc type imports.
/** @typedef {import("../types.js").Workout} Workout */
/** @typedef {import("../types.js").WorkoutFile} WorkoutFile */

/** The accepted file types that should be displayed as images in the gallery. */
const IMAGE_FILE_TYPES = ["jpg", "png", "gif", "jpeg", "JPG", "PNG", "GIF", "JPEG"];

// Entry point of the script on the gallery page.
window.addEventListener("DOMContentLoaded", async () => {
  // Gets the 'id' URL parameter, and stops the script if it is not present.
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has("id")) {
    displayAlert("Missing URL parameter", { detail: "'id' parameter required" });
    return;
  }
  const workoutId = urlParams.get("id");

  const goBackButton = document.querySelector("#btn-back-workout");
  goBackButton.addEventListener("click", () =>
    window.location.replace(`workout.html?id=${workoutId}`)
  );

  const { ok, data: workout } = await fetchWorkout(workoutId);
  if (!ok) return;

  displayWorkoutDetails(workout);
  displayWorkoutImages(workout.files);
});

/**
 * Displays the title and owner of the workout on the gallery page.
 * @param {Workout} workout
 */
function displayWorkoutDetails(workout) {
  document.getElementById("workout-title").innerHTML = "Workout name: " + workout["name"];
  document.getElementById("workout-owner").innerHTML = "Owner: " + workout["owner_username"];
}

/**
 * Displays images submitted as part of the workout.
 * @param {WorkoutFile[]} workoutFiles
 */
function displayWorkoutImages(workoutFiles) {
  // Filters the given files for accepted image file types.
  const imageFiles = workoutFiles?.filter((file) =>
    IMAGE_FILE_TYPES.includes(getWorkoutFileType(file))
  );

  // Returns early if the workout has no image files.
  if (!imageFiles || imageFiles.length === 0) {
    const noImageText = document.querySelector("#no-images-text");
    noImageText.classList.remove("hide");
    return;
  }

  /**
   * Stores the images added to the bottom navigation bar of the gallery.
   * @type {HTMLImageElement[]}
   */
  const navigationBarImages = [];

  const currentImage = document.querySelector("#current");
  const selectedOpacity = 0.6; // Opacity of the currently selected image in the gallery navigation bar.
  let isFirstImage = true;

  for (const [index, file] of imageFiles.entries()) {
    // Adds the image in the bottom gallery navigation row.
    const image = document.createElement("img");
    image.src = file.file;
    navigationBarImages.push(image);
    const filesDiv = document.getElementById("img-collection");
    filesDiv.appendChild(image);

    // Adds a delete button to the image.
    const deleteImageButton = createDeleteImageButton(file, index);
    const filesDeleteDiv = document.getElementById("img-collection-delete");
    filesDeleteDiv.appendChild(deleteImageButton);

    // Sets the first image file as the current image.
    if (isFirstImage) {
      currentImage.src = file.file;
      image.style.opacity = selectedOpacity;
      isFirstImage = false;
    }
  }

  addNavigationBarImageListeners(navigationBarImages, currentImage, selectedOpacity);
}

/**
 * Adds a listener to each of the given `navigationBarImages`,
 * that changes the `currentImage` to that image on click,
 * and sets that image's opacity in the gallery navigation to `selectedOpacity`.
 * @param {HTMLImageElement[]} navigationBarImages
 * @param {HTMLImageElement} currentImage
 * @param {number} selectedOpacity
 */
function addNavigationBarImageListeners(navigationBarImages, currentImage, selectedOpacity) {
  for (const image of navigationBarImages) {
    image.addEventListener("click", () => {
      if (image.src === currentImage.src) return;

      // Changes the main image.
      currentImage.src = image.src;

      // Adds the fade animation.
      currentImage.classList.add("fade-in");
      setTimeout(() => currentImage.classList.remove("fade-in"), 500);

      // Sets correct opacities for images in the gallery navigation bar.
      image.style.opacity = selectedOpacity;
      const otherImages = navigationBarImages.filter((otherImage) => image !== otherImage);
      for (const otherImage of otherImages) {
        otherImage.style.opacity = 1;
      }
    });
  }
}

/**
 * Returns an HTML button deletes the given workout file on click.
 * @param {WorkoutFile} file The workout file to delete on click.
 * @param {number} galleryIndex The index of this file in the gallery navigation, for button layout.
 * @returns {HTMLInputElement} The created button.
 */
function createDeleteImageButton(file, galleryIndex) {
  const deleteImageButton = document.createElement("input");
  deleteImageButton.type = "button";
  deleteImageButton.className = "btn btn-close";
  deleteImageButton.style.left = `${(galleryIndex % 4) * 191}px`;
  deleteImageButton.style.top = `${Math.floor(galleryIndex / 4) * 105}px`;
  deleteImageButton.addEventListener("click", () => handleDeleteImgClick(file.id));
  return deleteImageButton;
}

/**
 * Deletes the workout file with the given ID, then reloads the page.
 * @param {number} id ID of the workout image to delete.
 */
async function handleDeleteImgClick(id) {
  const { ok } = deleteWorkoutFile(id);

  if (ok) {
    location.reload();
  }
}
