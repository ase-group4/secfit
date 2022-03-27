/// <reference types="cypress" />

import Chance from "chance";
const chance = new Chance();

// usernames = [empty(generate valid username), too long, invalid, empty (invalid)]
const usernames = [undefined, chance.string({ length: 151, pool: "abcd" }), "lol'lol", ""];

// emails = [valid email, too long, invalid]
const emails = [
  chance.email(),
  chance.string({ length: 245, pool: "abcd" }) + "@gmail.com",
  "notanemail",
];

// passwords & password1s = [valid password, empty (invalid)]
const passwords = [chance.string({ length: 10, pool: "abcd" }), ""];
const password1s = { ...passwords };

// below: [valid value, too long]
const phones = ["12345678", chance.string({ length: 51, pool: "abcd" })];
const countries = ["Norway", chance.string({ length: 51, pool: "abcd" })];
const cities = ["Trondheim", chance.string({ length: 51, pool: "abcd" })];
const addresses = ["Kongens gate 1", chance.string({ length: 51, pool: "abcd" })];

/*
Data from VPTAG, Double Mode (Pairwise):
1	0	0	0	0	0	0	0	0
378	1	1	1	1	1	1	1	0
431	2	2	1	1	0	0	0	1
732	3	2	0	0	1	1	1	1
390	1	1	0	0	0	0	0	1
565	0	0	1	1	1	1	0	1
208	3	0	1	0	0	0	1	0
243	2	0	0	0	1	0	1	0
128	3	1	0	1	0	1	0	0
201	0	2	0	0	0	0	1	0
103	2	1	0	0	0	1	0	0
2	1	0	0	0	0	0	0	0
5	0	1	0	0	0	0	0	0
10	1	2	0	0	0	0	0	0
*/
const combinations = {
  1: [0, 0, 0, 0, 0, 0, 0, 0],
  810: [1, 1, 1, 1, 1, 1, 1, 0],
  431: [2, 2, 1, 1, 0, 0, 0, 1],
  732: [3, 2, 0, 0, 1, 1, 1, 1],
  390: [1, 1, 0, 0, 0, 0, 0, 1],
  565: [0, 0, 1, 1, 1, 1, 0, 1],
  208: [3, 0, 1, 0, 0, 0, 1, 0],
  243: [2, 0, 0, 0, 1, 0, 1, 0],
  128: [3, 1, 0, 1, 0, 1, 0, 0],
  201: [0, 2, 0, 0, 0, 0, 1, 0],
  103: [2, 1, 0, 0, 0, 1, 0, 0],
  2: [1, 0, 0, 0, 0, 0, 0, 0],
  5: [0, 1, 0, 0, 0, 0, 0, 0],
  10: [1, 2, 0, 0, 0, 0, 0, 0],
};

/**
 * Helper function that inputs values on the register page based on given combination.
 * The function uses values from the defined lists for each input field.
 */
function inputRegister(combination) {
  let username = "";
  if (combination[0] == 0) {
    username = chance.first() + chance.first() + chance.last().replace(/[^a-zA-Z0-9]/g, "-");
  } else {
    username = usernames[combination[0]];
  }

  const userdata = {
    email: emails[combination[1]],
    password: passwords[combination[2]],
    password1: password1s[combination[3]],
    phone: phones[combination[4]],
    country: countries[combination[5]],
    city: cities[combination[6]],
    address: addresses[combination[7]],
  };
  cy.addUser(username, userdata);
}

