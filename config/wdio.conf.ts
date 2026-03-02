import dotenv from 'dotenv';
import path from 'path';
import { androidChromeCapabilities } from './capabilities.js';

dotenv.config();

export const config: WebdriverIO.Config = {
    runner: 'local',

    hostname: process.env.APPIUM_HOST || 'localhost',
    port: Number(process.env.APPIUM_PORT) || 4723,

    specs: [
        path.resolve('./tests/**/*.spec.ts'),
    ],

    exclude: [],

    maxInstances: 1,

    capabilities: [androidChromeCapabilities],

    logLevel: 'warn',

    bail: 0,

    baseUrl: process.env.BASE_URL || 'https://qa-mobile-automation.vercel.app/',

    waitforTimeout: Number(process.env.IMPLICIT_TIMEOUT) || 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    services: [['appium', { command: 'appium' }]],

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: Number(process.env.TEST_TIMEOUT) || 60000,
    },

    reporters: [
        'spec',
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,
        }],
    ],

    afterTest: async function (test, _context, { error }) {
        if (error) {
            await browser.takeScreenshot();
        }
    },
};
