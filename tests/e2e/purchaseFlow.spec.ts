import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import CartModal from '../../src/pages/CartModal.js';
import { CREDENTIALS, PRODUCTS, PRICES, PRODUCT_COUNTS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('E2E Purchase Flow', () => {
    describe('P0 - Happy Path: Login → Browse → Add to Cart → Checkout', () => {
        before(async () => {
            Reporter.addFeature('E2E Purchase Flow');
            await LoginPage.open();
            await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
            await CatalogPage.waitForProductsLoaded();
            await Reporter.addScreenshot('after-login');
        });

        beforeEach(() => {
            Reporter.addSeverity('blocker');
        });

        it('Step 1: should display catalog after login', async () => {
            expect(await CatalogPage.isCatalogDisplayed()).toBe(true);
            const productCount = await CatalogPage.getProductCount();
            expect(productCount).toContain(String(PRODUCT_COUNTS.TOTAL));

            await Reporter.addScreenshot('catalog-view');
        });

        it('Step 2: should search for a specific product', async () => {
            await CatalogPage.searchProduct(PRODUCTS.WIRELESS_HEADPHONES);

            const productCount = await CatalogPage.getProductCount();
            expect(productCount).toContain('1');

            await CatalogPage.clearSearch();
        });

        it('Step 3: should add first product to cart', async () => {
            const badgeBefore = parseInt(await CatalogPage.getCartBadgeCount());
            await CatalogPage.addToCart(PRODUCTS.WIRELESS_HEADPHONES);

            const badgeAfter = parseInt(await CatalogPage.getCartBadgeCount());
            expect(badgeAfter).toBe(badgeBefore + 1);

            await Reporter.addScreenshot('after-first-add');
        });

        it('Step 4: should add second product to cart', async () => {
            const badgeBefore = parseInt(await CatalogPage.getCartBadgeCount());
            await CatalogPage.addToCart(PRODUCTS.RUNNING_SHOES);

            const badgeAfter = parseInt(await CatalogPage.getCartBadgeCount());
            expect(badgeAfter).toBe(badgeBefore + 1);

            await Reporter.addScreenshot('after-second-add');
        });

        it('Step 5: should open cart and verify items', async () => {
            await CatalogPage.openCart();

            expect(await CartModal.isCartDisplayed()).toBe(true);

            const itemCount = await CartModal.getItemCount();
            expect(itemCount).toBeGreaterThanOrEqual(2);

            await Reporter.addScreenshot('cart-with-items');
        });

        it('Step 6: should verify cart total is correctly calculated', async () => {
            Reporter.addDescription(
                'KNOWN BUG: This step will likely fail because the cart total ' +
                'shows concatenated string prices instead of a numeric sum.'
            );

            const totalText = await CartModal.getTotal();
            const totalMatch = totalText.match(/\$[\d.]+/);
            expect(totalMatch).not.toBeNull();

            const totalValue = parseFloat(totalMatch![0].replace('$', ''));
            const expectedMinimum = PRICES[PRODUCTS.WIRELESS_HEADPHONES] + PRICES[PRODUCTS.RUNNING_SHOES];

            // This will likely FAIL due to the concatenation bug
            expect(totalValue).toBeCloseTo(expectedMinimum, 1);
        });

        it('Step 7: should proceed to checkout', async () => {
            expect(await CartModal.isCheckoutButtonDisplayed()).toBe(true);

            await CartModal.tapCheckout();

            await Reporter.addScreenshot('after-checkout');
        });
    });
});
