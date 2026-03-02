import { BasePage } from './BasePage.js';
import { MobileGestures } from '../gestures/MobileGestures.js';
import { TIMEOUTS } from '../utils/Constants.js';

export const BOTTOM_SHEET_SELECTOR = '[data-testid="bottom-sheet"]';

class CartModal extends BasePage {
    private get bottomSheet()    { return BOTTOM_SHEET_SELECTOR; }
    private get closeButton()    { return '[data-testid="close-bottom-sheet"]'; }
    private get totalAmount()    { return '[data-testid="bottom-sheet-total"]'; }
    private get checkoutButton() { return '[data-testid="checkout-button"]'; }
    private get cartItems()      { return '//div[contains(@data-testid,"cart-item-")]'; }

    async isCartDisplayed(): Promise<boolean> {
        return this.isDisplayed(this.bottomSheet, TIMEOUTS.DEFAULT);
    }

    async getItemCount(): Promise<number> {
        try {
            const items = await $$(this.cartItems);
            return items.length;
        } catch {
            return 0;
        }
    }

    async getItemNames(): Promise<string[]> {
        const names: string[] = [];
        const headings = await $$(`${this.cartItems}//h3`);
        for (const h of headings) {
            names.push(await h.getText());
        }
        return names;
    }

    async getTotal(): Promise<string> {
        return this.getText(this.totalAmount);
    }

    async removeItem(name: string): Promise<void> {
        // From the h3 name → up to the flex wrapper (parent) → following-sibling remove button
        const removeBtn = await $(
            `//h3[normalize-space(.)="${name}"]/../following-sibling::button[contains(@data-testid,"remove-cart-item")]`
        );
        await removeBtn.waitForClickable({ timeout: TIMEOUTS.DEFAULT });
        await removeBtn.click();
    }

    async swipeToDelete(name: string): Promise<void> {
        // From the h3 name → up to the cart-item root div
        const item = await $(
            `//h3[normalize-space(.)="${name}"]/ancestor::div[contains(@data-testid,"cart-item-")]`
        );
        await MobileGestures.swipeLeftJS(item);
    }

    async tapCheckout(): Promise<void> {
        await this.tap(this.checkoutButton);
    }

    async close(): Promise<void> {
        await this.tap(this.closeButton);
    }

    async isCheckoutButtonDisplayed(): Promise<boolean> {
        return this.isDisplayed(this.checkoutButton);
    }
}

export default new CartModal();
