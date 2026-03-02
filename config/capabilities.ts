import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

export const androidChromeCapabilities = {
    maxInstances: 1,
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    browserName: 'Chrome',
    'appium:deviceName': process.env.DEVICE_NAME || 'emulator-5554',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '13',
    'appium:chromedriverExecutable': path.resolve(process.env.CHROMEDRIVER_PATH ?? './chromedrivers/chromedriver.exe'),
    'appium:noReset': false,
    'appium:newCommandTimeout': 240,
    'wdio:enforceWebDriverClassic': true,
};
