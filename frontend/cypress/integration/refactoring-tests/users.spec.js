import "cypress-file-upload";
import Chance from "chance";
const chance = new Chance();

const filename = "images/bugs.jpg";

describe("Workouts visibility", () => {
  const user = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const user_password = chance.string({ length: 10, pool: "abcd" });

  const coach = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  const coach_password = chance.string({ length: 10, pool: "abcd" });

  const athlete_password = chance.string({ length: 10, pool: "abcd" });
  const athlete = chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");

  before(() => {
    cy.addSimpleUser(user, user_password);
    cy.addSimpleUser(athlete, athlete_password);
    cy.addSimpleUser(coach, coach_password);
  });

  it("Coaches may send coach offer", () => {
    cy.login(coach, coach_password);
    cy.addAthlete(athlete);
    cy.login(user, user_password);
    cy.addAthlete(athlete);
  });

  it("Ahtlete may see coach offers", () => {
    cy.login(athlete, athlete_password);
    cy.visit("../../www/mycoach.html");
    cy.get(".list-group-item").contains(coach);
    cy.get(".list-group-item").contains(user);
  });

  it("Ahtlete may accept coach offer", () => {
    cy.login(athlete, athlete_password);
    cy.visit("../../www/mycoach.html");
    cy.wait(1000);
    cy.get(".list-group-item")
      .contains(coach)
      .parent()
      .within(() => {
        cy.get(".btn-success").click();
      });
  });

  it("Coach may upload athletefile", () => {
    cy.login(coach, coach_password);
    cy.visit("../../www/myathletes.html");
    cy.get("#tab-" + athlete).click();
    cy.get('input[name="files"]').attachFile(filename);
    cy.get('input[value="Upload"]').click();
  });

  it("Athlete may upload athletefile", () => {
    cy.login(athlete, athlete_password);
    cy.visit("../../www/mycoach.html");
    cy.wait(1000);
    cy.get(".me-2").contains("bugs.jpg").click();
  });
});
