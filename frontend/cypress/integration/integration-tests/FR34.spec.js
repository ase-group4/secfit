/// <reference types="cypress" />

import Chance from "chance";
const chance = new Chance();

const valid_ingredient1 = {
  name: chance.animal(),
  protein: chance.integer({ min: 1, max: 100 }),
  fat: chance.integer({ min: 1, max: 100 }),
  carbohydrates: chance.integer({ min: 1, max: 100 }),
};

const valid_ingredient2 = {
  name: chance.animal(),
  protein: chance.integer({ min: 1, max: 100 }),
  fat: chance.integer({ min: 1, max: 100 }),
  carbohydrates: chance.integer({ min: 1, max: 100 }),
};

const valid_meal = {
  name: chance.word() + " " + chance.word(),
  date: "2022-03-19T13:00:00",
  notes: "This is a note",
};

function fillOutIngredient(ingredientdata) {
  console.log(ingredientdata);
  cy.get("#ingredient-name-input").type(ingredientdata.name);
  cy.get('input[name="protein"]').type(ingredientdata.protein);
  cy.get('input[name="fat"]').type(ingredientdata.fat);
  cy.get('input[name="carbohydrates"]').type(ingredientdata.carbohydrates);
  cy.wait(2000);
  cy.get("#ingredient-submit-button").click();
}

function fillOutMeal(mealdata) {
  cy.wait(500);
  cy.get("#inputName").type(mealdata.name);
  cy.get('input[name="date"]')
    .click()
    .then((input) => {
      input[0].dispatchEvent(new Event("input", { bubbles: true }));
      input.val(mealdata.date);
    });
  cy.get('textarea[name="notes"]').type(mealdata.notes);
}

