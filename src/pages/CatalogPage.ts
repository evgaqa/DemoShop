import { BasePage } from './BasePage.js';
import { MobileGestures } from '../gestures/MobileGestures.js';
import { TIMEOUTS } from '../utils/Constants.js';
import { BOTTOM_SHEET_SELECTOR } from './CartModal.js';

class CatalogPage extends BasePage {
    // Static selectors
    private get searchInput() { return '[data-testid="search-input"]'; }
    private get categoryDropdown() { return '[data-testid="category-dropdown-trigger"]'; }
    private get refreshButton() { return '[data-testid="refresh-button"]'; }
    private get productCountText() { return '//p[contains(normalize-space(.),"products found")]'; }
    private get noResultsMessage() { return '//p[normalize-space(.)="No products found"]'; }
    private get clearFiltersButton() { return '//button[normalize-space(.)="Clear filters"]'; }
    private get refreshToast() { return '//*[normalize-space(.)="Products refreshed!"]'; }

    // Find the product card root by data-testid prefix and h3 product name
    private productCard(productName: string): string {
        return `//div[contains(@data-testid,"product-card") and .//h3[normalize-space(.)="${productName}"]]`;
    }

    async searchProduct(name: string): Promise<void> {
        await this.setValue(this.searchInput, name);
    }

    async clearSearch(): Promise<void> {
        await browser.waitUntil(
            async () => !(await this.isDisplayed('[data-testid="toast-notification"]', 100)),
            { timeout: TIMEOUTS.DEFAULT, interval: 300, timeoutMsg: 'Toast did not disappear before clearSearch' }
        );
        const element = await this.waitForElement(this.searchInput);
        await element.click();
        await browser.keys(['Control', 'a']);
        await browser.keys(['Delete']);
    }

    async selectCategory(category: string): Promise<void> {
        await this.tap(this.categoryDropdown);
        await this.tap(`//*[normalize-space(text())="${category}"]`);
    }

    async addToCart(productName: string): Promise<void> {
        const button = await $(
            `${this.productCard(productName)}//button[contains(normalize-space(.),"Add to Cart")]`
        );
        await button.waitForClickable({ timeout: TIMEOUTS.DEFAULT });
        await button.click();
    }

    async isAddToCartEnabled(productName: string): Promise<boolean> {
        const button = await $(
            `${this.productCard(productName)}//button[contains(normalize-space(.),"Add to Cart") or contains(normalize-space(.),"Out of Stock")]`
        );
        await button.waitForExist({ timeout: TIMEOUTS.DEFAULT });
        const text = await button.getText();
        if (text.includes('Out of Stock')) {
            return false;
        }
        return button.isEnabled();
    }

    async getProductPrice(productName: string): Promise<string> {
        const price = await $(
            `${this.productCard(productName)}//*[contains(normalize-space(text()),"$") and not(contains(.,"Total"))]`
        );
        return price.getText();
    }

    async getProductStock(productName: string): Promise<string> {
        const stock = await $(
            `${this.productCard(productName)}//*[contains(normalize-space(.),"stock") or contains(normalize-space(.),"Stock")]`
        );
        return stock.getText();
    }

    async toggleWishlist(productName: string): Promise<void> {
        // The wishlist button is the non-Add-to-Cart/non-Out-of-Stock button in the card
        const heart = await $(
            `${this.productCard(productName)}//button[not(contains(normalize-space(.),"Add to Cart")) and not(contains(normalize-space(.),"Out of Stock"))]`
        );
        await heart.waitForClickable({ timeout: TIMEOUTS.DEFAULT });
        await heart.click();
    }

    async getCartBadgeCount(): Promise<string> {
        try {
            const badge = await $('[data-testid="cart-badge"]');
            await badge.waitForExist({ timeout: TIMEOUTS.SHORT });
            return badge.getText();
        } catch {
            return '0';
        }
    }

    async getHeaderTotal(): Promise<string> {
        return this.getText('[data-testid="cart-total"]');
    }

    async openCart(): Promise<void> {
        await this.tap('//*[@data-testid="cart-icon"]/ancestor::button[1]');
        await browser.waitUntil(
            async () => this.isDisplayed(BOTTOM_SHEET_SELECTOR, 100),
            { timeout: TIMEOUTS.DEFAULT, interval: 200, timeoutMsg: 'Cart modal did not open after tapping cart icon' }
        );
    }

    async openProductView(productName: string): Promise<void> {
        const image = await $(
            `${this.productCard(productName)}//*[contains(@data-testid,"product-image")]`
        );
        await image.waitForClickable({ timeout: TIMEOUTS.DEFAULT });
        await image.click();
    }

    async tapRefresh(): Promise<void> {
        await this.tap(this.refreshButton);
    }

    async isRefreshToastDisplayed(): Promise<boolean> {
        return this.isDisplayed(this.refreshToast, TIMEOUTS.SHORT);
    }

    async getProductCount(): Promise<string> {
        return this.getText(this.productCountText);
    }

    async isNoResultsDisplayed(): Promise<boolean> {
        return this.isDisplayed(this.noResultsMessage);
    }

    async isClearFiltersDisplayed(): Promise<boolean> {
        return this.isDisplayed(this.clearFiltersButton);
    }

    async tapClearFilters(): Promise<void> {
        await this.tap(this.clearFiltersButton);
    }

    async isCatalogDisplayed(): Promise<boolean> {
        return this.isDisplayed(this.searchInput, TIMEOUTS.DEFAULT);
    }

