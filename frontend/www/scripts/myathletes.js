import { sendRequest, getCurrentUser } from "./utils/requests.js";
import { HOST } from "./utils/host.js";
import { createAlert } from "./utils/dom.js";

async function displayCurrentRoster() {
  const templateFilledAthlete = document.querySelector("#template-filled-athlete");
  const templateEmptyAthlete = document.querySelector("#template-empty-athlete");
  const controls = document.querySelector("#controls");

  const currentUser = await getCurrentUser();
  const athletesIds = new Set();
  for (const athleteUrl of currentUser.athletes) {
    const response = await sendRequest("GET", athleteUrl);
    const athlete = await response.json();
    athletesIds.add(athlete.id);
    createFilledRow(templateFilledAthlete, athlete.username, controls, false);
  }

  const status = "p"; // pending
  const category = "sent";
  const response = await sendRequest(
    "GET",
    `${HOST}/api/offers/?status=${status}&category=${category}`
  );
  if (!response.ok) {
    const data = await response.json();
    const alert = createAlert("Could not retrieve offers!", data);
    document.body.prepend(alert);
  } else {
    const offers = await response.json();

    for (const offer of offers.results) {
      const response = await sendRequest("GET", offer.recipient);
      const recipient = await response.json();
      athletesIds.add(recipient.id);
      createFilledRow(templateFilledAthlete, `${recipient.username} (pending)`, controls, true);
    }
  }

  const usersHTML = await fetchUsers(currentUser, athletesIds);

  const emptyClone = templateEmptyAthlete.content.cloneNode(true);
  const emptyDiv = emptyClone.querySelector("div");
  const emptyButton = emptyDiv.querySelector("button");
  const userlist = emptyDiv.querySelector("datalist");
  userlist.innerHTML = usersHTML;
  emptyButton.addEventListener("click", addAthleteRow);
  controls.appendChild(emptyDiv);
}

function createFilledRow(templateFilledAthlete, inputValue, controls, disabled) {
  const filledClone = templateFilledAthlete.content.cloneNode(true);
  const filledDiv = filledClone.querySelector("div");
  const filledInput = filledDiv.querySelector("input");
  const filledButton = filledDiv.querySelector("button");
  filledInput.value = inputValue;
  filledInput.disabled = disabled;
  if (!disabled) {
    filledButton.addEventListener("click", removeAthleteRow);
  } else {
    filledButton.disabled = true;
  }
  controls.appendChild(filledDiv);
}

async function fetchUsers(currentUser, athletesIds) {
  const response = await sendRequest("GET", `${HOST}/api/users/`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    const data = await response.json();

    const users = data.results;
    let innerHTML = "";
    for (let j = 0; j < users.length; j++) {
      const user = users[j];
      if (user.id != currentUser.id && !athletesIds.has(user.id)) {
        innerHTML += `<option value=${user.username}> </option>`;
      }
    }
    return innerHTML;
  }
}

async function displayFiles() {
  const user = await getCurrentUser();

  const templateAthlete = document.querySelector("#template-athlete-tab");
  const templateFiles = document.querySelector("#template-files");
  const templateFile = document.querySelector("#template-file");
  const listTab = document.querySelector("#list-tab");
  const navTabContent = document.querySelector("#nav-tabContent");

  for (const fileUrl of user.athlete_files) {
    let response = await sendRequest("GET", fileUrl);
    const file = await response.json();

    response = await sendRequest("GET", file.athlete);
    const athlete = await response.json();

    let tabPanel = document.querySelector(`#tab-contents-${athlete.username}`);
    if (!tabPanel) {
      tabPanel = createTabContents(templateAthlete, athlete, listTab, templateFiles, navTabContent);
    }

    const divFiles = tabPanel.querySelector(".uploaded-files");
    const aFile = createFileLink(templateFile, file.file);

    divFiles.appendChild(aFile);
  }

  for (const athleteUrl of user.athletes) {
    const response = await sendRequest("GET", athleteUrl);
    const athlete = await response.json();

    let tabPanel = document.querySelector(`#tab-contents-${athlete.username}`);
    if (!tabPanel) {
      tabPanel = createTabContents(templateAthlete, athlete, listTab, templateFiles, navTabContent);
    }
    const uploadBtn = document.querySelector(`#btn-upload-${athlete.username}`);
    uploadBtn.disabled = false;
    uploadBtn.addEventListener("click", async (event) => await uploadFiles(event, athlete));

    const fileInput = tabPanel.querySelector(".form-control");
    fileInput.disabled = false;
  }

  if (user.athlete_files.length == 0 && user.athletes.length == 0) {
    const p = document.createElement("p");
    p.innerText = "There are currently no athletes or uploaded files.";
    document.querySelector("#list-files-div").append(p);
  }
}

