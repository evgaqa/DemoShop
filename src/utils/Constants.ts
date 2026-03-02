export const CREDENTIALS = {
    VALID_EMAIL: process.env.TEST_EMAIL ?? 'user@test.com',
    VALID_PASSWORD: process.env.TEST_PASSWORD ?? 'password123',
    INVALID_EMAIL: 'wrong@test.com',
    INVALID_PASSWORD: 'wrongpass',
};

export const PRODUCTS = {
    WIRELESS_HEADPHONES: 'Wireless Headphones',
    SMART_WATCH: 'Smart Watch',
    RUNNING_SHOES: 'Running Shoes',
    YOGA_MAT: 'Yoga Mat',
    COFFEE_MAKER: 'Coffee Maker',
    DESK_LAMP: 'Desk Lamp',
} as const;

export const PRICES = {
    'Wireless Headphones': 99.99,
    'Smart Watch': 249.99,
    'Running Shoes': 79.99,
    'Yoga Mat': 29.99,
    'Coffee Maker': 89.99,
    'Desk Lamp': 39.99,
} as const;

/** Expected product counts based on current catalog data. Update if catalog changes. */
export const PRODUCT_COUNTS = {
    TOTAL: 6,        // all products across all categories
    PER_CATEGORY: 2, // products per individual category (Electronics, Sports, Home)
} as const;

export const CATEGORIES = {
    ALL: 'All',
    ELECTRONICS: 'Electronics',
    SPORTS: 'Sports',
    HOME: 'Home',
} as const;

export const TIMEOUTS = {
    SHORT: 3000,
    DEFAULT: 10000,
    LONG: 30000,
} as const;
