// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("addUser", (username, userdata) => {
  cy.visit("../../www/logout.html");
  cy.wait(1000);
  cy.visit("../../www/register.html");
  if (username.length > 0) {
    cy.get('input[name="username"]').type(username);
  }
  if (userdata.email.length > 0) {
    cy.get('input[name="email"]').type(userdata.email);
  }
  if (userdata.password.length > 0) {
    cy.get('input[name="password"]').type(userdata.password);
  }
  if (userdata.password1.length > 0) {
    cy.get('input[name="password1"]').type(userdata.password1);
  }
  if (userdata.phone.length > 0) {
    cy.get('input[name="phone_number"]').type(userdata.phone);
  }
  if (userdata.country.length > 0) {
    cy.get('input[name="country"]').type(userdata.country);
  }
  if (userdata.city.length > 0) {
    cy.get('input[name="city"]').type(userdata.city);
  }
  if (userdata.address.length > 0) {
    cy.get('input[name="street_address"]').type(userdata.address);
  }
  cy.get("#btn-create-account").click();
  cy.wait(1000);
});

Cypress.Commands.add("addSimpleUser", (username, password) => {
  cy.visit("../../www/register.html");
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('input[name="password1"]').type(password);
  cy.get("#btn-create-account").click();
  cy.wait(1000);
});

Cypress.Commands.add("login", (username, password) => {
  cy.visit("../../www/logout.html");
  cy.wait(1000);
  cy.visit("../../www/login.html");
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get("#btn-login").click();
  cy.wait(1000);
});

Cypress.Commands.add("goToWorkout", (name) => {
  cy.visit("../../www/workouts.html");
  cy.wait(1000);
  cy.contains(name).click();
  cy.wait(500);
});

Cypress.Commands.add("goToExercise", (name) => {
  cy.visit("../../www/exercises.html");
  cy.wait(500);
  cy.contains(name).click();
  cy.wait(500);
});

Cypress.Commands.add("addComment", () => {
  cy.get("#comment-area").type("This is a comment.");
  cy.get("#post-comment").click();
});

Cypress.Commands.add("addCoach", (username) => {
  cy.visit("../../www/mycoach.html");
  cy.wait(500);
  cy.get("#button-edit-coach").click();
  cy.get('input[name="coach"]').type(username);
  cy.get("#button-set-coach").click();
});
Cypress.Commands.add("addWorkout", (exercisedata) => {
  cy.visit("../../www/workouts.html");
  cy.get("#btn-create-workout").click();
  cy.wait(1000);
  cy.get('input[name="name"]').type(exercisedata.name);
  cy.get('input[name="date"]')
    .click()
    .then((input) => {
      input[0].dispatchEvent(new Event("input", { bubbles: true }));
      input.val(exercisedata.date);
    })
    .click();
  cy.get('textarea[name="notes"]').type(exercisedata.notes);
  cy.get("#inputVisibility").select(exercisedata.visibility);
  cy.get('input[name="files"]').attachFile(exercisedata.files);
  cy.get("#btn-remove-exercise").click();
  cy.get("#btn-ok-workout").click();
  cy.wait(1000);
  cy.goToWorkout(exercisedata.name);
  cy.addComment();
});

Cypress.Commands.add("createExercise", (exercisedata) => {
  cy.visit("../../www/exercise.html");
  cy.get('input[name="name"]').type(exercisedata.name);
  cy.get('textarea[name="description"]').type(exercisedata.description);
  if (exercisedata.unit) {
    cy.get('input[name="unit"]').type(exercisedata.unit);
  }
  if (exercisedata.duration) {
    cy.get('input[name="duration"]').type(exercisedata.duration);
  }
  if (exercisedata.calories) {
    cy.get('input[name="calories"]').type(exercisedata.calories);
  }
  cy.get('select[name="category"]').select(exercisedata.category);
  cy.get("#btn-ok-exercise").click();
});
