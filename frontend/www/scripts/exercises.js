async function fetchExerciseTypes(request) {
    let response = await sendRequest("GET", `${HOST}/api/exercises/`);

    if (!response.ok) {
        let data = await response.json();
        let alert = createAlert("Could not retrieve exercise types!", data);
        document.body.prepend(alert);
    } else {
        let data = await response.json();

        let exercises = data.results;
        let container = document.getElementById('div-content');
        let exerciseTemplate = document.querySelector("#template-exercise");
        exercises.forEach(exercise => {
            const exerciseAnchor = exerciseTemplate.content.firstElementChild.cloneNode(true);
            exerciseAnchor.href = `exercise.html?id=${exercise.id}`;

            const h5 = exerciseAnchor.querySelector("h5");
            h5.textContent = exercise.name;

            const p = exerciseAnchor.querySelector("p");
            p.textContent = exercise.description;   

            container.appendChild(exerciseAnchor);
        });
        return exercises;
    }
}

async function getCategories() {
    let response = await sendRequest("GET", `${HOST}/api/exercise-categories/`);
    if (!response.ok) {
        let data = await response.json();
        let alert = createAlert("Could not retrieve category data!", data);
        document.body.prepend(alert);
    } else {
        let categoriesData = await response.json();
        let categorySelect = document.querySelector('#list-tab');

        let output= `<a class="list-group-item list-group-item-action active" id="list-all" data-bs-toggle="list" href="#list-all" role="tab" aria-controls="all">All</a>`
        categoriesData['results'].forEach(category =>{
            output += `<a class="list-group-item list-group-item-action" id="list-${category.id}" data-bs-toggle="list" href="#list-${category.id}" role="tab" aria-controls=${category.name}>${category.name}</a>`;
        })
        categorySelect.innerHTML = output
    }
}

function filterExercises(exercises, searchValue, categoryFilter) {
    let exerciseAnchors = document.querySelectorAll('.exercise');
    for (let j = 0; j < exercises.length; j++) {
        // I'm assuming that the order of exercise objects matches
        // the other of the exercise anchor elements. They should, given
        // that I just created them.
        let exercise = exercises[j];
        let exerciseAnchor = exerciseAnchors[j];
        if (exercise.name.toLowerCase().includes(searchValue.toLowerCase())) {
            if (isNaN(categoryFilter) || Number(categoryFilter) == exercise.category){
                exerciseAnchor.classList.remove('hide');
            } else {
                exerciseAnchor.classList.add('hide');
            }
        }
        else {
            exerciseAnchor.classList.add('hide');
        }
    }
}

function createExercise() {
    window.location.replace("exercise.html");
}

window.addEventListener("DOMContentLoaded", async () => {
    let createButton = document.querySelector("#btn-create-exercise");
    createButton.addEventListener("click", createExercise);
    getCategories();

    let exercises = await fetchExerciseTypes();

    let searchInput = document.querySelector("[data-search]");
    let searchValue = "";
    let categoryFilter = "all";

    searchInput.addEventListener("input", e =>{
        searchValue = e.target.value;
        filterExercises(exercises, searchValue, categoryFilter);
    });

    let tabEls = document.querySelectorAll('a[data-bs-toggle="list"]');
    for (let i = 0; i < tabEls.length; i++) {
        let tabEl = tabEls[i];
        tabEl.addEventListener('show.bs.tab', function (event) {
            categoryFilter = event.currentTarget.id.split("-")[1];
            filterExercises(exercises, searchValue, categoryFilter);
        });
    }
});
