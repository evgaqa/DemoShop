# DemoShop Mobile Automation Framework

Mobile test automation framework for the DemoShop React Native web app, targeting Android Chrome via Appium.

![Demo](demo.gif)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Language | TypeScript 5.x | Type-safe test code, strict mode enabled |
| Test Runner | Mocha (via WebdriverIO) | Describe/it blocks, before/after hooks |
| Assertions | WebdriverIO `expect` | Jest-compatible built-in assertions |
| Mobile Driver | Appium 2.x + UiAutomator2 | Drives Android Chrome on device/emulator |
| Client Library | WebdriverIO v9 | Browser/element API, W3C Actions |
| Gestures | JavaScript Touch Events | Pinch-to-zoom, swipe, long press, pull-to-refresh |
| Reporting | Allure 2 | HTML reports with steps, screenshots, severity |
| Code Quality | ESLint + Prettier | Static analysis + formatting enforcement |
| Config | dotenv | Environment-based configuration |

---

## Project Structure

```
DemoShop/
├── config/
│   ├── wdio.conf.ts              # WebdriverIO runner + Appium service config
│   └── capabilities.ts           # Android Chrome device capabilities
│
├── src/
│   ├── pages/                    # Page Object Model
│   │   ├── BasePage.ts           # Shared: waitForElement, tap, getText, isDisplayed
│   │   ├── LoginPage.ts          # Login form, remember-me, validation errors
│   │   ├── CatalogPage.ts        # Product grid, search, category filter, cart badge, toasts
│   │   ├── CartModal.ts          # Bottom-sheet cart: items, total, remove, swipe-to-delete
│   │   └── ProductViewModal.ts   # Product image viewer: zoom controls, pinch gesture
│   ├── gestures/
│   │   └── MobileGestures.ts     # JS touch event implementations (pinch, swipe, long press)
│   └── utils/
│       ├── Constants.ts          # CREDENTIALS, PRODUCTS, PRICES, CATEGORIES, TIMEOUTS, PRODUCT_COUNTS
│       └── Reporter.ts           # Allure helper: addFeature, addSeverity, addScreenshot
│
├── tests/
│   ├── login/
│   │   ├── emailPassword.spec.ts # P0/P1 — credential validation (25 cases)
│   │   └── rememberMe.spec.ts    # P1 — session persistence (6 cases)
│   ├── catalog/
│   │   ├── category.spec.ts      # P1 — category filter (4 cases)
│   │   ├── search.spec.ts        # P1 — product search (6 cases)
│   │   ├── searchCategory.spec.ts# P1 — combined search + filter (7 cases)
│   │   ├── productCard.spec.ts   # P1 — card UI, add to cart, out-of-stock (9 cases)
│   │   ├── wishlist.spec.ts      # P1 — favorites add/remove (2 cases)
│   │   ├── longPress.spec.ts     # P1 — long press context menu (4 cases)
│   │   ├── refresh.spec.ts       # P1/P2 — pull-to-refresh, filter persistence (6 cases)
│   │   ├── cart.spec.ts          # P0–P2 — add, total, remove, swipe, edge cases (11 cases)
│   │   └── productView.spec.ts   # P2 — product modal, zoom buttons, pinch gesture (7 cases)
│   └── e2e/
│       └── purchaseFlow.spec.ts  # P0 — full happy path: login → browse → cart → checkout (7 steps)
│
├── .env                          # Local environment overrides (not committed to CI secrets)
├── .eslintrc.json                # ESLint rules (TypeScript + WebdriverIO plugins)
├── .prettierrc                   # Prettier formatting config
├── package.json
└── tsconfig.json
```

---

## Prerequisites

1. **Node.js** >= 18
2. **Java JDK** >= 11 (required by Appium)
3. **Android SDK** — emulator or physical device connected via ADB
4. **Appium 2.x** installed globally:
   ```bash
   npm install -g appium
   appium driver install uiautomator2
   ```
5. **Chrome** installed on the Android device/emulator
6. **Chromedriver** matching your device's Chrome version placed in `./chromedrivers/`

---

## Setup