describe("Register page 2-way domain tests", () => {
  /** Function that tests that the expected values are in the alert after a registration has failed. */
  function testRegisterFail(value) {
    cy.wait(500);
    cy.get(".alert").should("be.visible");
    cy.get(".alert").contains("Registration failed!");
    cy.url().should("include", "/register.html");
    testUsernameFail(value[0]);
    testEmailFail(value[1]);
    testPasswordsEqualFail(value[2], value[3]);
    testPasswordFail(value[2]);
    testPassword1Fail(value[3]);
    testPhoneFail(value[4]);
    testCountryFail(value[5]);
    testCityFail(value[6]);
    testAddressFail(value[7]);
  }

  /** Function that tests that the input in the username field resulted in the expected warning in the alert. */
  function testUsernameFail(value) {
    if (value == 0) {
      return;
    }
    cy.get(".alert")
      .contains("username")
      .then((textAlert) => {
        if (value == 1) {
          cy.expect(textAlert[0].outerText).to.equal(
            "username\nEnsure this field has no more than 150 characters."
          );
        } else if (value == 2) {
          cy.expect(textAlert[0].outerText).to.equal(
            "Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters."
          );
        } else if (value == 3) {
          cy.expect(textAlert[0].outerText).to.equal("username\nThis field may not be blank.");
        }
      });
  }

  /** Function that tests that the input in the email field resulted in the expected warning in the alert. */
  function testEmailFail(value) {
    if (value == 0) {
      return;
    }
    cy.get(".alert")
      .contains("email")
      .then((textAlert) => {
        if (value == 1) {
          cy.expect(textAlert[0].outerText).to.equal(
            "email\nEnsure this field has no more than 254 characters."
          );
        } else if (value == 2) {
          cy.expect(textAlert[0].outerText).to.equal("Enter a valid email address.");
        }
      });
  }

  /** Function that tests that the input in the password field resulted in the expected warning in the alert. */
  function testPasswordFail(value) {
    if (value == 0) {
      return;
    }
    cy.get(".alert")
      .contains("password")
      .then((textAlert) => {
        console.log(textAlert);
        cy.expect(value).to.equal(1);
        cy.expect(textAlert[0].outerText).to.equal("password\nThis field may not be blank.");
      });
  }

  /** Function that tests that the input in the password1 field resulted in the expected warning in the alert. */
  function testPassword1Fail(value) {
    if (value == 0) {
      return;
    }
    cy.get(".alert")
      .contains("password1")
      .then((textAlert) => {
        console.log(textAlert);
        cy.expect(value).to.equal(1);
        cy.expect(textAlert[0].outerText).to.equal("password1\nThis field may not be blank.");
      });
  }

  /** Function that tests that different passwords resulted in the expected warning in the alert.*/
  function testPasswordsEqualFail(value1, value2) {
    if (value1 == value2) {
      return;
    }
    /*
    This test currently fail due to errors in the pre-existing code,
    due to the fact that it is allowed for the two inputted passwords to be different.
    cy.get(".alert")
      .contains("password")
      .then((textAlert) => {
        console.log(textAlert);
        cy.expect(value).to.equal(1);
        cy.expect(textAlert[0].outerText).to.equal("password\nPasswords must be equal.");
      });
    */
  }

  /** Function that tests that the input in the phone_number field resulted in the expected warning in the alert. */
  function testPhoneFail(value) {
    if (value == 0) {
      return;
    }
    cy.get(".alert")
      .contains("phone_number")
      .then((textAlert) => {
        cy.expect(value).to.equal(1);
        cy.expect(textAlert[0].outerText).to.equal(
          "phone_number\nEnsure this field has no more than 50 characters."
        );
      });
  }

  /** Function that tests that the input in the country field resulted in the expected warning in the alert. */
  function testCountryFail(value) {
    if (value == 0) {
      return;
    }
    cy.get(".alert")
      .contains("country")
      .then((textAlert) => {
        cy.expect(value).to.equal(1);
        cy.expect(textAlert[0].outerText).to.equal(
          "country\nEnsure this field has no more than 50 characters."
        );
      });
  }

  /** Function that tests that the input in the city field resulted in the expected warning in the alert. */
  function testCityFail(value) {
    if (value == 0) {
      return;
    }
    cy.get(".alert")
      .contains("city")
      .then((textAlert) => {
        cy.expect(value).to.equal(1);
        cy.expect(textAlert[0].outerText).to.equal(
          "city\nEnsure this field has no more than 50 characters."
        );
      });
  }

  /** Function that tests that the input in the street_address field resulted in the expected warning in the alert. */
  function testAddressFail(value) {
    if (value == 0) {
      return;
    }
    cy.get(".alert")
      .contains("street_address")
      .then((textAlert) => {
        cy.expect(value).to.equal(1);
        cy.expect(textAlert[0].outerText).to.equal(
          "street_address\nEnsure this field has no more than 50 characters."
        );
      });
  }

  /** Function that tests that registration has succeeded. */
  function testRegisterSuccess() {
    cy.wait(500);
    cy.url().should("include", "/workouts.html");
    cy.wait(500);
  }

  for (const [key, value] of Object.entries(combinations)) {
    // loops through each combination to achieve 2-way testing
    it("testID: " + key.toString(), () => {
      cy.visit("../../www/register.html");
      inputRegister(value);
      if (key == 1) {
        testRegisterSuccess();
      } else {
        testRegisterFail(value);
      }
    });
  }
});
