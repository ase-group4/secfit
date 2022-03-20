/// <reference types="cypress" />

import Chance from "chance";
const chance = new Chance();
import "cypress-file-upload";

const valid_workout = {
  name: "Workout",
  date: "2017-04-30T13:00:00",
  unit: "2017-04-30T13:00:00",
  notes: "This is a note.",
  visibility: "PU",
  files: "images/bugs.jpg",
};

describe("Integration tests", () => {
  const user = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user_password = chance.string({ length: 10, pool: "abcd" });
  const workout1 = { ...valid_workout };
  workout1["name"] = "workout1-" + user;
  const workout2 = { ...valid_workout };
  workout2["name"] = "Workout2-" + user;

  before(() => {
    cy.addSimpleUser(user, user_password);

    cy.login(user, user_password);
    cy.addWorkout(workout1);
    cy.addWorkout(workout2);
  });
  beforeEach(() => {
    cy.login(user, user_password);
  });

  describe("FR32:The user should be able to search through workouts and get a list of workouts matching the input in the search field.", () => {
    beforeEach(() => {
      cy.visit("/../../www/workouts.html");
    });

    it("workout1", () => {
      cy.get("#search-input").type(workout1["name"]);
      cy.wait(500);
      cy.get("#div-content").contains(workout1["name"]).should("be.visible");
      cy.get("#div-content").contains(workout2["name"]).should("not.be.visible");
    });

    it("workout2", () => {
      cy.get("#search-input").type(workout2["name"]);
      cy.wait(500);
      cy.get("#div-content").contains(workout1["name"]).should("not.be.visible");
      cy.get("#div-content").contains(workout2["name"]).should("be.visible");
    });

    it("username", () => {
      cy.get("#search-input").type(user);
      cy.wait(500);
      cy.get("#div-content").contains(workout1["name"]).should("be.visible");
      cy.get("#div-content").contains(workout2["name"]).should("be.visible");
    });
  });
});
