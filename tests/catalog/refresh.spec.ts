import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import { CREDENTIALS, PRODUCTS, CATEGORIES, PRODUCT_COUNTS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('Catalog Refresh', () => {
    before(async () => {
        await LoginPage.open();
        await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
        await CatalogPage.waitForProductsLoaded();
    });

    beforeEach(() => {
        Reporter.addFeature('Catalog');
    });

    afterEach(async () => {
        await CatalogPage.clearSearch();
        await CatalogPage.selectCategory(CATEGORIES.ALL);
    });

    describe('P2 - Scroll up does not trigger Refresh (Bug)', () => {
        it('should not show refresh toast when scrolling down then scrolling back up', async () => {
            Reporter.addSeverity('normal');
            Reporter.addDescription(
                'KNOWN BUG: Scrolling up (swiping down to go back to top) triggers the ' +
                '"Products refreshed!" toast even though the user is just navigating the list.'
            );

            await CatalogPage.scrollDownOnGrid();
            expect(await CatalogPage.isRefreshToastDisplayed()).toBe(false);

            await CatalogPage.pullToRefreshOnGrid();
            expect(await CatalogPage.isRefreshToastDisplayed()).toBe(false);
        });
    });

    describe('P2 - Pull to Refresh on Product Grid', () => {
        it('should refresh and show "Products refreshed!" toast when swiping down on the product grid', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.pullToRefreshOnGrid();

            expect(await CatalogPage.isRefreshToastDisplayed()).toBe(true);
            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.TOTAL} products found`);
        });
    });

    describe('P1 - Refresh', () => {
        it('should show toast and keep all products after refresh', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.tapRefresh();

            expect(await CatalogPage.isRefreshToastDisplayed()).toBe(true);
            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.TOTAL} products found`);
        });

        it('should preserve search filter after refresh', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.searchProduct('Wireless');
            expect(await CatalogPage.getProductCount()).toContain('1 products found');

            await CatalogPage.tapRefresh();

            expect(await CatalogPage.isRefreshToastDisplayed()).toBe(true);
            expect(await CatalogPage.getProductCount()).toContain('1 products found');
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.WIRELESS_HEADPHONES);
        });

        it('should preserve category filter after refresh', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.selectCategory(CATEGORIES.SPORTS);
            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.PER_CATEGORY} products found`);

            await CatalogPage.tapRefresh();

            expect(await CatalogPage.isRefreshToastDisplayed()).toBe(true);
            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.PER_CATEGORY} products found`);
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.RUNNING_SHOES);
            expect(names).toContain(PRODUCTS.YOGA_MAT);
        });

        it('should preserve both search and category filters after refresh', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.selectCategory(CATEGORIES.ELECTRONICS);
            await CatalogPage.searchProduct('Wireless');
            expect(await CatalogPage.getProductCount()).toContain('1 products found');

            await CatalogPage.tapRefresh();

            expect(await CatalogPage.isRefreshToastDisplayed()).toBe(true);
            expect(await CatalogPage.getProductCount()).toContain('1 products found');
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.WIRELESS_HEADPHONES);
        });
    });
});
