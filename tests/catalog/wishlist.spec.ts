import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import { CREDENTIALS, PRODUCTS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('Wishlist', () => {
    beforeEach(async () => {
        Reporter.addSeverity('critical');
        Reporter.addFeature('Catalog');
        await LoginPage.open();
        await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
        await CatalogPage.waitForProductsLoaded();
    });

    describe('P1 - Wishlist', () => {
        it('should show toast and update counter when added to wishlist', async () => {
            const countBefore = Number(await CatalogPage.getFavoritesCount());

            await CatalogPage.toggleWishlist(PRODUCTS.WIRELESS_HEADPHONES);

            expect(await CatalogPage.isActionToastDisplayed()).toBe(true);
            expect(await CatalogPage.getToastText()).toBe(`Added to favorites (${countBefore + 1} total)`);
            expect(await CatalogPage.getFavoritesCount()).toBe(String(countBefore + 1));
        });

        it('should show toast and hide counter when removed from wishlist', async () => {
            const countBefore = Number(await CatalogPage.getFavoritesCount());

            await CatalogPage.toggleWishlist(PRODUCTS.WIRELESS_HEADPHONES);
            // Wait for the "added" toast to disappear before toggling again,
            // so the second tap lands on a settled UI and the "removed" toast is readable.
            await CatalogPage.waitForToastToDisappear();

            await CatalogPage.toggleWishlist(PRODUCTS.WIRELESS_HEADPHONES);

            expect(await CatalogPage.isActionToastDisplayed()).toBe(true);
            expect(await CatalogPage.getToastText()).toBe(`Removed from favorites (${countBefore} left)`);
            expect(await CatalogPage.isFavoritesCounterDisplayed()).toBe(false);
        });
    });
});