```bash
# 1. Install dependencies (includes ESLint, Prettier, TypeScript, WebdriverIO)
npm install

# 2. Configure your environment
cp .env .env.local   # optional — .env already has sensible defaults
# Edit .env and set DEVICE_NAME and PLATFORM_VERSION to match your device
```

### Environment Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://qa-mobile-automation.vercel.app/` | App URL under test |
| `APPIUM_HOST` | `localhost` | Appium server host |
| `APPIUM_PORT` | `4723` | Appium server port |
| `DEVICE_NAME` | `emulator-5554` | ADB device name (`adb devices` to find yours) |
| `PLATFORM_VERSION` | `13` | Android OS version on the device |
| `IMPLICIT_TIMEOUT` | `10000` | Default element wait timeout (ms) |
| `TEST_TIMEOUT` | `60000` | Mocha test timeout (ms) |
| `TEST_EMAIL` | `user@test.com` | Login credential — override for CI |
| `TEST_PASSWORD` | `password123` | Login credential — override for CI |
| `CHROMEDRIVER_PATH` | `./chromedrivers/chromedriver.exe` | Path to chromedriver binary |

---

## Running Tests

### 1. Start Appium server
```bash
appium
```

### 2. Run all tests
```bash
npm test
```

### 3. Run by feature area

| Command | Spec file(s) |
|---------|-------------|
| `npm run test:loginEmailPassword` | `tests/login/emailPassword.spec.ts` |
| `npm run test:loginRememberMe` | `tests/login/rememberMe.spec.ts` |
| `npm run test:catalog` | `tests/catalog/*.spec.ts` (all catalog specs) |
| `npm run test:search` | `tests/catalog/search.spec.ts` |
| `npm run test:category` | `tests/catalog/category.spec.ts` |
| `npm run test:searchCategory` | `tests/catalog/searchCategory.spec.ts` |
| `npm run test:productCard` | `tests/catalog/productCard.spec.ts` |
| `npm run test:wishlist` | `tests/catalog/wishlist.spec.ts` |
| `npm run test:longPress` | `tests/catalog/longPress.spec.ts` |
| `npm run test:refresh` | `tests/catalog/refresh.spec.ts` |
| `npm run test:cart` | `tests/catalog/cart.spec.ts` |
| `npm run test:product-view` | `tests/catalog/productView.spec.ts` |
| `npm run test:e2e` | `tests/e2e/purchaseFlow.spec.ts` |

### 4. Run a single spec directly
```bash
npx wdio run config/wdio.conf.ts --spec tests/catalog/cart.spec.ts
```

---

## Spec Files

### `tests/login/emailPassword.spec.ts`
Validates login form behaviour — 25 test cases across two priority groups.

| Priority | Test cases |
|----------|-----------|
| P0 | Valid login, 12 invalid email formats (wrong domain, SQL injection, XSS, etc.), 8 invalid password cases, empty fields |
| P1 | Page elements visible, remember-me toggle, spaces trimmed in email, Enter key submits, double-click prevention |

### `tests/login/rememberMe.spec.ts`
Validates session persistence depending on the Remember Me checkbox — 6 test cases.

| Scenario | Tests |
|----------|-------|
| Remember Me OFF | Stays logged in after refresh, stays logged in in new tab, logs out after browser restart (sessionStorage cleared) |
| Remember Me ON | Stays logged in after refresh, stays logged in in new tab, stays logged in after browser restart (localStorage persists) |

### `tests/catalog/category.spec.ts`
Validates the category dropdown filter — 4 test cases.
Asserts correct product count and product names for Electronics, Sports, Home, and All.

### `tests/catalog/search.spec.ts`
Validates the search input — 6 test cases.
Covers exact match, partial match, multiple results, no results, Clear filters, and search reset.

### `tests/catalog/searchCategory.spec.ts`
Validates search and category filter used in combination — 7 test cases.
Covers category-then-search, search-then-category, and Clear filters resetting both.

### `tests/catalog/productCard.spec.ts`
Validates product card UI and interactions — 9 test cases.
Covers image display, star rating, favourite button, add-to-cart badge increment, cart confirmation toast, out-of-stock state, and stock indicator text.

