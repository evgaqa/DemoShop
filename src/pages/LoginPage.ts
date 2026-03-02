import { BasePage } from './BasePage.js';
import { TIMEOUTS } from '../utils/Constants.js';

class LoginPage extends BasePage {
    // Selectors
    private get emailInput() { return '[data-testid="login-username"]'; }
    private get passwordInput() { return '[data-testid="login-password"]'; }
    private get rememberMeCheckbox() { return '[data-testid="remember-me-checkbox"]'; }
    private get loginButton() { return '[data-testid="login-button"]'; }
    private get errorMessage() { return '[data-testid="login-error"]'; }
    private get errorText() { return '//div[@data-testid=\'login-error\']/span'; }
    private get pageTitle() { return 'h1'; }

    async fillCredentials(email: string, password: string): Promise<void> {
        await this.setValue(this.emailInput, email);
        await this.setValue(this.passwordInput, password);
    }

    async login(email: string, password: string): Promise<void> {
        await this.fillCredentials(email, password);
        await browser.hideKeyboard();
        await this.tap(this.loginButton);
    }

    async submitByEnter(): Promise<void> {
        await browser.hideKeyboard();
        await browser.keys(['Return']);
    }

    async doubleClickLogin(): Promise<void> {
        await browser.hideKeyboard();
        const btn = await $(this.loginButton);
        await btn.waitForClickable({ timeout: TIMEOUTS.DEFAULT });
        await btn.click();
        await btn.click();
    }

    async toggleRememberMe(): Promise<void> {
        await this.tap(this.rememberMeCheckbox);
    }

    async getValidationError(): Promise<string> {
        return this.getText(this.errorText);
    }

    async isLoginPageDisplayed(): Promise<boolean> {
        return this.isDisplayed(this.loginButton);
    }

    async isErrorDisplayed(): Promise<boolean> {
        return this.isDisplayed(this.errorMessage, TIMEOUTS.DEFAULT);
    }

    async open(): Promise<void> {
        await this.navigateTo('/');
    }
}

export default new LoginPage();
