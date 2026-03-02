import allure from '@wdio/allure-reporter';

export class Reporter {
    static addStep(name: string): void {
        allure.addStep(name);
    }

    static addFeature(feature: string): void {
        allure.addFeature(feature);
    }

    static addSeverity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
        allure.addSeverity(severity);
    }

    static addDescription(description: string): void {
        allure.addDescription(description);
    }

    static async addScreenshot(name: string): Promise<void> {
        const screenshot = await browser.takeScreenshot();
        allure.addAttachment(name, Buffer.from(screenshot, 'base64'), 'image/png');
    }
}
