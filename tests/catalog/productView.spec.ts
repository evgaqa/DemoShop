import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import ProductViewModal from '../../src/pages/ProductViewModal.js';
import { CREDENTIALS, PRODUCTS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('Product View Modal', () => {
    before(async () => {
        await LoginPage.open();
        await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
        await CatalogPage.waitForProductsLoaded();
    });

    beforeEach(() => {
        Reporter.addSeverity('normal');
        Reporter.addFeature('Product View');
    });

    describe('P2 - Product View', () => {
        it('should open product view modal when tapping product image', async () => {
            await CatalogPage.openProductView(PRODUCTS.RUNNING_SHOES);

            expect(await ProductViewModal.isModalDisplayed()).toBe(true);
        });

        it('should display correct product name in modal', async () => {
            const name = await ProductViewModal.getProductName();
            expect(name).toContain(PRODUCTS.RUNNING_SHOES);
        });

        it('should show initial zoom level of 1.0x', async () => {
            const zoomLevel = await ProductViewModal.getZoomLevel();
            expect(zoomLevel).toContain('1.0x');
        });
    });

    describe('P2 - Button Zoom Controls', () => {
        it('should zoom in when tapping Zoom In button', async () => {
            await ProductViewModal.tapZoomIn();

            const zoomLevel = await ProductViewModal.getZoomLevel();
            const zoomMatch = zoomLevel.match(/([\d.]+)x/);
            expect(zoomMatch).not.toBeNull();
            expect(parseFloat(zoomMatch![1])).toBeGreaterThan(1.0);
        });

        it('should zoom out when tapping Zoom Out button', async () => {
            await ProductViewModal.tapZoomOut();

            const zoomLevel = await ProductViewModal.getZoomLevel();
            const zoomMatch = zoomLevel.match(/([\d.]+)x/);
            expect(zoomMatch).not.toBeNull();
            expect(parseFloat(zoomMatch![1])).toBeCloseTo(1.0, 1);
        });
    });

    describe('P2 - Pinch to Zoom Gesture', () => {
        it('should zoom in with pinch-to-zoom gesture', async () => {
            const zoomBefore = await ProductViewModal.getZoomLevel();
            await ProductViewModal.pinchToZoom(2);

            const zoomAfter = await ProductViewModal.getZoomLevel();
            expect(zoomAfter).not.toBe(zoomBefore);
        });
    });

    describe('P2 - Close Modal', () => {
        it('should close product view modal', async () => {
            await ProductViewModal.close();

            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
        });
    });
});