    async waitForProductsLoaded(): Promise<void> {
        // Wait until at least one Add to Cart or Out of Stock button is visible
        await browser.waitUntil(
            async () => {
                const buttons = await $$('//button[contains(normalize-space(.),"Add to Cart") or contains(normalize-space(.),"Out of Stock")]');
                // ChainablePromiseArray.length is Promise<number> in WDIO v9 — must be awaited
                return (await buttons.length) > 0;
            },
            { timeout: 15000, interval: 1000, timeoutMsg: 'Products did not load within 15s' }
        );
    }

    async getVisibleProductNames(): Promise<string[]> {
        const names: string[] = [];
        const cards = await $$('//div[contains(@data-testid,"product-card")]//h3');
        for (const card of cards) {
            names.push(await card.getText());
        }
        return names;
    }

    async getStockIndicatorText(productName: string): Promise<string> {
        return this.getText(
            `${this.productCard(productName)}//*[contains(@data-testid,"stock-indicator")]`
        );
    }

    async tapOutOfStockButton(productName: string): Promise<void> {
        const button = await $(
            `${this.productCard(productName)}//button[contains(normalize-space(.),"Out of Stock")]`
        );
        await button.waitForExist({ timeout: TIMEOUTS.DEFAULT });
        await browser.execute((el: HTMLElement) => el.click(), button as any);
    }

    async isRatingDisplayed(productName: string): Promise<boolean> {
        return this.isDisplayed(
            `${this.productCard(productName)}//*[contains(@class,"lucide-star")]`
        );
    }

    async getProductRating(productName: string): Promise<string> {
        return this.getText(
            `${this.productCard(productName)}//*[contains(@class,"lucide-star")]/following-sibling::span`
        );
    }

    async isProductCardDisplayed(productName: string): Promise<boolean> {
        return this.isDisplayed(this.productCard(productName), TIMEOUTS.DEFAULT);
    }

    async isProductImageDisplayed(productName: string): Promise<boolean> {
        return this.isDisplayed(`${this.productCard(productName)}//*[contains(@data-testid,"product-image")]`);
    }

    async isFavoriteButtonDisplayed(productName: string): Promise<boolean> {
        return this.isDisplayed(
            `${this.productCard(productName)}//button[contains(@data-testid,"favorite-button")]`
        );
    }

    async isFavoriteActive(productName: string): Promise<boolean> {
        try {
            const svg = await $(
                `${this.productCard(productName)}//button[contains(@data-testid,"favorite-button")]//svg`
            );
            await svg.waitForExist({ timeout: TIMEOUTS.SHORT });
            const fill = await svg.getAttribute('fill');
            return fill !== 'none' && fill !== null;
        } catch {
            return false;
        }
    }

    async pullToRefreshOnGrid(): Promise<void> {
        const price = await $(
            '//span[contains(@class,"font-bold") and starts-with(normalize-space(.),"$")]'
        );
        await price.waitForDisplayed({ timeout: TIMEOUTS.DEFAULT });
        // WDIO v9: await $() returns ChainablePromiseElement whose `parent` type differs from
        // WebdriverIO.Element, making direct assignment structurally incompatible in TypeScript.
        // The cast is safe — at runtime both types share the same underlying element object.
        await MobileGestures.swipeDownJS(price as unknown as WebdriverIO.Element);
    }

    async longPressProductCard(productName: string): Promise<void> {
        const image = await $(
            `${this.productCard(productName)}//*[contains(@data-testid,"product-image")]`
        );
        await image.waitForDisplayed({ timeout: TIMEOUTS.DEFAULT });
        // Same WDIO v9 ChainablePromiseElement structural incompatibility — see pullToRefreshOnGrid
        await MobileGestures.longPressJS(image as unknown as WebdriverIO.Element);
    }

    async isContextMenuDisplayed(productName: string): Promise<boolean> {
        return this.isDisplayed(
            `${this.productCard(productName)}//*[contains(@data-testid,"context-menu")]`,
            TIMEOUTS.SHORT
        );
    }

    async tapContextMenuOption(productName: string, option: string): Promise<void> {
        const btn = await $(
            `${this.productCard(productName)}//*[contains(@data-testid,"context-menu")]//button[normalize-space(.)="${option}"]`
        );
        await btn.waitForClickable({ timeout: TIMEOUTS.DEFAULT });
        await btn.click();
    }

    async isActionToastDisplayed(): Promise<boolean> {
        return this.isDisplayed('[data-testid="toast-notification"]', TIMEOUTS.SHORT);
    }

    async getToastText(): Promise<string> {
        return this.getText('[data-testid="toast-notification"]');
    }

    async waitForToast(timeout: number = TIMEOUTS.DEFAULT): Promise<void> {
        await browser.waitUntil(
            async () => this.isDisplayed('[data-testid="toast-notification"]', 100),
            { timeout, interval: 200, timeoutMsg: 'Toast notification did not appear' }
        );
    }

    async waitForToastToDisappear(timeout: number = TIMEOUTS.DEFAULT): Promise<void> {
        await browser.waitUntil(
            async () => !(await this.isDisplayed('[data-testid="toast-notification"]', 100)),
            { timeout, interval: 200, timeoutMsg: 'Toast notification did not disappear' }
        );
    }

    async getFavoritesCount(): Promise<string> {
        try {
            const counter = await $('[data-testid="favorites-count"]');
            await counter.waitForExist({ timeout: TIMEOUTS.SHORT });
            return (await counter.getText()).trim();
        } catch {
            return '0';
        }
    }

    async isFavoritesCounterDisplayed(): Promise<boolean> {
        return this.isDisplayed('[data-testid="favorites-count"]', TIMEOUTS.SHORT);
    }

    async getCartBadgeText(): Promise<string> {
        try {
            const badge = await $('[data-testid="cart-badge"]');
            await badge.waitForExist({ timeout: TIMEOUTS.SHORT });
            return badge.getText();
        } catch {
            return '0';
        }
    }
}

export default new CatalogPage();
