import { TIMEOUTS } from '../utils/Constants.js';
import { Reporter } from '../utils/Reporter.js';

export class BasePage {
    async waitForElement(selector: string, timeout = TIMEOUTS.DEFAULT): Promise<WebdriverIO.Element> {
        const element = await $(selector);
        await element.waitForDisplayed({ timeout });
        return element;
    }

    async waitForElementClickable(selector: string, timeout = TIMEOUTS.DEFAULT): Promise<WebdriverIO.Element> {
        const element = await $(selector);
        await element.waitForClickable({ timeout });
        return element;
    }

    async tap(selector: string): Promise<void> {
        const element = await this.waitForElementClickable(selector);
        await element.click();
    }

    async getText(selector: string): Promise<string> {
        const element = await this.waitForElement(selector);
        return element.getText();
    }

    async setValue(selector: string, value: string): Promise<void> {
        const element = await this.waitForElement(selector);
        await element.clearValue();
        await element.setValue(value);
    }

    async isDisplayed(selector: string, timeout: number = TIMEOUTS.SHORT): Promise<boolean> {
        try {
            const element = await $(selector);
            await element.waitForDisplayed({ timeout });
            return true;
        } catch (error) {
            if (
                error instanceof Error &&
                !error.message.includes('still not displayed') &&
                !error.message.includes('still not existing') &&
                !error.message.includes('element not interactable')
            ) {
                console.warn(`[BasePage.isDisplayed] Unexpected error for "${selector}": ${error.message}`);
            }
            return false;
        }
    }

    async isEnabled(selector: string): Promise<boolean> {
        const element = await $(selector);
        return element.isEnabled();
    }

    async scrollToElement(selector: string): Promise<void> {
        const element = await $(selector);
        await element.scrollIntoView();
    }

    async getElements(selector: string): Promise<WebdriverIO.ElementArray> {
        return $$(selector);
    }

    async takeScreenshot(name: string): Promise<void> {
        await Reporter.addScreenshot(name);
    }

    async navigateTo(path: string): Promise<void> {
        await browser.url(path);
    }
}
