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

function filterExersises(exercises, searchValue) {
    let exerciseAnchors = document.querySelectorAll('.exercise');
    for (let j = 0; j < exercises.length; j++) {
        // I'm assuming that the order of exercise objects matches
        // the other of the exercise anchor elements. They should, given
        // that I just created them.
        let exercise = exercises[j];
        let exerciseAnchor = exerciseAnchors[j];
        if (exercise.name.toLowerCase().includes(searchValue.toLowerCase())) {
            exerciseAnchor.classList.remove('hide');
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

    let exercises = await fetchExerciseTypes();

    let searchInput= document.querySelector("[data-search]")
    let searchValue= ""
    searchInput.addEventListener("input", e =>{
        searchValue = e.target.value
        filterExersises(exercises, searchValue)
    })
    
});
