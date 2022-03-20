/// <reference types="cypress" />

import Chance from "chance";
const chance = new Chance();

const valid_ingredient={
    name: chance.animal(),
    protein: chance.integer({ min: 1, max: 100 }),
    fat: chance.integer({ min: 1, max: 100 }), 
    carbohydrates: chance.integer({ min: 1, max: 100 }), 
}


function fillOutIngredient(ingredientdata){
    cy.get('#ingredient-name-input').type(ingredientdata.name)
    cy.get('input[name="protein"]').type(ingredientdata.protein)
    cy.get('input[name="fat"]').type(ingredientdata.fat)
    cy.get('input[name="carbohydrates"]').type(ingredientdata.carbohydrates)
    cy.get("#ingredient-submit-button").click()
}

describe("Integration tests", () => {
    const user = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
    const user_password = chance.string({ length: 10, pool: "abcd" });

    const ingredient1 = { ...valid_ingredient };
    const ingredient2 = { ...valid_ingredient };
    ingredient2["name"] = chance.animal()
  
    before(() => {
      cy.addSimpleUser(user, user_password);
    });
    beforeEach(() => {
      cy.login(user, user_password);
    });

    describe("FR34.2: The athlete should be able to create their own ingredients, with nutritional value specified with the amount of protein, fat and carbohydrates per 100 grams", () => {
        it("create ingredient from ingredientpage", () => {
            cy.visit("../../www/ingredients.html")
            cy.get("#btn-create-ingredient").click()
            cy.wait(500)
            fillOutIngredient(ingredient1)
        });
        it("create ingredient from meals page", () => {
            cy.visit("../../www/meal.html")
            cy.get("#meal-create-new-ingredient").click()
            cy.wait(500)
            fillOutIngredient(ingredient2)
        });
      });

    describe("FR34.1: The athlete should be able to select ingredients by searching through a database of ingredients.", () => {
        it("search on ingredient page, no search", () => {
            cy.visit("../../www/ingredients.html")
            cy.get("#div-content").contains(ingredient1["name"]).should("be.visible");
            cy.get("#div-content").contains(ingredient2["name"]).should("be.visible");
        });

        it("search on ingredient page, ingredient1", () => {
            cy.visit("../../www/ingredients.html")
            cy.get("#ingredient-search-field").type(ingredient1.name);
            cy.wait(500);
            cy.get("#div-content").contains(ingredient1["name"]).should("be.visible");
            cy.get("#div-content").contains(ingredient2["name"]).should("not.be.visible");
        });

        it("search on ingredient page, ingredient2", () => {
            cy.visit("../../www/ingredients.html")
            cy.get("#ingredient-search-field").type(ingredient2.name);
            cy.wait(500);
            cy.get("#div-content").contains(ingredient1["name"]).should("not.be.visible");
            cy.get("#div-content").contains(ingredient2["name"]).should("be.visible");
        });
    });
  
});
