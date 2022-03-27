/// <reference types="cypress" />

import Chance from "chance";
const chance = new Chance();

const valid_user_data = {
  email: chance.email(),
  password: "password",
  password1: "password",
  phone: "12345678",
  country: "Norway",
  city: "Trondheim",
  address: "Kongens gate 1",
};

/** Helper function that returns a username. */
function generateUsername() {
  return chance.first() + chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
}

describe("Register page boundary tests", () => {
  describe("username ", () => {
    it("may not be blank", () => {
      // inputs password, so 'may not be blank' alert for password is not shown
      const user = { ...valid_user_data };
      cy.addUser("", user);
      cy.get(".alert").should("be.visible");
      cy.get(".alert").contains("Registration failed!");
      cy.get(".alert")
        .contains("username")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal("username\nThis field may not be blank.");
        });
      cy.get(".btn-close").click();
    });

    it("may not be 151 characters", () => {
      const user = { ...valid_user_data };
      cy.addUser(chance.string({ length: 151, pool: "abcd" }), user);
      cy.get(".alert").should("be.visible");
      cy.get(".alert").contains("Registration failed!");
      cy.get(".alert")
        .contains("username")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal(
            "username\nEnsure this field has no more than 150 characters."
          );
        });
      cy.get(".btn-close").click();
    });

    it("may be 1 character", () => {
      const username = chance.string({ length: 1, pool: "abcdefghijklmnopqrstuvwxyzæøå" });
      const user = { ...valid_user_data };
      cy.addUser(username, user);
      cy.url().should("include", "/workouts.html");
    });

    it("may be 150 characters", () => {
      const username = chance.string({ length: 150, pool: "abcdefghijklmnopqrstuvwxyzæøå" });
      const user = { ...valid_user_data };
      cy.addUser(username, user);
      cy.url().should("include", "/workouts.html");
    });
  });

  describe("email", () => {
    it("may be blank", () => {
      const user = { ...valid_user_data };
      user["email"] = "";
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });

    it("may not be invalid", () => {
      const user = { ...valid_user_data };
      user["email"] = chance.string({ length: 5, pool: "abcd" });
      cy.addUser(generateUsername(), user);
      cy.get(".alert").should("be.visible");
      cy.get(".alert").contains("Registration failed!");
      cy.get(".alert")
        .contains("email")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal("Enter a valid email address.");
        });
      cy.get(".btn-close").click();
    });

    it("may not be 255 characters", () => {
      const user = { ...valid_user_data };
      user["email"] = chance.string({ length: 245, pool: "abcd" }) + "@gmail.com";
      cy.addUser(generateUsername(), user);
      cy.get(".alert").should("be.visible");
      cy.get(".alert").contains("Registration failed!");
      cy.get(".alert")
        .contains("email")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal(
            "email\nEnsure this field has no more than 254 characters."
          );
        });
      cy.get(".btn-close").click();
    });

    it("may be 254 characters", () => {
      const user = { ...valid_user_data };
      user["email"] = chance.string({ length: 244, pool: "abcd" }) + "@gmail.com";
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });
  });

  describe("password", () => {
    it("may not be blank", () => {
      const user = { ...valid_user_data };
      user["password"] = "";
      cy.addUser(generateUsername(), user);
      cy.get(".alert").should("be.visible");
      cy.get(".alert").contains("Registration failed!");
      cy.get(".alert")
        .contains("password")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal("password\nThis field may not be blank.");
        });
      cy.get(".btn-close").click();
    });
    it("may be one character", () => {
      const user = { ...valid_user_data };
      user["password"] = "a";
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });
  });

  describe("password1", () => {
    it("may not be blank", () => {
      const user = { ...valid_user_data };
      user["password1"] = "";
      cy.addUser(generateUsername(), user);
      cy.get(".alert").should("be.visible");
      cy.get(".alert").contains("Registration failed!");
      cy.get(".alert")
        .contains("password1")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal("password1\nThis field may not be blank.");
        });
      cy.get(".btn-close").click();
    });
    it("may be one character", () => {
      const user = { ...valid_user_data };
      user["password1"] = "a";
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });
  });

  describe("phone number", () => {
    it("may be blank", () => {
      const user = { ...valid_user_data };
      user["phone"] = "";
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });

    it("may not be 51 characters", () => {
      const user = { ...valid_user_data };
      user["phone"] = chance.string({ length: 51, pool: "abcd" });
      cy.addUser(generateUsername(), user);
      cy.get(".alert").should("be.visible");
      cy.get(".alert").contains("Registration failed!");
      cy.get(".alert")
        .contains("phone_number")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal(
            "phone_number\nEnsure this field has no more than 50 characters."
          );
        });
      cy.get(".btn-close").click();
    });

    it("may be 50 charcters", () => {
      const user = { ...valid_user_data };
      user["phone"] = chance.string({ length: 50, pool: "123456789" });
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });
  });

  describe("country", () => {
    it("may be blank", () => {
      const user = { ...valid_user_data };
      user["country"] = "";
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });

    it("may not be 51 characters", () => {
      const user = { ...valid_user_data };
      user["country"] = chance.string({ length: 51, pool: "abcd" });
      cy.addUser(generateUsername(), user);
      cy.get(".alert").should("be.visible");
      cy.get(".alert").contains("Registration failed!");
      cy.get(".alert")
        .contains("country")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal(
            "country\nEnsure this field has no more than 50 characters."
          );
        });
      cy.get(".btn-close").click();
    });

    it("may be 50 charcters", () => {
      const user = { ...valid_user_data };
      user["country"] = chance.string({ length: 50, pool: "abcde" });
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });
  });

  describe("city", () => {
    it("may be blank", () => {
      const user = { ...valid_user_data };
      user["city"] = "";
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });

    it("may not be 51 characters", () => {
      const user = { ...valid_user_data };
      user["city"] = chance.string({ length: 51, pool: "abcd" });
      cy.addUser(generateUsername(), user);
      cy.get(".alert").should("be.visible");
      cy.get(".alert").contains("Registration failed!");
      cy.get(".alert")
        .contains("city")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal(
            "city\nEnsure this field has no more than 50 characters."
          );
        });
      cy.get(".btn-close").click();
    });

    it("may be 50 charcters", () => {
      const user = { ...valid_user_data };
      user["city"] = chance.string({ length: 50, pool: "abcde" });
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });
  });

  describe("street address", () => {
    it("may be blank", () => {
      const user = { ...valid_user_data };
      user["address"] = "";
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });

    it("may not be 51 characters", () => {
      const user = { ...valid_user_data };
      user["address"] = chance.string({ length: 51, pool: "abcd" });
      cy.addUser(generateUsername(), user);
      cy.get(".alert").should("be.visible");
      cy.get(".alert").contains("Registration failed!");
      cy.get(".alert")
        .contains("street_address")
        .then((textAlert) => {
          cy.expect(textAlert[0].outerText).to.equal(
            "street_address\nEnsure this field has no more than 50 characters."
          );
        });
      cy.get(".btn-close").click();
    });

    it("may be 50 charcters", () => {
      const user = { ...valid_user_data };
      user["address"] = chance.string({ length: 50, pool: "abcde" });
      cy.addUser(generateUsername(), user);
      cy.url().should("include", "/workouts.html");
    });
  });
});
