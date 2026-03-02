import LoginPage from '../../src/pages/LoginPage.js';
import CatalogPage from '../../src/pages/CatalogPage.js';
import { CREDENTIALS, CATEGORIES, PRODUCTS, PRODUCT_COUNTS } from '../../src/utils/Constants.js';
import { Reporter } from '../../src/utils/Reporter.js';

describe('Category Filter', () => {
    before(async () => {
        await LoginPage.open();
        await LoginPage.login(CREDENTIALS.VALID_EMAIL, CREDENTIALS.VALID_PASSWORD);
        await CatalogPage.waitForProductsLoaded();
    });

    beforeEach(() => {
        Reporter.addFeature('Catalog');
    });

    afterEach(async () => {
        await CatalogPage.selectCategory(CATEGORIES.ALL);
    });

    describe('P1 - Category Filter', () => {
        it('should filter products by Electronics category', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.selectCategory(CATEGORIES.ELECTRONICS);

            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.PER_CATEGORY} products found`);
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.WIRELESS_HEADPHONES);
            expect(names).toContain(PRODUCTS.SMART_WATCH);
            expect(names.length).toBe(PRODUCT_COUNTS.PER_CATEGORY);
        });

        it('should filter products by Sports category', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.selectCategory(CATEGORIES.SPORTS);

            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.PER_CATEGORY} products found`);
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.RUNNING_SHOES);
            expect(names).toContain(PRODUCTS.YOGA_MAT);
            expect(names.length).toBe(PRODUCT_COUNTS.PER_CATEGORY);
        });

        it('should filter products by Home category', async () => {
            Reporter.addSeverity('critical');

            await CatalogPage.selectCategory(CATEGORIES.HOME);

            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.PER_CATEGORY} products found`);
            const names = await CatalogPage.getVisibleProductNames();
            expect(names).toContain(PRODUCTS.COFFEE_MAKER);
            expect(names).toContain(PRODUCTS.DESK_LAMP);
            expect(names.length).toBe(PRODUCT_COUNTS.PER_CATEGORY);
        });

        it('should show all products with All category', async () => {
            Reporter.addSeverity('normal');

            await CatalogPage.selectCategory(CATEGORIES.ELECTRONICS);
            await CatalogPage.selectCategory(CATEGORIES.ALL);

            expect(await CatalogPage.getProductCount()).toContain(`${PRODUCT_COUNTS.TOTAL} products found`);
            const names = await CatalogPage.getVisibleProductNames();
            expect(names.length).toBe(PRODUCT_COUNTS.TOTAL);
        });
    });
});
