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
/*
const valid_exercise2 = {
    name: "Exercise",
    description: "Cool description",
    unit: 2,
    duration: 2,
    calories: 2,
    category: "Balance",
  };
  */

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
  const exercise2 = { ...valid_exercise1 };
  exercise2.name = "Exercise2-" + user;
  const workout = { ...valid_workout };

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
      cy.get('input[name="name"]');
      cy.get('textarea[name="description"]').should("have.attr", "readonly", "readonly");
      cy.get('input[name="unit"]').should("have.attr", "readonly", "readonly");
      cy.get('input[name="duration"]').should("have.attr", "readonly", "readonly");
      cy.get('input[name="calories"]').should("have.attr", "readonly", "readonly");
      cy.get('select[name="category"]').should("have.attr", "disabled");

      cy.get("#btn-edit-exercise").click();

      cy.get('input[name="name"]');
      cy.get('textarea[name="description"]').should("not.have.attr", "readonly");
      cy.get('input[name="unit"]').should("not.have.attr", "readonly");
      cy.get('input[name="duration"]').should("not.have.attr", "readonly");
      cy.get('input[name="calories"]').should("not.have.attr", "readonly");
      cy.get('select[name="category"]').should("not.have.attr", "readonly");
    });

    it("Cancelbutton during create", () => {});
  });

  describe("Edit and delete exercise", () => {
    beforeEach(() => {
      cy.login(user, user_password);
    });

    it("Canc", () => {
      cy.goToExercise(exercise1);
    });
  });
});
