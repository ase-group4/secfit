let goBackButton;
let submitNewFileButton;

async function retrieveWorkoutImages(id) {
  let workoutData = null;
  let response = await sendRequest("GET", `${HOST}/api/workouts/${id}/`);

  if (!response.ok) {
    let data = await response.json();
    let alert = createAlert("Could not retrieve workout data!", data);
    document.body.prepend(alert);
  } else {
    workoutData = await response.json();

    document.getElementById("workout-title").innerHTML = "Workout name: " + workoutData["name"];
    document.getElementById("workout-owner").innerHTML = "Owner: " + workoutData["owner_username"];

    let hasNoImages = workoutData.files.length == 0;
    let noImageText = document.querySelector("#no-images-text");

    if (hasNoImages) {
      noImageText.classList.remove("hide");
      return;
    }

    noImageText.classList.add("hide");

    let filesDiv = document.getElementById("img-collection");
    let filesDeleteDiv = document.getElementById("img-collection-delete");

    const currentImageFileElement = document.querySelector("#current");
    let isFirstImg = true;

    let fileCounter = 0;

    for (let file of workoutData.files) {
      let a = document.createElement("a");
      a.href = file.file;
      let pathArray = file.file.split("/");
      a.text = pathArray[pathArray.length - 1];
      a.className = "me-2";

      let isImage = ["jpg", "png", "gif", "jpeg", "JPG", "PNG", "GIF", "JPEG"].includes(
        a.text.split(".")[1]
      );

      if (isImage) {
        let deleteImgButton = document.createElement("input");
        deleteImgButton.type = "button";
        deleteImgButton.className = "btn btn-close";
        deleteImgButton.id = file.url.split("/")[file.url.split("/").length - 2];
        deleteImgButton.addEventListener("click", () =>
          handleDeleteImgClick(
            deleteImgButton.id,
            "DELETE",
            `Could not delete workout ${deleteImgButton.id}!`,
            HOST,
            ["jpg", "png", "gif", "jpeg", "JPG", "PNG", "GIF", "JPEG"]
          )
        );
        filesDeleteDiv.appendChild(deleteImgButton);

        let img = document.createElement("img");
        img.src = file.file;

        filesDiv.appendChild(img);
        deleteImgButton.style.left = `${(fileCounter % 4) * 191}px`;
        deleteImgButton.style.top = `${Math.floor(fileCounter / 4) * 105}px`;

        if (isFirstImg) {
          currentImageFileElement.src = file.file;
          isFirstImg = false;
        }
        fileCounter++;
      }
    }

    const otherImageFileElements = document.querySelectorAll(".imgs img");
    const selectedOpacity = 0.6;
    otherImageFileElements[0].style.opacity = selectedOpacity;

    otherImageFileElements.forEach((imageFileElement) =>
      imageFileElement.addEventListener("click", (event) => {
        //Changes the main image
        currentImageFileElement.src = event.target.src;

        //Adds the fade animation
        currentImageFileElement.classList.add("fade-in");
        setTimeout(() => currentImageFileElement.classList.remove("fade-in"), 500);

        //Sets the opacity of the selected image to 0.4
        otherImageFileElements.forEach((imageFileElement) => (imageFileElement.style.opacity = 1));
        event.target.style.opacity = selectedOpacity;
      })
    );
  }
  return workoutData;
}

async function validateImgFileType(id, host_variable, acceptedFileTypes) {
  let file = await sendRequest("GET", `${host_variable}/api/workout-files/${id}/`);
  let fileData = await file.json();
  let fileType = fileData.file.split("/")[fileData.file.split("/").length - 1].split(".")[1];

  return acceptedFileTypes.includes(fileType);
}

async function handleDeleteImgClick(
  id,
  http_keyword,
  fail_alert_text,
  host_variable,
  acceptedFileTypes
) {
  if (validateImgFileType(id, host_variable, acceptedFileTypes)) {
    return;
  }

  let response = await sendRequest(http_keyword, `${host_variable}/api/workout-files/${id}/`);

  if (!response.ok) {
    let data = await response.json();
    let alert = createAlert(fail_alert_text, data);
    document.body.prepend(alert);
  } else {
    location.reload();
  }
}

function getCookieValue(name) {
  let cookieValue = null;
  let cookieByName = document.cookie.split("; ").find((row) => row.startsWith(name));

  if (cookieByName) {
    cookieValue = cookieByName.split("=")[1];
  }

  return cookieValue;
}

async function sendRequest(method, url, body, contentType = "application/json; charset=UTF-8") {
  if (body && contentType.includes("json")) {
    body = JSON.stringify(body);
  }

  let myHeaders = new Headers();

  if (contentType) myHeaders.set("Content-Type", contentType);
  if (getCookieValue("access"))
    myHeaders.set("Authorization", "Bearer " + getCookieValue("access"));
  let myInit = { headers: myHeaders, method: method, body: body };
  let myRequest = new Request(url, myInit);

  let response = await fetch(myRequest);
  if (response.status == 401 && getCookieValue("refresh")) {
    // access token not accepted. getting refresh token
    myHeaders = new Headers({ "Content-Type": "application/json; charset=UTF-8" });
    let tokenBody = JSON.stringify({ refresh: getCookieValue("refresh") });
    myInit = { headers: myHeaders, method: "POST", body: tokenBody };
    myRequest = new Request(`${HOST}/api/token/refresh/`, myInit);
    response = await fetch(myRequest);

    if (response.ok) {
      // refresh successful, received new access token
      let data = await response.json();
      setCookie("access", data.access, 86400, "/");

      let myHeaders = new Headers({
        Authorization: "Bearer " + getCookieValue("access"),
        "Content-Type": contentType,
      });
      let myInit = { headers: myHeaders, method: method, body: body };
      let myRequest = new Request(url, myInit);
      response = await fetch(myRequest);

      if (!response.ok) window.location.replace("logout.html");
    }
  }

  return response;
}

function createAlert(header, data) {
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
