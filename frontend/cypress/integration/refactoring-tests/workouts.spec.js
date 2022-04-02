/// <reference types="cypress" />

import "cypress-file-upload";
import Chance from "chance";
const chance = new Chance();

const valid_exercise1 = {
  name: "Exercise",
  description: "Description",
  unit: 1,
  duration: 1,
  calories: 1,
  category: "Strength",
  sets: 123,
  number: 321,
};

const valid_exercise2 = {
  name: "Exercise",
  description: "Cool description",
  unit: 2,
  duration: 2,
  calories: 2,
  category: "Balance",
};

const valid_workout = {
  name: "Workout",
  date: "2017-04-30T13:00:00",
  notes: "This is a note.",
  visibility: "PU",
  files: "images/bugs.jpg",
};

function validateExercise(exercise) {
  cy.get('textarea[name="description"]').should("have.value", exercise.description);
  cy.get('input[name="unit"]').should("have.value", exercise.unit);
  cy.get('input[name="duration"]').should("have.value", exercise.duration);
  cy.get('input[name="calories"]').should("have.value", exercise.calories);
  cy.get('select[name="category"]').find("option:selected").should("have.text", exercise.category);
}

describe("Create exercise instance", () => {
  const user = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user_password = chance.string({ length: 10, pool: "abcd" });
  const exercise1 = { ...valid_exercise1 };
  exercise1.name = "Exercise1-" + user;
  const exercise2 = { ...valid_exercise2 };
  exercise2.name = "Exercise2-" + user;
  const workout = { ...valid_workout };
  workout.name = "Workout-" + user;

  describe("Create exercise instance", () => {
    it("Create exercise (without re-logging in, tests RememberMe)", () => {
      cy.addSimpleUser(user, user_password);
      cy.createExercise(exercise1);
    });

    it("View exercise details", () => {
      cy.login(user, user_password);
      cy.goToExercise(exercise1.name);
      validateExercise(exercise1);
    });

    it("Create workout with exercise", () => {
      cy.login(user, user_password);
      const workout = { ...valid_workout };
      workout.exercise = { ...exercise1 };
      workout.name = "Workout-" + user;
      cy.addWorkout(workout);
    });

    it("View workout with exercise", () => {
      cy.login(user, user_password);
      cy.goToWorkout(workout.name);
      cy.get('input[name="name"]').should("have.value", workout.name);
      cy.get("#uploaded-files").should("have.text", "bugs.jpg");
      cy.get('select[name="type"]').find("option:selected").should("have.text", exercise1.name);
      cy.get("#inputSets0").should("have.value", exercise1.sets);
      cy.get("#inputNumber0").should("have.value", exercise1.number);
    });
  });
  describe("Cancel button exercise", () => {
    beforeEach(() => {
      cy.login(user, user_password);
    });

    it("Cancelbutton during edit", () => {
      cy.goToExercise(exercise1.name);
      cy.get('input[name="name"]').should("have.attr", "readonly", "readonly");
      cy.get('textarea[name="description"]').should("have.attr", "readonly", "readonly");
      cy.get('input[name="unit"]').should("have.attr", "readonly", "readonly");
      cy.get('input[name="duration"]').should("have.attr", "readonly", "readonly");
      cy.get('input[name="calories"]').should("have.attr", "readonly", "readonly");
      cy.get('select[name="category"]').should("have.attr", "disabled");

      cy.get("#btn-edit-exercise").click();

      cy.get('input[name="name"]').type(exercise2.name);
      cy.get('textarea[name="description"]').type(exercise2.description);
      cy.get('input[name="unit"]').type(exercise2.unit);
      cy.get('input[name="duration"]').type(exercise2.duration);
      cy.get('input[name="calories"]').type(exercise2.calories);

      cy.get("#btn-cancel-exercise").click();

      cy.get('input[name="name"]').should("have.value", exercise1.name);
      cy.get('textarea[name="description"]').should("have.value", exercise1.description);
      cy.get('input[name="unit"]').should("have.value", exercise1.unit);
      cy.get('input[name="duration"]').should("have.value", exercise1.duration);
      cy.get('input[name="calories"]').should("have.value", exercise1.calories);
    });

    it("Cancelbutton during create", () => {
      cy.visit("../../www/exercises.html");
      cy.wait(1000);
      cy.get("#btn-create-exercise").click();
      cy.get('input[name="name"]').type(exercise2.name);
      cy.get('textarea[name="description"]').type(exercise2.description);
      cy.get('input[name="unit"]').type(exercise2.unit);
      cy.get('input[name="duration"]').type(exercise2.duration);
      cy.get('input[name="calories"]').type(exercise2.calories);

      cy.get("#btn-cancel-exercise").click();

      cy.url().should("include", "exercises.html");
      cy.contains(exercise2.name).should("not.exist");
    });
  });

  describe("Edit and delete exercise", () => {
    beforeEach(() => {
      cy.login(user, user_password);
    });

    it("Edit exercise", () => {
      cy.goToExercise(exercise1.name);
      cy.get("#btn-edit-exercise").click();

      cy.get('input[name="name"]').clear().type(exercise2.name);
      cy.get('textarea[name="description"]').clear().type(exercise2.description);
      cy.get('input[name="unit"]').clear().type(exercise2.unit);
      cy.get('input[name="duration"]').clear().type(exercise2.duration);
      cy.get('input[name="calories"]').clear().type(exercise2.calories);

      cy.get("#btn-ok-exercise").click();

      cy.get('input[name="name"]').should("have.value", exercise2.name);
      cy.get('textarea[name="description"]').should("have.value", exercise2.description);
      cy.get('input[name="unit"]').should("have.value", exercise2.unit);
      cy.get('input[name="duration"]').should("have.value", exercise2.duration);
      cy.get('input[name="calories"]').should("have.value", exercise2.calories);
    });

    it("Delete exercise", () => {
      cy.goToExercise(exercise2.name);
      cy.get("#btn-edit-exercise").click();
      cy.get("#btn-delete-exercise").click();
      cy.url().should("include", "exercises.html");
      cy.contains(exercise2.name).should("not.exist");
    });
  });

  describe("Musclegroups", () => {
    beforeEach(() => {
      cy.login(user, user_password);
    });

    const muscleGroups = ["Legs", "Chest", "Back", "Arms", "Abdomen", "Shoulders"];
    for (const muscleGroup of muscleGroups) {
      it(muscleGroup, () => {
        const exercise = { ...valid_exercise1 };
        exercise.name = muscleGroup + "-" + user;
        exercise.muscleGroup = muscleGroup;
        cy.createExercise(exercise);
        cy.goToExercise(exercise.name);
        cy.wait(1000);
        cy.get('select[name="muscleGroup"]')
          .find("option:selected")
          .should("have.value", muscleGroup);
      });
    }
  });
});
