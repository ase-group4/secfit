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

    selector = `input[type="file"], select[name="${key}`;
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
