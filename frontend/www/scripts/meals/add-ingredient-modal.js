/**
 * Provides a custom component called `add-ingredient-modal`
 * that renders a Bootstrap Modal for adding new ingredients to SecFit.
 *
 * Visibility is toggled by adding the following attributes to a button on the same page:
 * - `data-bs-toggle="modal"`
 * - `data-bs-target="#add-ingredient-modal"`
 *
 * The Submit button has id `ingredient-submit-button`,
 * which can be used to add additional event listeners.
 */
class AddIngredientModal extends HTMLElement {
  constructor() {
    super();
  }

  /**
   * Called when the modal enters the DOM.
   * Defines the HTML structure of the component, and adds initial listeners.
   */
  connectedCallback() {
    this.innerHTML = `
        <div class="modal fade" id="add-ingredient-modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create new ingredient</h5>
                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        />
                    </div>

                    <div class="modal-body">
                        <form id="ingredient-form">
                            <label for="ingredient-name-input">Name</label>
                            <input
                                type="text"
                                class="form-control"
                                id="ingredient-name-input"
                                name="name"
                            />

                            <p class="mt-3"><strong>Nutritional values (per 100g of the ingredient)</strong></p>

                            <label for="ingredient-protein-input">Protein</label>
                            <div class="input-group mb-3">
                                <input
                                    type="number"
                                    class="form-control ingredient-nutrition-input"
                                    id="ingredient-protein-input"
                                    name="protein"
                                />
                                <span class="input-group-text">grams</span>
                            </div>

                            <label for="ingredient-fat-input">Fat</label>
                            <div class="input-group mb-3">
                                <input
                                    type="number"
                                    class="form-control ingredient-nutrition-input"
                                    id="ingredient-fat-input"
                                    name="fat"
                                />
                                <span class="input-group-text">grams</span>
                            </div>

                            <label for="ingredient-carbohydrates-input">Carbohydrates</label>
                            <div class="input-group mb-3">
                                <input
                                    type="number"
                                    class="form-control ingredient-nutrition-input"
                                    id="ingredient-carbohydrates-input"
                                    name="carbohydrates"
                                />
                                <span class="input-group-text">grams</span>
                            </div>
                        </form>

                        <label for="ingredient-calories-input">Calories (calculated)</label>
                        <div class="input-group mb-3">
                            <input disabled type="number" class="form-control" id="ingredient-calories-field" />
                            <span class="input-group-text">kcal</span>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-primary"
                            id="ingredient-submit-button"
                            data-bs-dismiss="modal"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

    // Delegates handling of submit button being pressed to `handleAddIngredient`.
    const submitButton = this.querySelector("#ingredient-submit-button");
    submitButton.addEventListener("click", this.handleAddIngredient.bind(this));

    // Listens for changes in provided inputs and forwards them to `calculateCalories`.
    const nutritionInputs = this.querySelectorAll(".ingredient-nutrition-input");
    for (const input of nutritionInputs) {
      input.addEventListener("change", this.calculateCalories.bind(this));
    }
  }

  /**
   * Reads the inputs provided in the ingredient form
   * and returns them as an object with the following properties:
   * - `name` (string)
   * - `protein` (number)
   * - `fat` (number)
   * - `carbohydrates` (number)
   */
  getFormData() {
    const form = this.querySelector("#ingredient-form");
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
    };

    for (const nutritionalValue of ["protein", "fat", "carbohydrates"]) {
      const dataField = formData.get(nutritionalValue);
      const parsedField = parseFloat(dataField);

      if (Number.isNaN(parsedField)) {
        data[nutritionalValue] = 0;
      } else {
        data[nutritionalValue] = parsedField;
      }
    }

    return data;
  }

  /** Reads the inputs of the form and sends a POST request to the backend to create the ingredient. */
  async handleAddIngredient() {
    const requestBody = this.getFormData();
    const response = await sendRequest("POST", `${HOST}/api/ingredients/`, requestBody);
    const data = await response.json();

    if (!response.ok) {
      const alert = createAlert("Could not create new exercise!", data);
      document.body.prepend(alert);
    }

    this.dispatchEvent(
      new CustomEvent("ingredientCreated", {
        detail: data,
      })
    );
  }

  /**
   * Reads the nutritional values in the form, and calculates the amount of calories from them.
   * Updates the calorie field accordingly.
   */
  calculateCalories() {
    const { protein, fat, carbohydrates } = this.getFormData();
    const calories = protein * 4 + fat * 9 + carbohydrates * 4;

    const calorieField = this.querySelector("#ingredient-calories-field");
    calorieField.value = calories;
  }
}

// Registers the custom component.
customElements.define("add-ingredient-modal", AddIngredientModal);