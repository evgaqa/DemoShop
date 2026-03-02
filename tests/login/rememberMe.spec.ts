import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import { CREDENTIALS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('Login Page', () => {
    beforeEach(async () => {
        Reporter.addFeature('Remember Me');
        await LoginPage.open();
    });

    // ─── Remember Me = OFF (session-only) ───────────────────────────────────────

    describe('P1 - Remember Me Disabled', () => {
        it('should remain logged in after page refresh', async () => {
            Reporter.addSeverity('critical');

            await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
            await browser.refresh();

            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
        });

        it('should remain logged in when opening a new tab', async () => {
            Reporter.addSeverity('normal');

            await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);

            const currentUrl = await browser.getUrl();
            await browser.execute((url: string) => window.open(url), currentUrl);
            const handles = await browser.getWindowHandles();
            await browser.switchToWindow(handles[handles.length - 1]);

            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);

            await browser.closeWindow();
            await browser.switchToWindow(handles[0]);
        });

        it('should be logged out after simulated browser restart', async () => {
            Reporter.addSeverity('critical');

            await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
            // Simulate browser restart: sessionStorage is cleared (tab/process closed),
            // but localStorage persists. With Remember Me OFF, auth lives in sessionStorage only,
            // so the user should be logged out after restart.
            await browser.execute(() => sessionStorage.clear());
            await browser.refresh();

            expect(await LoginPage.isLoginPageDisplayed()).toBe(true);
        });
    });

    // ─── Remember Me = ON (persistent) ─────────────────────────────────────────

    describe('P1 - Remember Me Enabled', () => {
        it('should remain logged in after page refresh', async () => {
            Reporter.addSeverity('critical');

            await LoginPage.toggleRememberMe();
            await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
            await browser.refresh();

            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
        });

        it('should remain logged in when opening a new tab', async () => {
            Reporter.addSeverity('normal');

            await LoginPage.toggleRememberMe();
            await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);

            const currentUrl = await browser.getUrl();
            await browser.execute((url: string) => window.open(url), currentUrl);
            const handles = await browser.getWindowHandles();
            await browser.switchToWindow(handles[handles.length - 1]);

            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);

            await browser.closeWindow();
            await browser.switchToWindow(handles[0]);
        });

        it('should remain logged in after simulated browser restart', async () => {
            Reporter.addSeverity('critical');

            await LoginPage.toggleRememberMe();
            await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
            // Simulate closing the browser: only sessionStorage is lost,
            // persistent auth (localStorage / long-lived cookie) survives
            await browser.execute(() => sessionStorage.clear());
            await browser.refresh();

            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
        });
    });
});
