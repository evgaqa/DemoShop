import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import { CREDENTIALS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

const INVALID_CREDENTIALS_ERROR = 'Invalid credentials. Try user@test.com / password123';
const USERNAME_REQUIRED_ERROR   = 'Username is required';
const SHORT_PASSWORD_ERROR      = 'Password must be at least 6 characters';

describe('Login Page', () => {
    beforeEach(async () => {
        Reporter.addFeature('Login');
        await LoginPage.open();
    });

    describe('P0 - Critical Login Tests', () => {
        beforeEach(() => {
            Reporter.addSeverity('critical');
        });

        it('should login successfully with valid credentials', async () => {
            Reporter.addSeverity('blocker'); // override: more critical than typical P0

            await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);

            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
        });

        const invalidEmailCases = [
            { description: 'wrong email domain',          email: 'wrong@test.com',              password: CREDENTIALS.VALID_PASSWORD, expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'non-existent user',           email: 'nouser@test.com',             password: CREDENTIALS.VALID_PASSWORD, expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'uppercase email',             email: 'USER@TEST.COM',               password: CREDENTIALS.VALID_PASSWORD, expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'empty email',                 email: '',                            password: CREDENTIALS.VALID_PASSWORD, expectedError: USERNAME_REQUIRED_ERROR   },
            { description: 'spaces only',                 email: '   ',                         password: CREDENTIALS.VALID_PASSWORD, expectedError: USERNAME_REQUIRED_ERROR   },

            { description: 'format: missing domain',      email: 'user@',                       password: CREDENTIALS.VALID_PASSWORD, expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'format: no @ symbol',         email: 'user.com',                    password: CREDENTIALS.VALID_PASSWORD, expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'format: missing local part',  email: '@a.com',                      password: CREDENTIALS.VALID_PASSWORD, expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'format: double @',            email: 'user@@a.com',                 password: CREDENTIALS.VALID_PASSWORD, expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'very long email',             email: 'a'.repeat(100) + '@test.com', password: CREDENTIALS.VALID_PASSWORD, expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'SQL injection',               email: "' OR 1=1 --",                 password: CREDENTIALS.VALID_PASSWORD, expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'XSS input',                   email: '<script>alert(1)</script>',   password: CREDENTIALS.VALID_PASSWORD, expectedError: INVALID_CREDENTIALS_ERROR },
        ];

        invalidEmailCases.forEach(({ description, email, password, expectedError }) => {
            it(`should show error for invalid email - ${description}`, async () => {
                await LoginPage.login(email, password);

                expect(await LoginPage.isErrorDisplayed()).toBe(true);
                expect(await LoginPage.getValidationError()).toBe(expectedError);
            });
        });

        const invalidPasswordCases = [
            { description: 'wrong password',          email: CREDENTIALS.VALID_EMAIL, password: 'wrongpass',      expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'uppercase password',      email: CREDENTIALS.VALID_EMAIL, password: 'PASSWORD123',    expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'short password',          email: CREDENTIALS.VALID_EMAIL, password: '123',            expectedError: SHORT_PASSWORD_ERROR       },
            { description: 'empty password',          email: CREDENTIALS.VALID_EMAIL, password: '',               expectedError: SHORT_PASSWORD_ERROR       },
            { description: 'spaces only',             email: CREDENTIALS.VALID_EMAIL, password: '   ',            expectedError: SHORT_PASSWORD_ERROR       },
            { description: 'leading trailing spaces', email: CREDENTIALS.VALID_EMAIL, password: ' password123 ',  expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'special characters',      email: CREDENTIALS.VALID_EMAIL, password: '!@#$%^&*()_+',  expectedError: INVALID_CREDENTIALS_ERROR },
            { description: 'very long password',      email: CREDENTIALS.VALID_EMAIL, password: 'a'.repeat(256), expectedError: INVALID_CREDENTIALS_ERROR },
        ];

        invalidPasswordCases.forEach(({ description, email, password, expectedError }) => {
            it(`should show error for invalid password - ${description}`, async () => {
                await LoginPage.login(email, password);

                expect(await LoginPage.isErrorDisplayed()).toBe(true);
                expect(await LoginPage.getValidationError()).toBe(expectedError);
            });
        });

        it('should show error for empty fields', async () => {
            await LoginPage.login('', '');

            expect(await LoginPage.isErrorDisplayed()).toBe(true);
            expect(await LoginPage.getValidationError()).toBe(USERNAME_REQUIRED_ERROR);
        });
    });

    describe('P1 - Additional Login Tests', () => {
        it('should display login page elements correctly', async () => {
            Reporter.addSeverity('normal');

            expect(await LoginPage.isLoginPageDisplayed()).toBe(true);
        });

        it('should toggle Remember me checkbox', async () => {
            Reporter.addSeverity('minor');

            await LoginPage.toggleRememberMe();
            expect(await LoginPage.isLoginPageDisplayed()).toBe(true);
        });

        it('should login successfully with leading and trailing spaces in email', async () => {
            Reporter.addSeverity('normal');

            await LoginPage.login(' ' + CREDENTIALS.VALID_EMAIL + ' ', CREDENTIALS.VALID_PASSWORD);

            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
        });

        it('should login successfully by pressing Enter', async () => {
            Reporter.addSeverity('normal');

            await LoginPage.fillCredentials(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
            await LoginPage.submitByEnter();

            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
        });

        it('should not double submit on rapid login button clicks', async () => {
            Reporter.addSeverity('normal');

            await LoginPage.fillCredentials(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
            await LoginPage.doubleClickLogin();

            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
        });
    });
});
