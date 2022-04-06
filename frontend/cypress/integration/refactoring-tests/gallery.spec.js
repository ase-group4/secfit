/// <reference types="cypress" />

import "cypress-file-upload";
import Chance from "chance";
const chance = new Chance();

const valid_workout = {
  name: "Workout",
  date: "2017-04-30T13:00:00",
  notes: "This is a note.",
  visibility: "PU",
  files: "images/bugs.jpg",
};

describe("Workout gallery", () => {
  const user = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user_password = chance.string({ length: 10, pool: "abcd" });
  const workout = { ...valid_workout };
  workout.name = "Workout-" + user;

  before(() => {
    cy.addSimpleUser(user, user_password);
    cy.addWorkout(workout);
  });

  beforeEach(() => {
    cy.login(user, user_password);
  });

  it("May go back to workout from gallery", () => {
    cy.goToWorkout(workout.name);
    cy.get("#btn-gallery-workout").click();
    cy.wait(500);
    cy.get(".main-img").find("img").should("have.attr", "src").should("include", "bugs.jpg");
    cy.get("#btn-back-workout").click();
    cy.url().should("include", "/workout.html");
  });

  it("May press button to delete workoutfile (this functionality was fixed during codereview+refactoring)", () => {
    cy.goToWorkout(workout.name);
    cy.get("#btn-gallery-workout").click();
    cy.wait(500);
    cy.get(".btn-close").click();
    cy.get("#no-images-text").contains("This workout has no images.").should("be.visible");
  });
});