describe("Integration tests", () => {
  const user = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user_password = chance.string({ length: 10, pool: "abcd" });

  const ingredient1 = { ...valid_ingredient1 };
  const ingredient2 = { ...valid_ingredient2 };

  const meal1 = { ...valid_meal };
  const meal2 = { ...valid_meal };
  meal2["name"] = chance.word();

  before(() => {
    cy.addSimpleUser(user, user_password);
  });
  beforeEach(() => {
    cy.login(user, user_password);
  });

  describe("FR34.2: The athlete should be able to create their own ingredients, with nutritional value specified with the amount of protein, fat and carbohydrates per 100 grams.", () => {
    it("create ingredient from ingredientpage", () => {
      cy.visit("../../www/ingredients.html");
      cy.get("#btn-create-ingredient").click();
      cy.wait(500);
      fillOutIngredient(ingredient1);
    });

    it("create ingredient from meals page", () => {
      cy.visit("../../www/meal.html");
      cy.get("#meal-create-new-ingredient").click();
      cy.wait(500);
      fillOutIngredient(ingredient2);
    });

    it("ingredients on page with correct values", () => {
      cy.visit("../../www/ingredients.html");
      cy.get("#div-content").contains(ingredient1["name"]).should("be.visible");
      cy.get("#div-content")
        .contains(ingredient1["name"])
        .parent()
        .within(() => {
          cy.contains("Calories:")
            .parent()
            .within(() => {
              cy.contains(
                (
                  ingredient1.carbohydrates * 4 +
                  ingredient1.fat * 9 +
                  ingredient1.protein * 4
                ).toString() + " kcal"
              );
            });
          cy.contains("Protein:")
            .parent()
            .within(() => {
              cy.contains(ingredient1.protein.toString() + " g");
            });
          cy.contains("Fat:")
            .parent()
            .within(() => {
              cy.contains(ingredient1.fat.toString() + " g");
            });
          cy.contains("Carbohydrates:")
            .parent()
            .within(() => {
              cy.contains(ingredient1.carbohydrates.toString() + " g");
            });
        });
      cy.get("#div-content").contains(ingredient2["name"]).should("be.visible");
      cy.get("#div-content")
        .contains(ingredient2["name"])
        .parent()
        .within(() => {
          cy.contains("Calories:")
            .parent()
            .within(() => {
              cy.contains(
                (
                  ingredient2.carbohydrates * 4 +
                  ingredient2.fat * 9 +
                  ingredient2.protein * 4
                ).toString() + " kcal"
              );
            });
          cy.contains("Protein:")
            .parent()
            .within(() => {
              cy.contains(ingredient2.protein.toString() + " g");
            });
          cy.contains("Fat:")
            .parent()
            .within(() => {
              cy.contains(ingredient2.fat.toString() + " g");
            });
          cy.contains("Carbohydrates:")
            .parent()
            .within(() => {
              cy.contains(ingredient2.carbohydrates.toString() + " g");
            });
        });
    });
  });

  describe("FR34.1: The athlete should be able to select ingredients by searching through a database of ingredients.", () => {
    it("search on ingredient page, ingredient1", () => {
      cy.visit("../../www/ingredients.html");
      cy.get("#ingredient-search-field").type(ingredient1.name);
      cy.wait(500);
      cy.get("#div-content").contains(ingredient1["name"]).should("be.visible");
    });

    it("search on ingredient page, ingredient2", () => {
      cy.visit("../../www/ingredients.html");
      cy.get("#ingredient-search-field").type(ingredient2.name);
      cy.wait(500);
      cy.get("#div-content").contains(ingredient2["name"]).should("be.visible");
    });

    it("search on meal page", () => {
      cy.visit("../../www/meal.html");
      cy.wait(5000);
      cy.get("#meal-ingredient-add-button").click();
      cy.wait(1000);
      cy.get(".meal-ingredient-input").should("have.attr", "list", "meal-ingredient-options");
      cy.get("#meal-ingredient-options").within(() => {
        cy.contains(ingredient1.name);
        cy.contains(ingredient2.name);
      });
    });
  });

  describe("FR34: The athlete should be able to compose a meal by inputting its ingredients and their weights.", () => {
    it("create meal with ingredient", () => {
      cy.visit("../../www/meal.html");
      cy.wait(5000);
      cy.get("#meal-ingredient-add-button").click();
      cy.wait(1000);
      cy.get(".meal-ingredient-input").type(ingredient1.name);
      cy.get('input[name="weight"]').type(200);
      fillOutMeal(meal1);
      cy.wait(5000);
      cy.get("#btn-ok-meal").click();
      cy.wait(500);
    });

    it("view meal with ingredient", () => {
      cy.visit("../../www/meals.html");
      cy.wait(1000);
      cy.get("#div-content").contains(meal1.name).should("be.visible");
      cy.get("#div-content")
        .contains(meal1.name)
        .parent()
        .parent()
        .within(() => {
          cy.contains(
            "Calories: " +
              (
                ingredient1.carbohydrates * 2 * 4 +
                ingredient1.fat * 2 * 9 +
                ingredient1.protein * 2 * 4
              ).toString() +
              " kcal"
          );
          cy.contains("Protein: " + (ingredient1.protein * 2).toString() + " g");
          cy.contains("Fat: " + (ingredient1.fat * 2).toString() + " g");
          cy.contains("Carbohydrates: " + (ingredient1.carbohydrates * 2).toString() + " g");
        });
    });
  });

  describe("FR34.3: Remove ingredient from meal", () => {
    /*
    In agreement with Haakon Gunleiksrud per email we did not implement (and therefore do not test)
    the part of the FR concerning removing an ingredient *after* meal logging.
    This was agreed upon because the meal editing functionality was not fully implemented in the pre-existing code.
    */
    it("remove ingredient during meal logging", () => {
      cy.visit("../../www/meal.html");
      cy.wait(5000);
      cy.get("#meal-ingredient-add-button").click();

      //adds ingredient1
      cy.get(".meal-ingredient-input").type(ingredient1.name);
      cy.get('input[name="weight"]').type(200);

      //removes ingredient1
      cy.wait(1000);
      cy.get('textarea[name="notes"]').type(chance.sentence());
      cy.get(".meal-ingredient-remove-button").click();
      cy.wait(1000);

      fillOutMeal(meal2);

      //adds ingredient2
      cy.get("#meal-ingredient-add-button").click();
      cy.wait(1000);
      cy.get(".meal-ingredient-input").type(ingredient2.name);
      cy.get('input[name="weight"]').type(200);
      cy.wait(1000);
      cy.get('textarea[name="notes"]').type(chance.sentence());
      cy.get('textarea[name="notes"]').type(chance.sentence());
      cy.get("#btn-ok-meal").click();
    });

    it("view meal with ingredient", () => {
      cy.visit("../../www/meals.html");
      cy.wait(1000);
      cy.get("#div-content").contains(meal2.name).should("be.visible");
      cy.get("#div-content")
        .contains(meal2.name)
        .parent()
        .parent()
        .within(() => {
          cy.contains(
            "Calories: " +
              (
                ingredient2.carbohydrates * 2 * 4 +
                ingredient2.fat * 2 * 9 +
                ingredient2.protein * 2 * 4
              ).toString() +
              " kcal"
          );
          cy.contains("Protein: " + (ingredient2.protein * 2).toString() + " g");
          cy.contains("Fat: " + (ingredient2.fat * 2).toString() + " g");
          cy.contains("Carbohydrates: " + (ingredient2.carbohydrates * 2).toString() + " g");
        });
    });
  });
});
