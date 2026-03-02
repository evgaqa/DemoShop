import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import { CREDENTIALS, PRODUCTS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('Product Card', () => {
    before(async () => {
        await LoginPage.open();
        await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
        await CatalogPage.waitForProductsLoaded();
    });

    beforeEach(() => {
        Reporter.addFeature('Catalog');
    });

    describe('P1 - Card Elements', () => {
        it('should display product card with image', async () => {
            Reporter.addSeverity('critical');

            expect(await CatalogPage.isProductCardDisplayed(PRODUCTS.WIRELESS_HEADPHONES)).toBe(true);
            expect(await CatalogPage.isProductImageDisplayed(PRODUCTS.WIRELESS_HEADPHONES)).toBe(true);
        });

        it('should display star rating on product card', async () => {
            Reporter.addSeverity('critical');

            expect(await CatalogPage.isRatingDisplayed(PRODUCTS.WIRELESS_HEADPHONES)).toBe(true);
            expect(Number(await CatalogPage.getProductRating(PRODUCTS.WIRELESS_HEADPHONES))).toBeGreaterThan(0);
        });

        it('should display favorite heart icon button', async () => {
            Reporter.addSeverity('critical');

            expect(await CatalogPage.isFavoriteButtonDisplayed(PRODUCTS.WIRELESS_HEADPHONES)).toBe(true);
        });

        it('should display enabled Add to Cart button for in-stock product', async () => {
            Reporter.addSeverity('critical');

            expect(await CatalogPage.isAddToCartEnabled(PRODUCTS.WIRELESS_HEADPHONES)).toBe(true);
        });

        it('should display disabled Out of Stock button for out-of-stock product', async () => {
            Reporter.addSeverity('critical');

            expect(await CatalogPage.isAddToCartEnabled(PRODUCTS.SMART_WATCH)).toBe(false);
        });
    });

    describe('P1 - Add to Cart', () => {
        it('should increment cart badge when Add to Cart is tapped', async () => {
            Reporter.addSeverity('critical');

            const badgeBefore = await CatalogPage.getCartBadgeText();
            await CatalogPage.addToCart(PRODUCTS.WIRELESS_HEADPHONES);
            const badgeAfter = await CatalogPage.getCartBadgeText();

            expect(Number(badgeAfter)).toBeGreaterThan(Number(badgeBefore));
        });

        it('should show popup with cart confirmation when Add to Cart is tapped', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.addToCart(PRODUCTS.RUNNING_SHOES);

            expect(await CatalogPage.isActionToastDisplayed()).toBe(true);
            expect(await CatalogPage.getToastText()).toBe(`${PRODUCTS.RUNNING_SHOES} added to cart!`);
        });
    });

    describe('P1 - Out of Stock', () => {
        it('should show Out of Stock button and indicator for out-of-stock product', async () => {
            Reporter.addSeverity('critical');

            expect(await CatalogPage.isAddToCartEnabled(PRODUCTS.SMART_WATCH)).toBe(false);
            expect(await CatalogPage.getStockIndicatorText(PRODUCTS.SMART_WATCH)).toBe('Out of stock');
        });

        it('should not add item to cart when Out of Stock button is tapped', async () => {
            Reporter.addSeverity('critical');

            const badgeBefore = await CatalogPage.getCartBadgeText();

            await CatalogPage.tapOutOfStockButton(PRODUCTS.SMART_WATCH);

            expect(await CatalogPage.getCartBadgeText()).toBe(badgeBefore);
        });

        it('should show Add to Cart button and stock count for in-stock product', async () => {
            Reporter.addSeverity('normal');

            expect(await CatalogPage.isAddToCartEnabled(PRODUCTS.WIRELESS_HEADPHONES)).toBe(true);
            expect(await CatalogPage.getStockIndicatorText(PRODUCTS.WIRELESS_HEADPHONES)).toContain('in stock');
        });
    });
});
