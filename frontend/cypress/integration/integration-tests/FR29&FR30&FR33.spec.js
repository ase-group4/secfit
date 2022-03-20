/// <reference types="cypress" />

import Chance from "chance";
const chance = new Chance();

const valid_exercise = {
  name: "Exercise",
  description: "Description",
  unit: 1,
  duration: 1,
  calories: 1,
  category: "Strength",
};

describe("Integration tests", () => {
  const user = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user_password = chance.string({ length: 10, pool: "abcd" });

  before(() => {
    cy.addSimpleUser(user, user_password);
  });
  beforeEach(() => {
    cy.login(user, user_password);
  });

  describe("FR30: The athlete must select a category when creating/editing an exercise", () => {
    it("Strength exercise", () => {
      var exercise = { ...valid_exercise };
      exercise["name"] = "Strength-" + user;
      exercise["category"] = "Strength";
      cy.createExercise(exercise);
      cy.login(user, user_password);
      cy.goToExercise("Strength-" + user);
      cy.get('select[name="category"]').find("option:selected").should("have.text", "Strength");
    });

    it("Balance exercise", () => {
      var exercise = { ...valid_exercise };
      exercise["name"] = "Balance-" + user;
      exercise["category"] = "Balance";
      cy.createExercise(exercise);
      cy.wait(500);
      cy.login(user, user_password);
      cy.goToExercise("Balance-" + user);
      cy.get('select[name="category"]').find("option:selected").should("have.text", "Balance");
    });

    it("Endurance exercise", () => {
      var exercise = { ...valid_exercise };
      exercise["name"] = "Endurance-" + user;
      exercise["category"] = "Endurance";
      cy.createExercise(exercise);
      cy.wait(500);
      cy.login(user, user_password);
      cy.goToExercise("Endurance-" + user);
      cy.get('select[name="category"]').find("option:selected").should("have.text", "Endurance");
    });

    it("Flexibility exercise", () => {
      var exercise = { ...valid_exercise };
      exercise["name"] = "Flexibility-" + user;
      exercise["category"] = "Flexibility";
      cy.createExercise(exercise);
      cy.wait(500);
      cy.login(user, user_password);
      cy.goToExercise("Flexibility-" + user);
      cy.get('select[name="category"]').find("option:selected").should("have.text", "Flexibility");
    });
  });

  describe("FR33:The user should be able to filter exercises by categories", () => {
    beforeEach(() => {
      cy.visit("/../../www/exercises.html");
    });

    it("All", () => {
      cy.get("#list-all").click();
      cy.wait(500);
      cy.get("#div-content")
        .contains("Strength-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Balance-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Endurance-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Flexibility-" + user)
        .should("be.visible");
    });

    it("Strength", () => {
      cy.get("#list-tab").contains("Strength").click();
      cy.wait(500);
      cy.get("#div-content")
        .contains("Strength-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Balance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Endurance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Flexibility-" + user)
        .should("not.be.visible");
    });

    it("Balance", () => {
      cy.get("#list-tab").contains("Balance").click();
      cy.wait(500);
      cy.get("#div-content")
        .contains("Strength-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Balance-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Endurance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Flexibility-" + user)
        .should("not.be.visible");
    });

    it("Endurance", () => {
      cy.get("#list-tab").contains("Endurance").click();
      cy.wait(500);
      cy.get("#div-content")
        .contains("Strength-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Balance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Endurance-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Flexibility-" + user)
        .should("not.be.visible");
    });

    it("Flexibility", () => {
      cy.get("#list-tab").contains("Flexibility").click();
      cy.wait(500);
      cy.get("#div-content")
        .contains("Strength-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Balance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Endurance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Flexibility-" + user)
        .should("be.visible");
    });
  });

  describe("FR33:The user should be able to search through exercises and get a list of exercises matching the input in the search field", () => {
    beforeEach(() => {
      cy.visit("/../../www/exercises.html");
    });

    it("Username", () => {
      cy.get("#search-input").type(user);
      cy.wait(500);
      cy.get("#div-content")
        .contains("Strength-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Balance-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Endurance-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Flexibility-" + user)
        .should("be.visible");
    });

    it("Strength", () => {
      cy.get("#search-input").type("Strength");
      cy.wait(500);
      cy.get("#div-content")
        .contains("Strength-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Balance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Endurance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Flexibility-" + user)
        .should("not.be.visible");
    });

    it("Balance", () => {
      cy.get("#search-input").type("Balance");
      cy.wait(500);
      cy.get("#div-content")
        .contains("Strength-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Balance-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Endurance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Flexibility-" + user)
        .should("not.be.visible");
    });

    it("Endurance", () => {
      cy.get("#search-input").type("Endurance");
      cy.wait(500);
      cy.get("#div-content")
        .contains("Strength-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Balance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Endurance-" + user)
        .should("be.visible");
      cy.get("#div-content")
        .contains("Flexibility-" + user)
        .should("not.be.visible");
    });

    it("Flexibility", () => {
      cy.wait(500);
      cy.get("#search-input").type("Flexibility");
      cy.get("#div-content")
        .contains("Strength-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Balance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Endurance-" + user)
        .should("not.be.visible");
      cy.get("#div-content")
        .contains("Flexibility-" + user)
        .should("be.visible");
    });
  });
});