### `tests/catalog/wishlist.spec.ts`
Validates the favourites/wishlist feature — 2 test cases.
Asserts toast message and counter increment on add, and counter hidden on remove.

### `tests/catalog/longPress.spec.ts`
Validates long-press context menu on a product card — 4 test cases.
Covers menu appearing, Close button, Quick Add to cart, and Quick Favorite.

### `tests/catalog/refresh.spec.ts`
Validates the refresh button and pull-to-refresh gesture — 6 test cases.
Asserts Products refreshed! toast and that active search/category filters survive a refresh.

### `tests/catalog/cart.spec.ts`
Validates the shopping cart end-to-end — 11 test cases across 5 groups.

| Priority | Group | Tests |
|----------|-------|-------|
| P0 | Add to Cart | Add single item, increment badge with multiple items, header total updates |
| P0 | Cart Total (Bug) | Total is a valid `$N.NN` price ⚠️, header total format ⚠️ |
| P1 | Remove from Cart | Remove item via X button |
| P1 | Checkout | Checkout button visible, toast on tap |
| P2 | Swipe to Delete | Swipe left removes item |
| P2 | Edge Cases | Duplicate items, separate cart entries |

> ⚠️ Cart total tests are **designed to fail** — they document a known concatenation bug in the app.

### `tests/catalog/productView.spec.ts`
Validates the product image viewer modal — 7 test cases.
Covers modal open, product name, initial zoom level, zoom-in button, zoom-out button, pinch-to-zoom gesture, and modal close.

### `tests/e2e/purchaseFlow.spec.ts`
Full happy-path end-to-end flow — 7 sequential steps run after a single login in `before()`.

| Step | Action | Assert |
|------|--------|--------|
| 1 | Catalog loads | 6 products visible |
| 2 | Search | 1 result returned, search cleared |
| 3 | Add product 1 | Badge increments by 1 |
| 4 | Add product 2 | Badge increments by 1 |
| 5 | Open cart | Modal visible, ≥ 2 items |
| 6 | Verify total | Numeric price format ⚠️ |
| 7 | Checkout | Checkout button tapped |

---

## Reporting

```bash
# Generate HTML report from the last test run
npm run report:generate

# Open the report in a browser
npm run report:open
```

Allure reports include per-test severity, feature tags, step descriptions, and failure screenshots.

---

## Code Quality

```bash
# Check for lint errors
npm run lint

# Auto-fix fixable lint errors
npm run lint:fix

# Format all source files
npm run format
```

### ESLint
Configured in `.eslintrc.json` with three rule sets:

| Plugin | What it checks |
|--------|---------------|
| `eslint:recommended` | Core JS rules — unused vars, no-undef, etc. |
| `@typescript-eslint/recommended` | TypeScript-specific rules — explicit types, no `any` warnings, unused vars |
| `eslint-plugin-wdio` | WebdriverIO rules — flags `browser.pause()`, enforces async/await patterns in hooks |

### Prettier
Configured in `.prettierrc`: single quotes, 4-space indent, 120-char line width, trailing commas in ES5 positions.

---

## Test Prioritization

| Priority | Spec files | Description |
|----------|-----------|-------------|
| **P0** | `emailPassword`, `cart`, `purchaseFlow` | Critical path — app is unusable if these fail |
| **P1** | `rememberMe`, `category`, `search`, `searchCategory`, `productCard`, `wishlist`, `longPress`, `refresh` | Core features — significant impact if broken |
| **P2** | `productView`, swipe/gesture tests in `cart`, `refresh` | Mobile gestures & edge cases |

---

## Known Bugs

### Cart Total Concatenation Bug
- **Severity**: Blocker
- **Location**: `CartModal` total and catalog header total
- **Expected**: `$209.97` (prices summed numerically)
- **Actual**: `$99.9979.9929.99` (prices concatenated as strings)
- **Tests**: `cart.spec.ts` → "should correctly compute cart total" and "should display header total" — both **designed to FAIL**
