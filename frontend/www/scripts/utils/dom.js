/**
 * Takes a list of data objects that must each have an `id`,
 * finds a dropdown on the page of the given name,
 * and appends an `option` to the dropdown for each data object, `value=id`.
 * @param {Object[]} dataList List of data to create dropdown options from.
 * @param {string} dropdownName `name` field of the `select` element of the dropdown.
 * @param {string} dataTextField Key in data objects to use for the display text of dropdown options.
 */
export function populateDropdown(dataList, dropdownName, dataTextField) {
  const dropdown = document.querySelector(`select[name="${dropdownName}"]`);

  for (const data of dataList) {
    const option = document.createElement("option");
    option.value = data.id;
    option.innerText = data[dataTextField];
    dropdown.appendChild(option);
  }
}

/**
 * Updates all value fields on the given form with data from the given formData.
 * @param {HTMLFormElement} form The form element to populate.
 * @param {FormData} formData The form data to populate the form with.
 */
export function populateForm(form, formData) {
  for (const key of formData.keys()) {
    const formField = form.elements[key];
    if (formField) {
      formField.value = formData.get(key);
    }
  }
}

/**
 * Finds the form matching the given selector, and returns the answers to the form in object form.
 * @param {string} formSelector The selector to use to find the form.
 * @returns {Data | undefined} Object with the form's field names mapped to their values.
 * @template {Object} Data Type parameter for the extracted data.
 */
export function getFormAnswers(formSelector) {
  /** @type {HTMLFormElement} */
  const form = document.querySelector(formSelector);
  if (!form) {
    return undefined;
  }

  const formData = new FormData(form);
  const data = {};
  for (const key of formData.keys()) {
    data[key] = formData.get(key);
  }
  return data;
}

export function createAlert(header, data) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-warning alert-dismissible fade show";
  alertDiv.setAttribute("role", "alert");

  const strong = document.createElement("strong");
  strong.innerText = header;
  alertDiv.appendChild(strong);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn-close";
  button.setAttribute("data-bs-dismiss", "alert");
  button.setAttribute("aria-label", "Close");
  alertDiv.appendChild(button);

  const ul = document.createElement("ul");
  if ("detail" in data) {
    const li = document.createElement("li");
    li.innerText = data["detail"];
    ul.appendChild(li);
  } else {
    for (const key in data) {
      const li = document.createElement("li");
      li.innerText = key;

      const innerUl = document.createElement("ul");
      for (const message of data[key]) {
        const innerLi = document.createElement("li");
        innerLi.innerText = message;
        innerUl.appendChild(innerLi);
      }
      li.appendChild(innerUl);
      ul.appendChild(li);
    }
  }
  alertDiv.appendChild(ul);

  return alertDiv;
}

export function displayAlert(header, data) {
  const alert = createAlert(header, data);
  document.body.prepend(alert);
}

export function setReadOnly(readOnly, selector) {
  const form = document.querySelector(selector);
  const formData = new FormData(form);

  for (const key of formData.keys()) {
    let selector = `input[name="${key}"], textarea[name="${key}"]`;
    for (const input of form.querySelectorAll(selector)) {
      if (!readOnly && input.hasAttribute("readonly")) {
        input.readOnly = false;
      } else if (readOnly && !input.hasAttribute("readonly")) {
        input.readOnly = true;
      }
    }

    selector = `input[type="file"], select[name="${key}"]`;
    for (const input of form.querySelectorAll(selector)) {
      if (!readOnly && input.hasAttribute("disabled")) {
        input.disabled = false;
      } else if (readOnly && !input.hasAttribute("disabled")) {
        input.disabled = true;
      }
    }
  }

  for (const input of document.querySelectorAll("input:disabled, select:disabled")) {
    if (
      (!readOnly && input.hasAttribute("disabled")) ||
      (readOnly && !input.hasAttribute("disabled"))
    ) {
      input.disabled = !input.disabled;
    }
  }
}