function createTabContents(templateAthlete, athlete, listTab, templateFiles, navTabContent) {
  const cloneAthlete = templateAthlete.content.cloneNode(true);

  const a = cloneAthlete.querySelector("a");
  a.id = `tab-${athlete.username}`;
  a.href = `#tab-contents-${athlete.username}`;
  a.text = athlete.username;
  listTab.appendChild(a);

  const tabPanel = templateFiles.content.firstElementChild.cloneNode(true);
  tabPanel.id = `tab-contents-${athlete.username}`;

  const uploadBtn = tabPanel.querySelector('input[value="Upload"]');
  uploadBtn.id = `btn-upload-${athlete.username}`;

  navTabContent.appendChild(tabPanel);
  return tabPanel;
}

function createFileLink(templateFile, fileUrl) {
  const cloneFile = templateFile.content.cloneNode(true);
  const aFile = cloneFile.querySelector("a");
  aFile.href = fileUrl;
  const pathArray = fileUrl.split("/");
  aFile.text = pathArray[pathArray.length - 1];
  return aFile;
}

function addAthleteRow(event) {
  const newBlankRow = event.currentTarget.parentElement.cloneNode(true);
  const newInput = newBlankRow.querySelector("input");
  newInput.value = "";
  const controls = document.querySelector("#controls");
  const button = newBlankRow.querySelector("button");
  button.addEventListener("click", addAthleteRow);
  controls.appendChild(newBlankRow);

  event.currentTarget.className = "btn btn-danger btn-remove";
  event.currentTarget.querySelector("i").className = "fas fa-minus";
  event.currentTarget.removeEventListener("click", addAthleteRow);
  event.currentTarget.addEventListener("click", removeAthleteRow);
}

function removeAthleteRow(event) {
  event.currentTarget.parentElement.remove();
}

async function submitRoster() {
  const rosterInputs = document.querySelectorAll('input[name="athlete"]');

  const body = { athletes: [] };
  const currentUser = await getCurrentUser();

  for (const rosterInput of rosterInputs) {
    if (!rosterInput.disabled && rosterInput.value) {
      // get user
      const response = await sendRequest("GET", `${HOST}/api/users/${rosterInput.value}/`);
      if (response.ok) {
        const athlete = await response.json();
        if (athlete.coach == currentUser.url) {
          body.athletes.push(athlete.id);
        } else {
          // create offer
          const body = { status: "p", recipient: athlete.url };
          const response = await sendRequest("POST", `${HOST}/api/offers/`, body);
          if (!response.ok) {
            const data = await response.json();
            const alert = createAlert("Could not create offer!", data);
            document.body.prepend(alert);
          }
        }
      } else {
        const data = await response.json();
        const alert = createAlert(`Could not retrieve user ${rosterInput.value}!`, data);
        document.body.prepend(alert);
      }
    }
  }
  await sendRequest("PUT", currentUser.url, body);
  location.reload();
}

async function uploadFiles(event, athlete) {
  const form = event.currentTarget.parentElement;
  const inputFormData = new FormData(form);
  const templateFile = document.querySelector("#template-file");

  for (const file of inputFormData.getAll("files")) {
    if (file.size > 0) {
      const submitForm = new FormData();
      submitForm.append("file", file);
      submitForm.append("athlete", athlete.url);

      const response = await sendRequest("POST", `${HOST}/api/athlete-files/`, submitForm, "");
      if (response.ok) {
        const data = await response.json();

        const tabPanel = document.querySelector(`#tab-contents-${athlete.username}`);
        const divFiles = tabPanel.querySelector(".uploaded-files");
        const aFile = createFileLink(templateFile, data["file"]);
        divFiles.appendChild(aFile);
      } else {
        const data = await response.json();
        const alert = createAlert("Could not upload files!", data);
        document.body.prepend(alert);
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await displayCurrentRoster();
  await displayFiles();

  const buttonSubmitRoster = document.querySelector("#button-submit-roster");
  buttonSubmitRoster.addEventListener("click", async () => await submitRoster());
});
