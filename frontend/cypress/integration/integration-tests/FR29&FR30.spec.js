/// <reference types="cypress" />

import Chance from "chance";
const chance = new Chance();

const valid_exercise = {
  name: "Exercise",
  description: "Description",
  unit: 1,
  duration: 1,
  calories: 1,
  category: "Strength"
};

describe("Register page boundary tests", () => {
  const user = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user_password = chance.string({ length: 10, pool: "abcd" });

  before(() => {
    cy.addSimpleUser(user, user_password);
  });
  beforeEach(() => {
    cy.visit("../../www/register.html");
    cy.login(user, user_password);
  });

  describe("FR30: The athlete must select a category when creating/editing an exercise", () => {
    it("Strength exercise", () => {
      var exercise = { ...valid_exercise };
      exercise["name"] = "Strength-"+ user;
      exercise["category"] = "Strength";
      cy.createExercise(exercise);
    });
    it("Balance exercise", () => {
      var exercise = { ...valid_exercise };
      exercise["name"] = "Balance-"+ user;
      exercise["category"] = "Balance";
      cy.createExercise(exercise);
    });
    it("Endurance exercise", () => {
      var exercise = { ...valid_exercise };
      exercise["name"] = "Endurance-"+ user;
      exercise["category"] = "Endurance";
      cy.createExercise(exercise);
    });
    it("Flexibility exercise", () => {
      var exercise = { ...valid_exercise };
      exercise["name"] = "Flexibility-"+ user;
      exercise["category"] = "Flexibility";
      cy.createExercise(exercise);
    });
  });


  describe("FR29", () => {
    it("The user should be able to filter exercises by categories", () => {
      var exercise = { ...valid_exercise };
      cy.createExercise(exercise);
    });
  });

});
