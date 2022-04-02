import { sendRequest } from "../utils/api.js";
import { HOST } from "../utils/host.js";
import { createAlert } from "../utils/dom.js";

export async function getCategories() {
  const response = await sendRequest("GET", `${HOST}/api/exercise-categories/`);

  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert("Could not retrieve category data!", data);
    document.body.prepend(alert);
    return;
  } else {
    const categoriesData = await response.json();
    console.log(categoriesData);
    const categoryDrop = document.querySelector('select[name="category"]');

    let output = "";
    categoriesData["results"].forEach((category) => {
      output += `<option value=${category.id}>${category.name}</option>`;
    });
    categoryDrop.innerHTML = output;
    return categoriesData["results"];
  }
}
