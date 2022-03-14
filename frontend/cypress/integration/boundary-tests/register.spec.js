/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

describe('Register page boundary tests', () => {
    beforeEach(() => {
        cy.visit('../../www/register.html')
      })
    describe('username ', () => {
        it('may not be blank', () => {
            //inputs password, so 'may not be blank alert for password is not shown
            let password = chance.string({length: 10, pool: 'abcd'})
            cy.get('input[name="password"]').type(password);
            cy.get('input[name="password1"]').type(password);

            cy.get('#btn-create-account').click();
            cy.get('.alert').should('be.visible');
            cy.get('.alert').contains('username')
            cy.get('.alert').contains('This field may not be blank.')
            cy.get('.btn-close').click()
        })
        it('must be no more than 150 characters', () => {
            cy.get('input[name="username"]').type(chance.string({length: 151, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('be.visible');
            cy.get('.alert').contains('username')
            cy.get('.alert').contains('Ensure this field has no more than 150 characters.')
            cy.get('.btn-close').click()
        })
        it('may be 1 character', () => {
            cy.get('input[name="username"]').type(chance.letter());
            cy.get('#btn-create-account').click();
            cy.get('.alert').contains('username').should('not.exist');
            cy.get('.btn-close').click()
        })
        it('may be 150 characters', () => {
            cy.get('input[name="username"]').type(chance.string({length: 150, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').contains('username').should('not.exist');
            cy.get('.btn-close').click()
        })
        it('may be authenticated', () => {
            let password = chance.string({length: 10, pool: 'abcd'})
            cy.get('input[name="username"]').type(chance.first()+chance.last().replace(/[^a-zA-Z0-9]/g, '-'));
            cy.get('input[name="password"]').type(password);
            cy.get('input[name="password1"]').type(password);
            cy.get('#btn-create-account').click();
            cy.url().should('include', '/workouts.html')
        })
    })

    describe('email', () => {
        it('may be blank', () => {
            cy.get('#btn-create-account').click();
            cy.get('.alert').contains('email').should('not.exist');
            cy.get('.btn-close').click()
        })
        it('must be valid', () => {
            cy.get('input[name="email"]').type(chance.string({length: 5, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('be.visible');
            cy.get('.alert').contains('email')
            cy.get('.alert').contains('Enter a valid email address.')
            cy.get('.btn-close').click()
        })
        it('must be no more than 254 characters', () => {
            cy.get('input[name="email"]').type(chance.string({length: 6, pool: 'abcd'}) + '@' + chance.string({length: 245, pool: 'abcd'}) + '.no');
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('be.visible');
            cy.get('.alert').contains('email')
            cy.get('.alert').contains('Ensure this field has no more than 254 characters.')
            cy.get('.btn-close').click()
        })
        it('may be authenticated', () => {
            let password = chance.string({length: 10, pool: 'abcd'})
            cy.get('input[name="username"]').type(chance.first()+chance.last().replace(/[^a-zA-Z0-9]/g, '-'));
            cy.get('input[name="email"]').type(chance.email());
            cy.get('input[name="password"]').type(password);
            cy.get('input[name="password1"]').type(password);
            cy.get('#btn-create-account').click();
            cy.url().should('include', '/workouts.html')
        })
    })

    describe('passwords', () => {
        it('password may not be blank', () => {
            cy.get('input[name="username"]').type(chance.first()+chance.last().replace(/[^a-zA-Z0-9]/g, '-'));
            cy.get('input[name="password1"]').type(chance.string({length: 10, pool: 'abcd'}));

            cy.get('#btn-create-account').click();
            cy.get('.alert').should('be.visible');
            cy.get('.alert').contains('password')
            cy.get('.alert').contains('This field may not be blank.')
            cy.get('.btn-close').click()
        })
        it('password1 may not be blank', () => {
            cy.get('input[name="username"]').type(chance.first()+chance.last().replace(/[^a-zA-Z0-9]/g, '-'));
            cy.get('input[name="password"]').type(chance.string({length: 10, pool: 'abcd'}));

            cy.get('#btn-create-account').click();
            cy.get('.alert').should('be.visible');
            cy.get('.alert').contains('password1')
            cy.get('.alert').contains('This field may not be blank.')
            cy.get('.btn-close').click()
        })

        it('may be 1 character', () => {
            cy.get('input[name="password"]').type(chance.string({length: 1, pool: 'abcd'}));
            cy.get('input[name="password1"]').type(chance.string({length: 1, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('not.contain', 'password');
            cy.get('.alert').should('not.contain', 'password1');
            cy.get('.btn-close').click()
        })

        // This is a weird one
        it('may be different', () => {
            cy.get('input[name="username"]').type(chance.first()+chance.last().replace(/[^a-zA-Z0-9]/g, '-'));
            cy.get('input[name="password"]').type(chance.string({length: 10, pool: 'abcd'}));
            cy.get('input[name="password1"]').type(chance.string({length: 10, pool: 'efgh'}));
            cy.get('#btn-create-account').click();
            cy.url().should('include', '/workouts.html')
        })
        
        it('may be authenticated', () => {
            let password = chance.string({length: 10, pool: 'abcd'})
            cy.get('input[name="username"]').type(chance.first()+chance.last().replace(/[^a-zA-Z0-9]/g, '-'));
            cy.get('input[name="password"]').type(password);
            cy.get('input[name="password1"]').type(password);
            cy.get('#btn-create-account').click();
            cy.get('#btn-create-account').click();
            cy.url().should('include', '/workouts.html')
        })
    })

    describe('phone number', () => {
        it('may be blank', () => {
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('not.contain', 'phone_number');
            cy.get('.btn-close').click()
        })

        it('must be no more than 50 characters', () => {
            cy.get('input[name="phone_number"]').type(chance.string({length: 51, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('be.visible');
            cy.get('.alert').contains('phone_number')
            cy.get('.alert').contains('Ensure this field has no more than 50 characters.')
            cy.get('.btn-close').click()
        })

        it('may be 50 characters', () => {
            cy.get('input[name="phone_number"]').type(chance.string({length: 50, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('not.contain', 'phone_number');
            cy.get('.btn-close').click()
        })
        
        it('may be authenticated', () => {
            let password = chance.string({length: 10, pool: 'abcd'})
            cy.get('input[name="username"]').type(chance.first()+chance.last().replace(/[^a-zA-Z0-9]/g, '-'));
            cy.get('input[name="password"]').type(password);
            cy.get('input[name="password1"]').type(password);
            cy.get('input[name="phone_number"]').type(chance.string({length: 10, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.url().should('include', '/workouts.html')
        })
    })

    describe('country', () => {
        it('may be blank', () => {
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('not.contain', 'country');
            cy.get('.btn-close').click()
        })

        it('must be no more than 50 characters', () => {
            cy.get('input[name="country"]').type(chance.string({length: 51, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('be.visible');
            cy.get('.alert').contains('country')
            cy.get('.alert').contains('Ensure this field has no more than 50 characters.')
            cy.get('.btn-close').click()
        })

        it('may be 50 characters', () => {
            cy.get('input[name="country"]').type(chance.string({length: 50, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('not.contain', 'country');
            cy.get('.btn-close').click()
        })
        
        it('may be authenticated', () => {
            let password = chance.string({length: 10, pool: 'abcd'})
            cy.get('input[name="username"]').type(chance.first()+chance.last().replace(/[^a-zA-Z0-9]/g, '-'));
            cy.get('input[name="password"]').type(password);
            cy.get('input[name="password1"]').type(password);
            cy.get('input[name="country"]').type(chance.string({length: 10, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.url().should('include', '/workouts.html')
        })
    })

    describe('city', () => {
        it('may be blank', () => {
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('not.contain', 'city');
            cy.get('.btn-close').click()
        })

        it('must be no more than 50 characters', () => {
            cy.get('input[name="city"]').type(chance.string({length: 51, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('be.visible');
            cy.get('.alert').contains('city')
            cy.get('.alert').contains('Ensure this field has no more than 50 characters.')
            cy.get('.btn-close').click()
        })

        it('may be 50 characters', () => {
            cy.get('input[name="city"]').type(chance.string({length: 50, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('not.contain', 'city');
            cy.get('.btn-close').click()
        })
        
        it('may be authenticated', () => {
            let password = chance.string({length: 10, pool: 'abcd'})
            cy.get('input[name="username"]').type(chance.first()+chance.last().replace(/[^a-zA-Z0-9]/g, '-'));
            cy.get('input[name="password"]').type(password);
            cy.get('input[name="password1"]').type(password);
            cy.get('input[name="city"]').type(chance.string({length: 10, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.url().should('include', '/workouts.html')
        })
    })

    describe('street address', () => {
        it('may be blank', () => {
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('not.contain', 'street_address');
            cy.get('.btn-close').click()
        })

        it('must be no more than 50 characters', () => {
            cy.get('input[name="street_address"]').type(chance.string({length: 51, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('be.visible');
            cy.get('.alert').contains('street_address')
            cy.get('.alert').contains('Ensure this field has no more than 50 characters.')
            cy.get('.btn-close').click()
        })

        it('may be 50 characters', () => {
            cy.get('input[name="street_address"]').type(chance.string({length: 50, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.get('.alert').should('not.contain', 'street_address');
            cy.get('.btn-close').click()
        })
        
        it('may be authenticated', () => {
            let password = chance.string({length: 10, pool: 'abcd'})
            cy.get('input[name="username"]').type(chance.first()+chance.last().replace(/[^a-zA-Z0-9]/g, '-'));
            cy.get('input[name="password"]').type(password);
            cy.get('input[name="password1"]').type(password);
            cy.get('input[name="street_address"]').type(chance.string({length: 10, pool: 'abcd'}));
            cy.get('#btn-create-account').click();
            cy.url().should('include', '/workouts.html')
        })
    })
})

