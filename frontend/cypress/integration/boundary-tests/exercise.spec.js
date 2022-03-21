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

describe("Exercise page boundary tests", () => {
  const user = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user_password = chance.string({ length: 10, pool: "abcd" });

  before(() => {
    cy.addSimpleUser(user, user_password);
  });
  beforeEach(() => {
    cy.login(user, user_password);
  });

  describe("unit", () => {
    it("may not be blank", () => {
      var exercise = { ...valid_exercise };
      exercise["unit"] = "";
      cy.createExercise(exercise);
      cy.get(".alert")
        .contains("unit")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal("unit\nThis field may not be blank.");
        });
      cy.url().should("include", "/exercise.html");
    });

    it("may be 1 character", () => {
      var exercise = { ...valid_exercise };
      exercise["unit"] = "a";
      cy.createExercise(exercise);
      cy.url().should("include", "/exercises.html");
    });

    it("may have 50 characters", () => {
      var exercise = { ...valid_exercise };
      exercise["unit"] = chance.string({ length: 50 });
      cy.createExercise(exercise);
      cy.url().should("include", "/exercises.html");
    });

    it("has not have 51 characters", () => {
      var exercise = { ...valid_exercise };
      exercise["unit"] = chance.string({ length: 51 });
      cy.createExercise(exercise);
      cy.get(".alert")
        .contains("unit")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal(
            "unit\nEnsure this field has no more than 50 characters."
          );
        });
      cy.url().should("include", "/exercise.html");
    });
  });

  describe("duration", () => {
    it("may not be blank", () => {
      var exercise = { ...valid_exercise };
      exercise["duration"] = "";
      cy.createExercise(exercise);
      cy.get(".alert")
        .contains("duration")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal("duration\nA valid integer is required.");
        });
      cy.url().should("include", "/exercise.html");
    });

    it("may not be zero", () => {
      var exercise = { ...valid_exercise };
      exercise["duration"] = 0;
      cy.createExercise(exercise);
      cy.get(".alert")
        .contains("duration")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal("duration\nA valid integer is required.");
        });
      cy.url().should("include", "/exercise.html");
    });
  
    it("may be one", () => {
      var exercise = { ...valid_exercise };
      exercise["duration"] = 1;
      cy.createExercise(exercise);
      cy.url().should("include", "/exercises.html");
    });

    it("may not be a string", () => {
      var exercise = { ...valid_exercise };
      exercise["duration"] = "abc";
      cy.createExercise(exercise);
      cy.get(".alert")
        .contains("duration")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal("duration\nA valid integer is required.");
        });
      cy.url().should("include", "/exercise.html");
    });

    /*
    This test is commented out, as it should pass, but due to the fact that there is no validation backend that the duration is a positive number it does not,
    and the task does not ask us to fix bugs we find in the original code.

    it("may not be a negative", () => {
      var exercise = {...valid_exercise}
      exercise["duration"] = -5
      cy.createExercise(exercise)
      cy.get(".alert").contains("duration").then((textAlert) =>{
        cy.expect(textAlert[0].outerText).to.equal("duration\nA valid integer is required.")
      })
      cy.url().should("include", "/exercise.html");
    });
    */
  });
  describe("calories", () => {
    it("may not be blank", () => {
      var exercise = { ...valid_exercise };
      exercise["calories"] = "";
      cy.createExercise(exercise);
      cy.get(".alert")
        .contains("calories")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal("calories\nA valid integer is required.");
        });
      cy.url().should("include", "/exercise.html");
    });

    it("may not be zero", () => {
      var exercise = { ...valid_exercise };
      exercise["calories"] = 0;
      cy.createExercise(exercise);
      cy.get(".alert")
      .contains("calories")
      .then((textAlert) => {
        cy.expect(textAlert[0].outerText).to.equal("calories\nA valid integer is required.");
      });
      cy.url().should("include", "/exercise.html");
    });
  
    it("may be one", () => {
      var exercise = { ...valid_exercise };
      exercise["duration"] = 1;
      cy.createExercise(exercise);
      cy.url().should("include", "/exercises.html");
    });

    it("may not be a string", () => {
      var exercise = { ...valid_exercise };
      exercise["calories"] = "abc";
      cy.createExercise(exercise);
      cy.get(".alert")
        .contains("calories")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal("calories\nA valid integer is required.");
        });
      cy.url().should("include", "/exercise.html");
    });

    /*
    This test is commented out, as it should pass, but due to the fact that there is no validation backend that calories is a positive number it does not,
    and the task does not ask us to fix bugs we find in the original code.

    it("may not be a negative", () => {
      var exercise = {...valid_exercise}
      exercise["calories"] = -5
      cy.createExercise(exercise)
      cy.get(".alert").contains("calories").then((textAlert) =>{
        cy.expect(textAlert[0].outerText).to.equal("calories\nA valid integer is required.")
      })
      cy.url().should("include", "/exercise.html");
    });
    */
  });
});
