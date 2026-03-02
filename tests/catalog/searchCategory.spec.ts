import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import { CREDENTIALS, PRODUCTS, CATEGORIES, PRODUCT_COUNTS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('Search + Category Filter Combination', () => {
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

    describe('P1 - Category then Search', () => {
        it('should find Wireless Headphones when Electronics + "Wireless"', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.selectCategory(CATEGORIES.ELECTRONICS);
            await CatalogPage.searchProduct('Wireless');

            expect(await CatalogPage.getProductCount()).toContain('1 products found');
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.WIRELESS_HEADPHONES);
        });

        it('should find Smart Watch when Electronics + "Smart"', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.selectCategory(CATEGORIES.ELECTRONICS);
            await CatalogPage.searchProduct('Smart');

            expect(await CatalogPage.getProductCount()).toContain('1 products found');
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.SMART_WATCH);
        });

        it('should find Yoga Mat when Sports + "Yoga"', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.selectCategory(CATEGORIES.SPORTS);
            await CatalogPage.searchProduct('Yoga');

            expect(await CatalogPage.getProductCount()).toContain('1 products found');
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.YOGA_MAT);
        });

        it('should show 0 results when category and search term do not overlap', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.selectCategory(CATEGORIES.ELECTRONICS);
            await CatalogPage.searchProduct('Shoes'); // Running Shoes is Sports, not Electronics

            expect(await CatalogPage.getProductCount()).toContain('0 products found');
            expect(await CatalogPage.isNoResultsDisplayed()).toBe(true);
            expect(await CatalogPage.isClearFiltersDisplayed()).toBe(true);
        });
    });

    describe('P1 - Search then Category', () => {
        it('should narrow results when search is applied before category', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.searchProduct('Maker'); // Coffee Maker
            await CatalogPage.selectCategory(CATEGORIES.HOME);

            expect(await CatalogPage.getProductCount()).toContain('1 products found');
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.COFFEE_MAKER);
        });

        it('should show 0 results when search term is outside selected category', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.searchProduct('Wireless'); // Electronics
            await CatalogPage.selectCategory(CATEGORIES.SPORTS);

            expect(await CatalogPage.getProductCount()).toContain('0 products found');
            expect(await CatalogPage.isNoResultsDisplayed()).toBe(true);
        });
    });

    describe('P1 - Clear Filters resets both', () => {
        it('should restore all products after Clear filters with both active', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.selectCategory(CATEGORIES.ELECTRONICS);
            await CatalogPage.searchProduct('Shoes');
            expect(await CatalogPage.getProductCount()).toContain('0 products found');

            await CatalogPage.tapClearFilters();

            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.TOTAL} products found`);
            expect(await CatalogPage.isNoResultsDisplayed()).toBe(false);
        });
    });
});
