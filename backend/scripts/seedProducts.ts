// npx ts-node scripts/seedProducts.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../src/models/Category';
import Product from '../src/models/Product';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugng';

type CategoryMap = Record<string, any>;

const getCategoryOrThrow = (categories: CategoryMap, slugOrSlugs: string | string[]) => {
    const slugs = Array.isArray(slugOrSlugs) ? slugOrSlugs : [slugOrSlugs];
    const category = slugs.map((slug) => categories[slug]).find(Boolean);
    if (!category) {
        throw new Error(`Category not found for slugs: ${slugs.join(', ')}. Run seedCategories first.`);
    }
    return category._id;
};

async function seedProducts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        const categoryDocs = await Category.find({});
        const categories = categoryDocs.reduce((map: CategoryMap, category: any) => {
            map[category.slug] = category;
            return map;
        }, {});

        const products = [
            {
                name: 'iPhone 15 Pro Silicone Case with MagSafe',
                slug: 'iphone-15-pro-silicone-case',
                searchAliases: ['iphone 15 case', 'magsafe case', 'silicone cover', 'protective case'],
                description: 'A silky, soft-touch silicone case with MagSafe alignment for a snug premium fit.',
                category: getCategoryOrThrow(categories, 'apple-cases-covers-silicone-cases'),
                brand: 'Apple',
                images: [
                    { url: '/products/iphone-case-black.png', key: 'iphone-case-black', alt: 'iPhone 15 Pro Case - Black', isPrimary: true },
                    { url: '/products/iphone-case-blue.png', key: 'iphone-case-blue', alt: 'iPhone 15 Pro Case - Blue', isPrimary: false }
                ],
                status: 'active',
                featured: true,
                salesCount: 45,
                views: 280,
                compatibility: { brands: ['Apple'], models: ['iPhone 15 Pro'] },
                options: [{
                    name: 'Color',
                    values: [{ value: 'Black' }, { value: 'Blue' }]
                }],
                variants: [
                    {
                        sku: 'APL-IP15P-SIL-BLK',
                        attributeValues: { Color: 'Black' },
                        sellingPrice: 35000,
                        compareAtPrice: 50000,
                        costPrice: 25000,
                        stock: 50,
                        image: '/products/iphone-case-black.png'
                    },
                    {
                        sku: 'APL-IP15P-SIL-BLU',
                        attributeValues: { Color: 'Blue' },
                        sellingPrice: 45000,
                        compareAtPrice: 50000,
                        costPrice: 35000,
                        stock: 30,
                        image: '/products/iphone-case-blue.png'
                    }
                ]
            },
            {
                name: 'iPhone 14 Clear Case with MagSafe',
                slug: 'iphone-14-clear-case',
                searchAliases: ['clear case', 'transparent cover', 'iphone 14 case', 'magsafe clear case'],
                description: 'Clear magnetic case that shows off the finish of your iPhone while protecting the frame.',
                category: getCategoryOrThrow(categories, 'apple-cases-covers-transparent-cases'),
                brand: 'Apple',
                images: [
                    { url: '/products/iphone-case-green.png', key: 'iphone-14-clear', alt: 'iPhone 14 Clear Case', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 127,
                views: 520,
                compatibility: { brands: ['Apple'], models: ['iPhone 14'] },
                options: [{
                    name: 'Color',
                    values: [{ value: 'Clear' }]
                }],
                variants: [{
                    sku: 'APL-IP14-CLR-WHT',
                    attributeValues: { Color: 'Clear' },
                    sellingPrice: 38000,
                    costPrice: 28000,
                    stock: 60,
                    image: '/products/iphone-case-green.png'
                }]
            },
            {
                name: 'iPhone 15 Privacy Tempered Glass',
                slug: 'iphone-15-privacy-tempered-glass',
                searchAliases: ['privacy screen', 'screen protector', 'tempered glass'],
                description: 'High-clarity privacy tempered glass built for iPhone 15 with edge protection.',
                category: getCategoryOrThrow(categories, 'apple-screen-protectors-privacy-screen'),
                brand: 'Apple',
                images: [
                    { url: '/products/privacy-glass.png', key: 'iphone-15-privacy-glass', alt: 'iPhone 15 Privacy Glass', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 64,
                views: 210,
                compatibility: { brands: ['Apple'], models: ['iPhone 15'] },
                variants: [{
                    sku: 'APL-IP15-PRV-GLS',
                    attributeValues: { Finish: 'Privacy' },
                    sellingPrice: 12000,
                    compareAtPrice: 16000,
                    costPrice: 6500,
                    stock: 90,
                    image: '/products/privacy-glass.png'
                }]
            },
            {
                name: 'Apple 20W USB-C Power Adapter',
                slug: 'apple-20w-usb-c-adapter',
                searchAliases: ['20w charger', 'usb c charger', 'power adapter', 'iphone fast charger'],
                description: 'Fast, efficient charging at home, in the office, or on the go.',
                category: getCategoryOrThrow(categories, 'apple-chargers-cables-fast-chargers'),
                brand: 'Apple',
                images: [
                    { url: '/products/apple-adapter.png', key: 'apple-20w-adapter', alt: 'Apple 20W Adapter', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 98,
                views: 430,
                compatibility: { brands: ['Apple'], models: ['iPhone 15', 'iPhone 14', 'iPad Pro'] },
                variants: [{
                    sku: 'APL-20W-ADPT-UK',
                    attributeValues: { Plug: 'UK Plug' },
                    sellingPrice: 28500,
                    costPrice: 18500,
                    stock: 100,
                    image: '/products/apple-adapter.png'
                }]
            },
            {
                name: 'Apple 1m USB-C to Lightning Cable',
                slug: 'apple-usb-c-to-lightning-cable',
                searchAliases: ['iphone cable', 'lightning cable', 'charging cord'],
                description: 'Durable 1-meter USB-C to Lightning cable for fast charging and syncing.',
                category: getCategoryOrThrow(categories, 'apple-chargers-cables-lightning-cables'),
                brand: 'Apple',
                images: [
                    { url: '/products/lightning-cable.png', key: 'lightning-cable', alt: 'Apple Lightning Cable', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 74,
                views: 260,
                compatibility: { brands: ['Apple'], models: ['iPhone 13', 'iPhone 14', 'iPhone SE'] },
                variants: [{
                    sku: 'APL-LTG-1M-WHT',
                    attributeValues: { Length: '1m' },
                    sellingPrice: 16500,
                    costPrice: 9000,
                    stock: 140,
                    image: '/products/lightning-cable.png'
                }]
            },
            {
                name: 'Samsung Galaxy S24 Ultra Grip Case',
                slug: 'samsung-s24-ultra-silicone-case',
                searchAliases: ['s24 ultra case', 'galaxy case', 'grip cover', 'protective cover'],
                description: 'This case protects your phone while providing a secure grip with a refined matte finish.',
                category: getCategoryOrThrow(categories, 'samsung-cases-covers-silicone-cases'),
                brand: 'Samsung',
                images: [
                    { url: '/products/samsung-case-gray.png', key: 'samsung-case-gray', alt: 'Samsung S24 Case - Gray', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 82,
                views: 360,
                compatibility: { brands: ['Samsung'], models: ['Galaxy S24 Ultra'] },
                options: [{
                    name: 'Color',
                    values: [{ value: 'Gray' }]
                }],
                variants: [{
                    sku: 'SAM-S24U-SIL-GRY',
                    attributeValues: { Color: 'Gray' },
                    sellingPrice: 28000,
                    compareAtPrice: 40000,
                    costPrice: 20000,
                    stock: 40,
                    image: '/products/samsung-case-gray.png'
                }]
            },
            {
                name: 'Samsung 25W Super Fast Charger',
                slug: 'samsung-25w-super-fast-charger',
                searchAliases: ['samsung charger', 'fast charger', 'usb c adapter'],
                description: 'Official-style 25W charger with stable thermal performance for modern Galaxy devices.',
                category: getCategoryOrThrow(categories, 'samsung-chargers-cables-fast-chargers'),
                brand: 'Samsung',
                images: [
                    { url: '/products/samsung-charger.png', key: 'samsung-25w', alt: 'Samsung 25W Charger', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 88,
                views: 400,
                compatibility: { brands: ['Samsung'], models: ['Galaxy S23', 'Galaxy S24', 'Galaxy A55'] },
                variants: [{
                    sku: 'SAM-25W-SFC-WHT',
                    attributeValues: { Plug: 'UK Plug' },
                    sellingPrice: 22000,
                    compareAtPrice: 28000,
                    costPrice: 14000,
                    stock: 95,
                    image: '/products/samsung-charger.png'
                }]
            },
            {
                name: 'Samsung Galaxy S24 Privacy Glass',
                slug: 'samsung-s24-privacy-glass',
                searchAliases: ['galaxy screen protector', 'privacy glass', 'tempered glass'],
                description: 'Anti-spy tempered glass for Galaxy S24 with oleophobic coating and edge support.',
                category: getCategoryOrThrow(categories, 'samsung-screen-protectors-privacy-screen'),
                brand: 'Samsung',
                images: [
                    { url: '/products/samsung-glass.png', key: 'samsung-privacy-glass', alt: 'Samsung Privacy Glass', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 35,
                views: 170,
                compatibility: { brands: ['Samsung'], models: ['Galaxy S24'] },
                variants: [{
                    sku: 'SAM-S24-PRV-GLS',
                    attributeValues: { Finish: 'Privacy' },
                    sellingPrice: 11500,
                    costPrice: 6000,
                    stock: 85,
                    image: '/products/samsung-glass.png'
                }]
            },
            {
                name: 'Tecno Camon 30 Rugged Shockproof Case',
                slug: 'tecno-camon-30-rugged-case',
                searchAliases: ['tecno case', 'shockproof case', 'rugged cover'],
                description: 'Heavy-duty rugged case built for daily drops and corner impact resistance.',
                category: getCategoryOrThrow(categories, 'tecno-cases-covers-rugged-shockproof-cases'),
                brand: 'Tecno',
                images: [
                    { url: '/products/rugged-case.png', key: 'tecno-rugged-case', alt: 'Tecno Rugged Case', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 28,
                views: 130,
                compatibility: { brands: ['Tecno'], models: ['Camon 30'] },
                options: [{
                    name: 'Color',
                    values: [{ value: 'Black' }]
                }],
                variants: [{
                    sku: 'TEC-C30-RGD-BLK',
                    attributeValues: { Color: 'Black' },
                    sellingPrice: 14000,
                    costPrice: 7500,
                    stock: 65,
                    image: '/products/rugged-case.png'
                }]
            },
            {
                name: 'Tecno Spark 20 Hydrogel Film',
                slug: 'tecno-spark-20-hydrogel-film',
                searchAliases: ['hydrogel protector', 'screen film', 'tecno screen protector'],
                description: 'Flexible hydrogel film with self-healing surface for Spark 20 displays.',
                category: getCategoryOrThrow(categories, 'tecno-screen-protectors-hydrogel-film'),
                brand: 'Tecno',
                images: [
                    { url: '/products/hydrogel-film.png', key: 'tecno-hydrogel-film', alt: 'Tecno Hydrogel Film', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 18,
                views: 90,
                compatibility: { brands: ['Tecno'], models: ['Spark 20'] },
                variants: [{
                    sku: 'TEC-SP20-HYD-FLM',
                    attributeValues: { Finish: 'Clear' },
                    sellingPrice: 7000,
                    costPrice: 3200,
                    stock: 120,
                    image: '/products/hydrogel-film.png'
                }]
            },
            {
                name: 'Infinix Hot 40 Transparent Case',
                slug: 'infinix-hot-40-transparent-case',
                searchAliases: ['clear case', 'infinix case', 'transparent cover'],
                description: 'Slim transparent case with raised camera lip for Infinix Hot 40 devices.',
                category: getCategoryOrThrow(categories, 'infinix-cases-covers-transparent-cases'),
                brand: 'Infinix',
                images: [
                    { url: '/products/clear-case.png', key: 'infinix-clear-case', alt: 'Infinix Clear Case', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 24,
                views: 110,
                compatibility: { brands: ['Infinix'], models: ['Hot 40'] },
                variants: [{
                    sku: 'INF-H40-CLR-CS',
                    attributeValues: { Color: 'Clear' },
                    sellingPrice: 10500,
                    costPrice: 5000,
                    stock: 80,
                    image: '/products/clear-case.png'
                }]
            },
            {
                name: 'Infinix Note 40 Fast Charger 33W',
                slug: 'infinix-note-40-fast-charger-33w',
                searchAliases: ['infinix charger', '33w charger', 'fast charger'],
                description: 'Compact 33W wall charger tuned for Note 40 and similar USB-C devices.',
                category: getCategoryOrThrow(categories, 'infinix-chargers-cables-fast-chargers'),
                brand: 'Infinix',
                images: [
                    { url: '/products/33w-charger.png', key: 'infinix-33w-charger', alt: 'Infinix 33W Charger', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 33,
                views: 180,
                compatibility: { brands: ['Infinix'], models: ['Note 40', 'Hot 40 Pro'] },
                variants: [{
                    sku: 'INF-33W-FCH-UK',
                    attributeValues: { Plug: 'UK Plug' },
                    sellingPrice: 17500,
                    costPrice: 9800,
                    stock: 72,
                    image: '/products/33w-charger.png'
                }]
            },
            {
                name: 'Xiaomi Redmi Note 13 Silicone Case',
                slug: 'xiaomi-redmi-note-13-silicone-case',
                searchAliases: ['redmi case', 'xiaomi case', 'soft case'],
                description: 'Minimal silicone case for Redmi Note 13 with secure button coverage and a soft inner lining.',
                category: getCategoryOrThrow(categories, 'xiaomi-cases-covers-silicone-cases'),
                brand: 'Xiaomi',
                images: [
                    { url: '/products/xiaomi-case.png', key: 'xiaomi-case', alt: 'Xiaomi Silicone Case', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 31,
                views: 150,
                compatibility: { brands: ['Xiaomi'], models: ['Redmi Note 13'] },
                options: [{
                    name: 'Color',
                    values: [{ value: 'Midnight Blue' }, { value: 'Black' }]
                }],
                variants: [{
                    sku: 'XIA-RN13-SIL-BLU',
                    attributeValues: { Color: 'Midnight Blue' },
                    sellingPrice: 13500,
                    costPrice: 7200,
                    stock: 58,
                    image: '/products/xiaomi-case.png'
                }]
            },
            {
                name: 'Xiaomi 67W USB-C Turbo Charger',
                slug: 'xiaomi-67w-usb-c-turbo-charger',
                searchAliases: ['xiaomi charger', '67w charger', 'turbo charger'],
                description: 'High-output 67W charger for Xiaomi, Redmi, Poco, and other USB-C devices.',
                category: getCategoryOrThrow(categories, 'xiaomi-chargers-cables-fast-chargers'),
                brand: 'Xiaomi',
                images: [
                    { url: '/products/xiaomi-charger.png', key: 'xiaomi-67w', alt: 'Xiaomi 67W Charger', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 56,
                views: 290,
                compatibility: { brands: ['Xiaomi'], models: ['Redmi Note 13 Pro', 'Poco X6'] },
                variants: [{
                    sku: 'XIA-67W-TUR-UK',
                    attributeValues: { Plug: 'UK Plug' },
                    sellingPrice: 26500,
                    compareAtPrice: 32000,
                    costPrice: 17000,
                    stock: 68,
                    image: '/products/xiaomi-charger.png'
                }]
            },
            {
                name: 'Oraimo 20000mAh Power Bank',
                slug: 'oraimo-20000mah-power-bank',
                searchAliases: ['powerbank', '20000mah charger', 'portable charger', 'battery pack'],
                description: 'High capacity power bank with fast charging support and dual output ports.',
                category: getCategoryOrThrow(categories, 'oraimo-power-banks-fast-charging'),
                brand: 'Oraimo',
                images: [
                    { url: '/products/oraimo-powerbank.png', key: 'oraimo-powerbank', alt: 'Oraimo Power Bank', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 112,
                views: 510,
                compatibility: { brands: ['Oraimo', 'Apple', 'Samsung'], models: ['Universal'] },
                variants: [{
                    sku: 'ORA-PB-20K',
                    attributeValues: { Color: 'Black' },
                    sellingPrice: 25000,
                    costPrice: 15000,
                    stock: 75,
                    image: '/products/oraimo-powerbank.png'
                }]
            },
            {
                name: 'Oraimo 10000mAh Mini Power Bank',
                slug: 'oraimo-10000mah-mini-power-bank',
                searchAliases: ['mini powerbank', 'portable charger', 'small power bank'],
                description: 'Compact 10000mAh pocket-sized power bank with quick top-up support.',
                category: getCategoryOrThrow(categories, 'oraimo-power-banks-mini-portable'),
                brand: 'Oraimo',
                images: [
                    { url: '/products/mini-powerbank.png', key: 'oraimo-mini-powerbank', alt: 'Oraimo Mini Power Bank', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 41,
                views: 190,
                compatibility: { brands: ['Oraimo', 'Apple', 'Samsung', 'Tecno'], models: ['Universal'] },
                variants: [{
                    sku: 'ORA-PB-10K-MNI',
                    attributeValues: { Color: 'Black' },
                    sellingPrice: 18000,
                    compareAtPrice: 22000,
                    costPrice: 10800,
                    stock: 88,
                    image: '/products/mini-powerbank.png'
                }]
            },
            {
                name: 'Oraimo FreePods Lite Earbuds',
                slug: 'oraimo-freepods-lite-earbuds',
                searchAliases: ['earbuds', 'wireless earbuds', 'airpods alternative'],
                description: 'Lightweight true wireless earbuds with balanced sound and long battery life.',
                category: getCategoryOrThrow(categories, 'oraimo-earphones-headsets'),
                brand: 'Oraimo',
                images: [
                    { url: '/products/earbuds.png', key: 'oraimo-freepods', alt: 'Oraimo FreePods Lite', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 66,
                views: 330,
                compatibility: { brands: ['Oraimo', 'Apple', 'Samsung'], models: ['Universal'] },
                options: [{
                    name: 'Color',
                    values: [{ value: 'Black' }, { value: 'White' }]
                }],
                variants: [{
                    sku: 'ORA-FPD-LTE-BLK',
                    attributeValues: { Color: 'Black' },
                    sellingPrice: 32000,
                    compareAtPrice: 38000,
                    costPrice: 21000,
                    stock: 54,
                    image: '/products/earbuds.png'
                }]
            },
            {
                name: 'Google Pixel 8 Hard Shell Case',
                slug: 'google-pixel-8-hard-shell-case',
                searchAliases: ['pixel case', 'hard case', 'google phone case'],
                description: 'Slim hard shell case designed for Pixel 8 with raised edges and tactile button feedback.',
                category: getCategoryOrThrow(categories, [
                    'google-pixel-cases-covers-hard-shell-cases',
                    'google-pixel-cases-covers'
                ]),
                brand: 'Google',
                images: [
                    { url: '/products/pixel-case.png', key: 'pixel-hard-case', alt: 'Pixel Hard Shell Case', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 19,
                views: 100,
                compatibility: { brands: ['Google Pixel'], models: ['Pixel 8'] },
                variants: [{
                    sku: 'GGL-PX8-HRD-BLK',
                    attributeValues: { Color: 'Black' },
                    sellingPrice: 19500,
                    costPrice: 10200,
                    stock: 32,
                    image: '/products/pixel-case.png'
                }]
            },
            {
                name: 'Oppo Reno 11 Car Charger',
                slug: 'oppo-reno-11-car-charger',
                searchAliases: ['car charger', 'vehicle charger', 'oppo charger'],
                description: 'Dual-port car charger for Reno users who need stable charging during travel.',
                category: getCategoryOrThrow(categories, 'oppo-chargers-cables-car-chargers'),
                brand: 'Oppo',
                images: [
                    { url: '/products/car-charger.png', key: 'oppo-car-charger', alt: 'Oppo Car Charger', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 17,
                views: 95,
                compatibility: { brands: ['Oppo'], models: ['Reno 11', 'A78'] },
                variants: [{
                    sku: 'OPP-CAR-CHR-BLK',
                    attributeValues: { Color: 'Black' },
                    sellingPrice: 14500,
                    costPrice: 7600,
                    stock: 44,
                    image: '/products/car-charger.png'
                }]
            },
            {
                name: 'Realme Narzo Phone Holder Stand',
                slug: 'realme-narzo-phone-holder-stand',
                searchAliases: ['phone stand', 'holder', 'desk stand'],
                description: 'Adjustable desk stand for content viewing, calls, and work sessions.',
                category: getCategoryOrThrow(categories, 'realme-phone-holders-mounts'),
                brand: 'Realme',
                images: [
                    { url: '/products/phone-stand.png', key: 'realme-phone-stand', alt: 'Realme Phone Stand', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 14,
                views: 84,
                compatibility: { brands: ['Realme', 'Apple', 'Samsung'], models: ['Universal'] },
                variants: [{
                    sku: 'REA-PHN-STD-SLV',
                    attributeValues: { Color: 'Silver' },
                    sellingPrice: 9500,
                    costPrice: 4200,
                    stock: 70,
                    image: '/products/phone-stand.png'
                }]
            },
            {
                name: 'Universal 64GB Memory Card',
                slug: 'universal-64gb-memory-card',
                searchAliases: ['sd card', 'memory card', 'storage card'],
                description: 'Reliable 64GB memory card for phones, dashcams, and portable media storage.',
                category: getCategoryOrThrow(categories, 'other-brands-memory-storage'),
                brand: 'SanDisk',
                images: [
                    { url: '/products/memory-card.png', key: 'memory-card-64gb', alt: '64GB Memory Card', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 58,
                views: 205,
                compatibility: { brands: ['SanDisk', 'Tecno', 'Infinix'], models: ['Universal'] },
                variants: [{
                    sku: 'SDK-MEM-64GB-U1',
                    attributeValues: { Capacity: '64GB' },
                    sellingPrice: 11000,
                    costPrice: 6400,
                    stock: 150,
                    image: '/products/memory-card.png'
                }]
            },
            {
                name: 'Universal Bluetooth Speaker Mini',
                slug: 'universal-bluetooth-speaker-mini',
                searchAliases: ['speaker', 'bluetooth speaker', 'portable speaker'],
                description: 'Compact speaker with punchy output, Bluetooth pairing, and portable battery life.',
                category: getCategoryOrThrow(categories, 'other-brands-earphones-headsets'),
                brand: 'JBL',
                images: [
                    { url: '/products/bluetooth-speaker.png', key: 'mini-speaker', alt: 'Mini Bluetooth Speaker', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 47,
                views: 240,
                compatibility: { brands: ['JBL', 'Apple', 'Samsung'], models: ['Universal'] },
                variants: [{
                    sku: 'JBL-SPK-MNI-BLK',
                    attributeValues: { Color: 'Black' },
                    sellingPrice: 36000,
                    compareAtPrice: 42000,
                    costPrice: 24000,
                    stock: 36,
                    image: '/products/bluetooth-speaker.png'
                }]
            },
            {
                name: 'Apple MagSafe Wireless Charger Pad',
                slug: 'apple-magsafe-wireless-charger-pad',
                searchAliases: ['magsafe charger', 'wireless charger', 'magnetic charger'],
                description: 'Magnetic wireless charging pad designed for iPhone alignment and dependable bedside charging.',
                category: getCategoryOrThrow(categories, 'apple-chargers-cables-wireless-chargers'),
                brand: 'Apple',
                images: [
                    { url: '/products/magsafe-charger.png', key: 'magsafe-charger', alt: 'Apple MagSafe Charger', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 92,
                views: 470,
                compatibility: { brands: ['Apple'], models: ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'] },
                specifications: [
                    { key: 'Charging Type', value: 'Magnetic Wireless' },
                    { key: 'Cable Length', value: '1m' },
                    { key: 'Output', value: '15W Max' }
                ],
                walletOnlyDiscount: { enabled: true, percentage: 5 },
                variants: [{
                    sku: 'APL-MGSF-CHR-WHT',
                    attributeValues: { Finish: 'White' },
                    sellingPrice: 29500,
                    compareAtPrice: 36000,
                    costPrice: 19000,
                    stock: 48,
                    image: '/products/magsafe-charger.png'
                }]
            },
            {
                name: 'Samsung USB-C Cable Twin Pack',
                slug: 'samsung-usb-c-cable-twin-pack',
                searchAliases: ['type c cable', 'usb c cable', 'charging cable'],
                description: 'Two durable USB-C cables built for Galaxy devices, power banks, and other USB-C accessories.',
                category: getCategoryOrThrow(categories, 'samsung-chargers-cables-usb-type-c-cables'),
                brand: 'Samsung',
                images: [
                    { url: '/products/type-c-cable.png', key: 'samsung-type-c-cable', alt: 'Samsung USB-C Cable Pack', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 53,
                views: 215,
                compatibility: { brands: ['Samsung', 'Tecno', 'Infinix', 'Xiaomi'], models: ['Universal USB-C'] },
                specifications: [
                    { key: 'Pack Size', value: '2 Cables' },
                    { key: 'Length', value: '1m each' },
                    { key: 'Connector', value: 'USB-C to USB-C' }
                ],
                variants: [
                    {
                        sku: 'SAM-USBC-2PK-WHT',
                        attributeValues: { Length: '1m', Color: 'White' },
                        sellingPrice: 15500,
                        costPrice: 8200,
                        stock: 78,
                        image: '/products/type-c-cable.png'
                    },
                    {
                        sku: 'SAM-USBC-2PK-BLK',
                        attributeValues: { Length: '1m', Color: 'Black' },
                        sellingPrice: 15500,
                        costPrice: 8200,
                        stock: 64,
                        image: '/products/type-c-cable.png'
                    }
                ]
            },
            {
                name: 'Xiaomi Redmi Buds Lite',
                slug: 'xiaomi-redmi-buds-lite',
                searchAliases: ['redmi earbuds', 'wireless earbuds', 'bluetooth buds'],
                description: 'Pocket-friendly wireless buds with low-latency pairing and balanced sound for daily listening.',
                category: getCategoryOrThrow(categories, 'xiaomi-earphones-headsets'),
                brand: 'Xiaomi',
                images: [
                    { url: '/products/redmi-buds.png', key: 'redmi-buds', alt: 'Xiaomi Redmi Buds Lite', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 44,
                views: 230,
                compatibility: { brands: ['Xiaomi', 'Apple', 'Samsung'], models: ['Universal'] },
                options: [{
                    name: 'Color',
                    values: [{ value: 'White' }, { value: 'Black' }]
                }],
                specifications: [
                    { key: 'Battery Life', value: '20 Hours with Case' },
                    { key: 'Charging Port', value: 'USB-C' },
                    { key: 'Connectivity', value: 'Bluetooth 5.3' }
                ],
                variants: [{
                    sku: 'XIA-BUD-LTE-WHT',
                    attributeValues: { Color: 'White' },
                    sellingPrice: 27500,
                    compareAtPrice: 32000,
                    costPrice: 18000,
                    stock: 52,
                    image: '/products/redmi-buds.png'
                }]
            },
            {
                name: 'Tecno Camon 30 Camera Lens Protector',
                slug: 'tecno-camon-30-camera-lens-protector',
                searchAliases: ['lens guard', 'camera protector', 'camera glass'],
                description: 'Slim camera lens protector that shields the rear module without interfering with flash or clarity.',
                category: getCategoryOrThrow(categories, 'tecno-screen-protectors-camera-lens-protector'),
                brand: 'Tecno',
                images: [
                    { url: '/products/lens-protector.png', key: 'tecno-lens-protector', alt: 'Tecno Camera Lens Protector', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 12,
                views: 68,
                compatibility: { brands: ['Tecno'], models: ['Camon 30'] },
                specifications: [
                    { key: 'Material', value: 'Tempered Glass' },
                    { key: 'Coverage', value: 'Rear Camera Module' }
                ],
                variants: [{
                    sku: 'TEC-C30-LNS-GLS',
                    attributeValues: { Finish: 'Clear' },
                    sellingPrice: 6500,
                    costPrice: 2500,
                    stock: 110,
                    image: '/products/lens-protector.png'
                }]
            },
            {
                name: 'Infinix Magnetic Car Mount Pro',
                slug: 'infinix-magnetic-car-mount-pro',
                searchAliases: ['car mount', 'phone holder', 'dashboard mount'],
                description: 'Dashboard and vent-compatible magnetic mount for safer navigation and one-hand docking.',
                category: getCategoryOrThrow(categories, 'infinix-phone-holders-mounts'),
                brand: 'Infinix',
                images: [
                    { url: '/products/car-mount.png', key: 'infinix-car-mount', alt: 'Infinix Magnetic Car Mount', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 21,
                views: 96,
                compatibility: { brands: ['Infinix', 'Apple', 'Samsung'], models: ['Universal'] },
                specifications: [
                    { key: 'Mount Type', value: 'Dashboard / Vent' },
                    { key: 'Grip', value: 'Magnetic Plate Support' }
                ],
                variants: [{
                    sku: 'INF-CAR-MNT-BLK',
                    attributeValues: { Color: 'Black' },
                    sellingPrice: 12500,
                    costPrice: 5800,
                    stock: 57,
                    image: '/products/car-mount.png'
                }]
            },
            {
                name: 'Oraimo Fast Charge Travel Bundle',
                slug: 'oraimo-fast-charge-travel-bundle',
                searchAliases: ['charger bundle', 'travel kit', 'power bundle'],
                description: 'Travel-ready bundle with a wall charger, cable, and compact power bank for daily movement.',
                category: getCategoryOrThrow(categories, 'oraimo-chargers-cables-fast-chargers'),
                brand: 'Oraimo',
                images: [
                    { url: '/products/travel-bundle.png', key: 'oraimo-travel-bundle', alt: 'Oraimo Travel Bundle', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 39,
                views: 185,
                compatibility: { brands: ['Oraimo', 'Apple', 'Samsung', 'Tecno'], models: ['Universal'] },
                specifications: [
                    { key: 'Included', value: '18W Charger, USB-C Cable, 10000mAh Mini Bank' },
                    { key: 'Ideal Use', value: 'Travel / Commute' }
                ],
                walletOnlyDiscount: { enabled: true, percentage: 8 },
                variants: [{
                    sku: 'ORA-TRV-BND-BLK',
                    attributeValues: { Bundle: 'Standard' },
                    sellingPrice: 42500,
                    compareAtPrice: 52000,
                    costPrice: 28000,
                    stock: 26,
                    image: '/products/travel-bundle.png'
                }]
            },
            {
                name: 'SanDisk Ultra Memory Card Duo',
                slug: 'sandisk-ultra-memory-card-duo',
                searchAliases: ['memory bundle', 'sd card', 'storage card'],
                description: 'High-speed card offering with two capacity options for creators, casual storage, and backup use.',
                category: getCategoryOrThrow(categories, 'other-brands-memory-storage'),
                brand: 'SanDisk',
                images: [
                    { url: '/products/memory-card-ultra.png', key: 'memory-card-ultra', alt: 'SanDisk Ultra Memory Card', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 29,
                views: 140,
                compatibility: { brands: ['SanDisk', 'Tecno', 'Infinix', 'Samsung'], models: ['Universal'] },
                options: [{
                    name: 'Capacity',
                    values: [{ value: '128GB' }, { value: '256GB' }]
                }],
                specifications: [
                    { key: 'Class', value: 'UHS-I' },
                    { key: 'Use Case', value: 'Photos, Media, App Storage' }
                ],
                variants: [
                    {
                        sku: 'SDK-ULT-128-U1',
                        attributeValues: { Capacity: '128GB' },
                        sellingPrice: 17000,
                        costPrice: 9400,
                        stock: 98,
                        image: '/products/memory-card-ultra.png'
                    },
                    {
                        sku: 'SDK-ULT-256-U1',
                        attributeValues: { Capacity: '256GB' },
                        sellingPrice: 26500,
                        costPrice: 15600,
                        stock: 62,
                        image: '/products/memory-card-ultra.png'
                    }
                ]
            }
        ];

        await Product.create(products);
        console.log(`✅ Created ${products.length} rich sample products for app and admin testing`);
        console.log('📦 Coverage includes: Apple, Samsung, Tecno, Infinix, Xiaomi, Oraimo, Google Pixel, Oppo, Realme, and universal accessories');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();
