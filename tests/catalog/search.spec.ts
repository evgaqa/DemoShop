import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import { CREDENTIALS, PRODUCTS, PRODUCT_COUNTS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('Product Search', () => {
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
    });

    describe('P1 - Product Search', () => {
        it('should filter products by search term', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.searchProduct('Wireless');

            expect(await CatalogPage.getProductCount()).toContain('1 products found');
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.WIRELESS_HEADPHONES);
        });

        it('should filter products by partial name match', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.searchProduct('Watch');

            expect(await CatalogPage.getProductCount()).toContain('1 products found');
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.SMART_WATCH);
        });

        it('should show multiple results when search matches several products', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.searchProduct('a'); // matches Yoga Mat, Smart Watch, etc.

            const names = await CatalogPage.getVisibleProductNames();
            expect(names.length).toBeGreaterThan(1);
        });

        it('should show no results for non-existent product', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.searchProduct('NonExistentProduct12345');

            expect(await CatalogPage.getProductCount()).toContain('0 products found');
            expect(await CatalogPage.isNoResultsDisplayed()).toBe(true);
            expect(await CatalogPage.isClearFiltersDisplayed()).toBe(true);
        });

        it('should restore all products when Clear filters is tapped', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.searchProduct('NonExistentProduct12345');
            expect(await CatalogPage.getProductCount()).toContain('0 products found');

            await CatalogPage.tapClearFilters();

            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.TOTAL} products found`);
            expect(await CatalogPage.isNoResultsDisplayed()).toBe(false);
        });

        it('should show all products when search is cleared', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.searchProduct('Yoga');
            expect(await CatalogPage.getProductCount()).toContain('1 products found');

            await CatalogPage.clearSearch();

            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.TOTAL} products found`);
            const names = await CatalogPage.getVisibleProductNames();
            expect(names.length).toBe(PRODUCT_COUNTS.TOTAL);
        });
    });
});
