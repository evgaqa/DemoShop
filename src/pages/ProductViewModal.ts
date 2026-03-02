import { BasePage } from './BasePage.js';
import { MobileGestures } from '../gestures/MobileGestures.js';
import { TIMEOUTS } from '../utils/Constants.js';

class ProductViewModal extends BasePage {
    private get overlay()       { return '[data-testid="image-viewer-overlay"]'; }
    private get zoomableImage() { return '[data-testid="zoomable-image"]'; }
    private get zoomInButton()  { return '[data-testid="zoom-in-button"]'; }
    private get zoomOutButton() { return '[data-testid="zoom-out-button"]'; }
    private get closeButton()   { return '[data-testid="close-image-viewer"]'; }
    private get zoomLevelText() { return '//*[@data-testid="image-viewer-overlay"]//p[contains(normalize-space(.),"Zoom:")]'; }
    private get productNameEl() { return '//*[@data-testid="image-viewer-overlay"]//p[contains(@class,"font-semibold")]'; }

    async isModalDisplayed(): Promise<boolean> {
        return this.isDisplayed(this.overlay, TIMEOUTS.DEFAULT);
    }

    async getProductName(): Promise<string> {
        return this.getText(this.productNameEl);
    }

    async getZoomLevel(): Promise<string> {
        return this.getText(this.zoomLevelText);
    }

    async tapZoomIn(): Promise<void> {
        await this.tap(this.zoomInButton);
    }

    async tapZoomOut(): Promise<void> {
        await this.tap(this.zoomOutButton);
    }

    async pinchToZoom(scale: number = 2): Promise<void> {
        const image = await $(this.zoomableImage);
        await image.waitForDisplayed({ timeout: TIMEOUTS.DEFAULT });
        await MobileGestures.pinchToZoomJS(image, scale);
    }

    async close(): Promise<void> {
        await this.tap(this.closeButton);
    }
}

export default new ProductViewModal();
