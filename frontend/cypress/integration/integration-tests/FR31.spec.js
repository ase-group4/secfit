/// <reference types="cypress" />

import Chance from "chance";
const chance = new Chance();

describe("Integration tests", () => {
  const user1 = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user1_password = chance.string({ length: 10, pool: "abcd" });
  const user2 = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user2_password = chance.string({ length: 10, pool: "abcd" });
  const user3 = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user3_password = chance.string({ length: 10, pool: "abcd" });

  before(() => {
    cy.addSimpleUser(user1, user1_password);
    cy.addSimpleUser(user2, user2_password);
    cy.addSimpleUser(user3, user3_password);
  });

  describe("FR32:The user should be able to search through users and get a list of users matching the input in the search field", () => {
    /*
    Checks that the users are in the userlist, and the userlist is given as list in the inputfield.
    The <datalist> tag provides an "autocomplete" feature for <input> elements, which equals search functionallity.
    */
    it("coaches are members of datalist for input element", () => {
      cy.login(user1, user1_password);
      cy.visit("../../www/mycoach.html");
      cy.wait(500);
      cy.get('input[name="coach"]').should("have.attr", "list", "userlist");
      cy.get("#userlist").within(() => {
        cy.get(`option[value=${user1}]`).should("not.exist");
        cy.get(`option[value=${user2}]`);
        cy.get(`option[value=${user3}]`);
      });
    });

    it("athletes are members of datalist for input element", () => {
      cy.login(user2, user2_password);
      cy.visit("../../www/myathletes.html");
      cy.wait(500);
      cy.get('input[name="athlete"]').should("have.attr", "list", "userlist");
      cy.get("#userlist").within(() => {
        cy.get(`option[value=${user1}]`);
        cy.get(`option[value=${user2}]`).should("not.exist");
        cy.get(`option[value=${user3}]`);
      });
    });
  });
});
