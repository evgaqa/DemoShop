import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import CartModal from '../../src/pages/CartModal.js';
import { CREDENTIALS, PRODUCTS, PRICES } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('Shopping Cart', () => {
    beforeEach(() => {
        Reporter.addFeature('Cart');
    });

    async function loginFresh(): Promise<void> {
        await LoginPage.open();
        await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
        await CatalogPage.waitForProductsLoaded();
    }

    describe('P0 - Add to Cart', () => {
        before(loginFresh);

        it('should add a product to the cart', async () => {
            Reporter.addSeverity('blocker');

            await CatalogPage.addToCart(PRODUCTS.WIRELESS_HEADPHONES);

            const badgeCount = await CatalogPage.getCartBadgeCount();
            expect(parseInt(badgeCount)).toBeGreaterThan(0);
        });

        it('should increment cart badge when adding multiple products', async () => {
            Reporter.addSeverity('blocker');

            const badgeBefore = parseInt(await CatalogPage.getCartBadgeCount());
            await CatalogPage.addToCart(PRODUCTS.RUNNING_SHOES);
            await CatalogPage.addToCart(PRODUCTS.YOGA_MAT);
            const badgeAfter = parseInt(await CatalogPage.getCartBadgeCount());

            expect(badgeAfter).toBe(badgeBefore + 2);
        });

        it('should update header total when adding products', async () => {
            Reporter.addSeverity('blocker');

            const headerTotal = await CatalogPage.getHeaderTotal();
            expect(headerTotal).toContain('Total:');
            expect(headerTotal).toContain('$');
        });
    });

    describe('P0 - Cart Total Calculation (Bug Detection)', () => {
        const expectedTotal = PRICES[PRODUCTS.WIRELESS_HEADPHONES] + PRICES[PRODUCTS.RUNNING_SHOES] + PRICES[PRODUCTS.YOGA_MAT];

        before(async () => {
            await loginFresh();
            await CatalogPage.addToCart(PRODUCTS.WIRELESS_HEADPHONES);
            await CatalogPage.addToCart(PRODUCTS.RUNNING_SHOES);
            await CatalogPage.addToCart(PRODUCTS.YOGA_MAT);
        });

        afterEach(async () => {
            if (await CartModal.isCartDisplayed()) {
                await CartModal.close();
            }
        });

        it('should correctly compute cart total as a sum of item prices', async () => {
            Reporter.addSeverity('blocker');
            Reporter.addDescription(
                'KNOWN BUG: Cart total shows concatenated string prices instead of numeric sum. ' +
                `Expected: "$${expectedTotal.toFixed(2)}" for WH + RS + YM. Actual: string concatenation.`
            );

            await CatalogPage.openCart();
            expect(await CartModal.isCartDisplayed()).toBe(true);

            const totalText = await CartModal.getTotal();

            // A valid price has exactly one decimal point — a concatenated string like "$99.9979.9929.99" will FAIL this
            expect(totalText).toMatch(/^\$\d+\.\d{2}$/);
            expect(totalText).toBe(`$${expectedTotal.toFixed(2)}`);
        });

        it('should display header total as a valid numeric price', async () => {
            Reporter.addSeverity('blocker');
            Reporter.addDescription(
                'KNOWN BUG: Header total mirrors the same concatenated string bug as cart total.'
            );

            const headerTotal = await CatalogPage.getHeaderTotal();

            expect(headerTotal).toMatch(/\$\d+\.\d{2}/);
            expect(headerTotal).toContain(`$${expectedTotal.toFixed(2)}`);
        });
    });

    describe('P1 - Remove from Cart', () => {
        before(async () => {
            await loginFresh();
            await CatalogPage.addToCart(PRODUCTS.WIRELESS_HEADPHONES);
        });

        it('should remove an item from cart via X button', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.openCart();
            const countBefore = await CartModal.getItemCount();

            await CartModal.removeItem(PRODUCTS.WIRELESS_HEADPHONES);

            const countAfter = await CartModal.getItemCount();
            expect(countAfter).toBe(countBefore - 1);

            await CartModal.close();
        });
    });

    describe('P1 - Checkout', () => {
        before(async () => {
            await loginFresh();
            await CatalogPage.addToCart(PRODUCTS.WIRELESS_HEADPHONES);
        });

        afterEach(async () => {
            if (await CartModal.isCartDisplayed()) {
                await CartModal.close();
            }
        });

        it('should display the Proceed to Checkout button in the cart', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.openCart();
            expect(await CartModal.isCheckoutButtonDisplayed()).toBe(true);
            await CartModal.close();
        });

        it('should show "Checkout not implemented in demo" toast when checkout is tapped', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.openCart();
            await CartModal.tapCheckout();

            expect(await CatalogPage.isActionToastDisplayed()).toBe(true);
            expect(await CatalogPage.getToastText()).toBe('Checkout not implemented in demo');
        });
    });

    describe('P2 - Swipe to Delete', () => {
        before(loginFresh);

        it('should remove an item by swiping left', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.addToCart(PRODUCTS.YOGA_MAT);
            await CatalogPage.openCart();

            const countBefore = await CartModal.getItemCount();

            await CartModal.swipeToDelete(PRODUCTS.YOGA_MAT);

            await browser.waitUntil(
                async () => (await CartModal.getItemCount()) < countBefore,
                { timeout: 10000, interval: 500, timeoutMsg: 'Item count did not decrease after swipe-to-delete' }
            );

            const countAfter = await CartModal.getItemCount();
            expect(countAfter).toBe(countBefore - 1);

            await CartModal.close();
        });
    });

    describe('P2 - Cart Edge Cases', () => {
        before(loginFresh);

        it('should handle adding the same item multiple times', async () => {
            Reporter.addSeverity('normal');

            const badgeBefore = parseInt(await CatalogPage.getCartBadgeCount());

            await CatalogPage.addToCart(PRODUCTS.DESK_LAMP);
            await CatalogPage.addToCart(PRODUCTS.DESK_LAMP);

            const badgeAfter = parseInt(await CatalogPage.getCartBadgeCount());
            expect(badgeAfter).toBe(badgeBefore + 2);
        });

        it('should show duplicate items as separate entries in the cart', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.openCart();
            const itemNames = await CartModal.getItemNames();
            const deskLampCount = itemNames.filter(name => name === PRODUCTS.DESK_LAMP).length;
            expect(deskLampCount).toBe(2);
            await CartModal.close();
        });
    });
});
