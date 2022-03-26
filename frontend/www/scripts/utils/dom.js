export function createAlert(header, data) {
  let alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-warning alert-dismissible fade show";
  alertDiv.setAttribute("role", "alert");

  let strong = document.createElement("strong");
  strong.innerText = header;
  alertDiv.appendChild(strong);

  let button = document.createElement("button");
  button.type = "button";
  button.className = "btn-close";
  button.setAttribute("data-bs-dismiss", "alert");
  button.setAttribute("aria-label", "Close");
  alertDiv.appendChild(button);

  let ul = document.createElement("ul");
  if ("detail" in data) {
    let li = document.createElement("li");
    li.innerText = data["detail"];
    ul.appendChild(li);
  } else {
    for (let key in data) {
      let li = document.createElement("li");
      li.innerText = key;

      let innerUl = document.createElement("ul");
      for (let message of data[key]) {
        let innerLi = document.createElement("li");
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

export function setReadOnly(readOnly, selector) {
  let form = document.querySelector(selector);
  let formData = new FormData(form);

  for (let key of formData.keys()) {
    let selector = `input[name="${key}"], textarea[name="${key}"]`;
    for (let input of form.querySelectorAll(selector)) {
      if (!readOnly && input.hasAttribute("readonly")) {
        input.readOnly = false;
      } else if (readOnly && !input.hasAttribute("readonly")) {
        input.readOnly = true;
      }
    }

    selector = `input[type="file"], select[name="${key}`;
    for (let input of form.querySelectorAll(selector)) {
      if (!readOnly && input.hasAttribute("disabled")) {
        input.disabled = false;
      } else if (readOnly && !input.hasAttribute("disabled")) {
        input.disabled = true;
      }
    }
  }

  for (let input of document.querySelectorAll("input:disabled, select:disabled")) {
    if (
      (!readOnly && input.hasAttribute("disabled")) ||
      (readOnly && !input.hasAttribute("disabled"))
    ) {
      input.disabled = !input.disabled;
    }
  }
}
