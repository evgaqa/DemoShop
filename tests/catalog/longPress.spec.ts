import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import { CREDENTIALS, PRODUCTS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('Long Press', () => {
    before(async () => {
        await LoginPage.open();
        await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
        await CatalogPage.waitForProductsLoaded();
    });

    beforeEach(() => {
        Reporter.addFeature('Catalog');
    });

    afterEach(async () => {
        if (await CatalogPage.isContextMenuDisplayed(PRODUCTS.WIRELESS_HEADPHONES)) {
            await CatalogPage.tapContextMenuOption(PRODUCTS.WIRELESS_HEADPHONES, 'Close');
        }
        if (await CatalogPage.isFavoriteActive(PRODUCTS.WIRELESS_HEADPHONES)) {
            await CatalogPage.toggleWishlist(PRODUCTS.WIRELESS_HEADPHONES);
        }
    });

    describe('P1 - Long Press', () => {
        it('should show Long press detected toast and context menu on long press', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.longPressProductCard(PRODUCTS.WIRELESS_HEADPHONES);

            expect(await CatalogPage.isActionToastDisplayed()).toBe(true);
            expect(await CatalogPage.getToastText()).toBe('Long press detected');
            expect(await CatalogPage.isContextMenuDisplayed(PRODUCTS.WIRELESS_HEADPHONES)).toBe(true);
        });

        it('should close context menu when Close is tapped', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.longPressProductCard(PRODUCTS.WIRELESS_HEADPHONES);

            expect(await CatalogPage.isActionToastDisplayed()).toBe(true);
            expect(await CatalogPage.getToastText()).toBe('Long press detected');

            await CatalogPage.tapContextMenuOption(PRODUCTS.WIRELESS_HEADPHONES, 'Close');

            expect(await CatalogPage.isContextMenuDisplayed(PRODUCTS.WIRELESS_HEADPHONES)).toBe(false);
        });

        it('should show cart popup when Quick Add is selected from context menu', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.longPressProductCard(PRODUCTS.WIRELESS_HEADPHONES);

            expect(await CatalogPage.isActionToastDisplayed()).toBe(true);
            expect(await CatalogPage.getToastText()).toBe('Long press detected');

            await CatalogPage.tapContextMenuOption(PRODUCTS.WIRELESS_HEADPHONES, 'Quick Add');

            expect(await CatalogPage.isActionToastDisplayed()).toBe(true);
            expect(await CatalogPage.getToastText()).toBe(`${PRODUCTS.WIRELESS_HEADPHONES} added to cart!`);
        });

        it('should show favorites popup when Quick Favorite is selected from context menu', async () => {
            Reporter.addSeverity('normal');

            const countBefore = Number(await CatalogPage.getFavoritesCount());

            await CatalogPage.longPressProductCard(PRODUCTS.WIRELESS_HEADPHONES);

            expect(await CatalogPage.isActionToastDisplayed()).toBe(true);
            expect(await CatalogPage.getToastText()).toBe('Long press detected');

            await CatalogPage.tapContextMenuOption(PRODUCTS.WIRELESS_HEADPHONES, 'Quick Favorite');

            expect(await CatalogPage.isActionToastDisplayed()).toBe(true);
            expect(await CatalogPage.getToastText()).toBe(`Added to favorites (${countBefore + 1} total)`);
            expect(await CatalogPage.getFavoritesCount()).toBe(String(countBefore + 1));
        });
    });
});
