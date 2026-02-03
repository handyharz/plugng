// npx ts-node scripts/seedHomepageProducts.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../src/models/Category';
import Product from '../src/models/Product';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugng';

async function seedHomepageProducts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Get categories
        const appleCases = await Category.findOne({ slug: 'apple-cases-covers' });
        const samsungCases = await Category.findOne({ slug: 'samsung-cases-covers' });
        const chargers = await Category.findOne({ slug: 'apple-chargers-cables' });
        const tecno = await Category.findOne({ slug: 'tecno' });

        if (!appleCases || !samsungCases || !chargers || !tecno) {
            console.error('❌ Categories not found. Run seedCategories first.');
            process.exit(1);
        }

        const products = [
            // 🔥 ON SALE PRODUCTS (with compareAtPrice)
            {
                name: 'iPhone 15 Pro Silicone Case with MagSafe',
                slug: 'iphone-15-pro-silicone-case',
                description: 'A silky, soft-touch finish of the silicone exterior feels great in your hand. And on the inside, there's a soft microfiber lining for even more protection.',
                category: appleCases._id,
                images: [
                    { url: '/products/iphone-case-black.png', key: 'iphone-case-black', alt: 'iPhone 15 Pro Silicone Case - Black', isPrimary: true },
                    { url: '/products/iphone-case-blue.png', key: 'iphone-case-blue', alt: 'iPhone 15 Pro Silicone Case - Blue', isPrimary: false }
                ],
                status: 'active',
                featured: false,
                salesCount: 0,
                compatibility: { brands: ['Apple'], models: ['iPhone 15 Pro', 'iPhone 15 Pro Max'] },
                options: [
                    {
                        name: 'Color',
                        values: [
                            { value: 'Black' },
                            { value: 'Blue' }
                        ]
                    }
                ],
                variants: [
                    {
                        sku: 'APL-IP15P-SIL-BLK',
                        attributeValues: { 'Color': 'Black' },
                        sellingPrice: 35000,
                        compareAtPrice: 50000, // ON SALE!
                        costPrice: 25000,
                        stock: 50,
                        image: '/products/iphone-case-black.png'
                    },
                    {
                        sku: 'APL-IP15P-SIL-BLU',
                        attributeValues: { 'Color': 'Blue' },
                        sellingPrice: 35000,
                        compareAtPrice: 50000, // ON SALE!
                        costPrice: 25000,
                        stock: 30,
                        image: '/products/iphone-case-blue.png'
                    }
                ]
            },
            {
                name: 'Samsung Galaxy S24 Ultra Silicone Grip Case',
                slug: 'samsung-s24-ultra-silicone-case',
                description: 'This case protects your phone while also providing a secure grip. The integrated strap helps you hold your phone more firmly.',
                category: samsungCases._id,
                images: [
                    { url: '/products/samsung-case-gray.png', key: 'samsung-case-gray', alt: 'Samsung S24 Ultra Case - Gray', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 0,
                compatibility: { brands: ['Samsung'], models: ['Galaxy S24 Ultra'] },
                options: [
                    {
                        name: 'Color',
                        values: [{ value: 'Gray' }]
                    }
                ],
                variants: [
                    {
                        sku: 'SAM-S24U-SIL-GRY',
                        attributeValues: { 'Color': 'Gray' },
                        sellingPrice: 28000,
                        compareAtPrice: 40000, // ON SALE!
                        costPrice: 20000,
                        stock: 40,
                        image: '/products/samsung-case-gray.png'
                    }
                ]
            },

            // ⭐ FEATURED PRODUCTS
            {
                name: 'Apple 20W USB-C Power Adapter',
                slug: 'apple-20w-usb-c-adapter',
                description: 'The Apple 20W USB-C Power Adapter offers fast, efficient charging at home, in the office, or on the go.',
                category: chargers._id,
                images: [
                    { url: '/products/apple-adapter.png', key: 'apple-20w-usb-c-adapter', alt: 'Apple 20W USB-C Power Adapter', isPrimary: true }
                ],
                status: 'active',
                featured: true, // FEATURED!
                salesCount: 15,
                compatibility: { brands: ['Apple'], models: ['iPhone 15', 'iPhone 14', 'iPad Pro'] },
                options: [
                    {
                        name: 'Plug Type',
                        values: [
                            { value: 'UK Plug' },
                            { value: 'US Plug' }
                        ]
                    }
                ],
                variants: [
                    { sku: 'APL-20W-ADPT-UK', attributeValues: { 'Plug Type': 'UK Plug' }, sellingPrice: 28500, costPrice: 18500, stock: 100, image: '/products/apple-adapter.png' },
                    { sku: 'APL-20W-ADPT-US', attributeValues: { 'Plug Type': 'US Plug' }, sellingPrice: 28500, costPrice: 18500, stock: 20, image: '/products/apple-adapter.png' }
                ]
            },
            {
                name: 'Oraimo 20000mAh Power Bank (Fast Charging)',
                slug: 'oraimo-20000mah-power-bank',
                description: 'High capacity power bank with fast charging support for all major phone brands in Nigeria. Features dual output ports and AniFast technology.',
                category: tecno._id,
                images: [
                    { url: '/products/oraimo-powerbank.png', key: 'oraimo-powerbank', alt: 'Oraimo 20000mAh Power Bank', isPrimary: true }
                ],
                status: 'active',
                featured: true, // FEATURED!
                salesCount: 8,
                compatibility: { brands: ['Apple', 'Samsung', 'Xiaomi', 'Tecno', 'Infinix'], models: [] },
                options: [
                    {
                        name: 'Color',
                        values: [{ value: 'Black' }]
                    }
                ],
                variants: [
                    { sku: 'ORA-PB-20K', attributeValues: { 'Color': 'Black' }, sellingPrice: 25000, costPrice: 15000, stock: 75, image: '/products/oraimo-powerbank.png' }
                ]
            },

            // 📈 TRENDING PRODUCTS (high salesCount)
            {
                name: 'iPhone 14 Clear Case with MagSafe',
                slug: 'iphone-14-clear-case',
                description: 'Perfectly aligned magnets make wireless charging faster and easier. The clear design shows off the brilliant colored finish of your iPhone.',
                category: appleCases._id,
                images: [
                    { url: '/products/iphone-case-black.png', key: 'iphone-14-clear', alt: 'iPhone 14 Clear Case', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 127, // TRENDING!
                compatibility: { brands: ['Apple'], models: ['iPhone 14', 'iPhone 14 Plus'] },
                options: [
                    {
                        name: 'Color',
                        values: [{ value: 'White' }]
                    }
                ],
                variants: [
                    { sku: 'APL-IP14-CLR-WHT', attributeValues: { 'Color': 'White' }, sellingPrice: 38000, costPrice: 28000, stock: 60, image: '/products/iphone-case-black.png' }
                ]
            },
            {
                name: 'Samsung 25W Super Fast Charger',
                slug: 'samsung-25w-super-fast-charger',
                description: 'Official Samsung Super Fast Charger with USB-C cable. Charges your Galaxy device from 0 to 50% in just 30 minutes.',
                category: chargers._id,
                images: [
                    { url: '/products/apple-adapter.png', key: 'samsung-25w-charger', alt: 'Samsung 25W Charger', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 89, // TRENDING!
                compatibility: { brands: ['Samsung'], models: ['Galaxy S24', 'Galaxy S23', 'Galaxy Note'] },
                options: [
                    {
                        name: 'Color',
                        values: [{ value: 'White' }]
                    }
                ],
                variants: [
                    { sku: 'SAM-25W-CHG-WHT', attributeValues: { 'Color': 'White' }, sellingPrice: 22000, costPrice: 14000, stock: 85, image: '/products/apple-adapter.png' }
                ]
            },

            // 🆕 NEW ARRIVALS (recent createdAt)
            {
                name: 'Google Pixel 8 Pro Fabric Case',
                slug: 'google-pixel-8-pro-fabric-case',
                description: 'Made with recycled materials, this case is designed to protect your Pixel 8 Pro while being kind to the planet.',
                category: appleCases._id,
                images: [
                    { url: '/products/iphone-case-gray.png', key: 'pixel-8-fabric', alt: 'Google Pixel 8 Pro Fabric Case', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 3,
                compatibility: { brands: ['Google'], models: ['Pixel 8 Pro'] },
                options: [
                    {
                        name: 'Color',
                        values: [
                            { value: 'Gray' },
                            { value: 'Green' }
                        ]
                    }
                ],
                variants: [
                    { sku: 'GOO-P8P-FAB-GRY', attributeValues: { 'Color': 'Gray' }, sellingPrice: 32000, costPrice: 22000, stock: 25, image: '/products/iphone-case-gray.png' },
                    { sku: 'GOO-P8P-FAB-GRN', attributeValues: { 'Color': 'Green' }, sellingPrice: 32000, costPrice: 22000, stock: 18, image: '/products/iphone-case-green.png' }
                ]
            },
            {
                name: 'OnePlus 65W SUPERVOOC Charger',
                slug: 'oneplus-65w-supervooc-charger',
                description: 'Charge your OnePlus device at lightning speed with this official 65W SUPERVOOC charger. Full charge in under 30 minutes.',
                category: chargers._id,
                images: [
                    { url: '/products/apple-adapter.png', key: 'oneplus-65w', alt: 'OnePlus 65W Charger', isPrimary: true }
                ],
                status: 'active',
                featured: true, // Also featured!
                salesCount: 12,
                compatibility: { brands: ['OnePlus'], models: ['OnePlus 12', 'OnePlus 11', 'OnePlus 10 Pro'] },
                options: [
                    {
                        name: 'Color',
                        values: [{ value: 'Red' }]
                    }
                ],
                variants: [
                    { sku: 'OPL-65W-CHG-RED', attributeValues: { 'Color': 'Red' }, sellingPrice: 35000, costPrice: 24000, stock: 40, image: '/products/apple-adapter.png' }
                ]
            },
            {
                name: 'Xiaomi 20000mAh Power Bank 3 Pro',
                slug: 'xiaomi-20000mah-power-bank-3-pro',
                description: 'Triple USB output with 50W max output. Charges laptops, tablets, and phones simultaneously.',
                category: tecno._id,
                images: [
                    { url: '/products/oraimo-powerbank.png', key: 'xiaomi-pb-3-pro', alt: 'Xiaomi Power Bank 3 Pro', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 5,
                compatibility: { brands: ['Xiaomi', 'Apple', 'Samsung', 'OnePlus'], models: [] },
                options: [
                    {
                        name: 'Color',
                        values: [{ value: 'Black' }]
                    }
                ],
                variants: [
                    { sku: 'XIA-PB3P-20K-BLK', attributeValues: { 'Color': 'Black' }, sellingPrice: 28000, costPrice: 18000, stock: 30, image: '/products/oraimo-powerbank.png' }
                ]
            }
        ];

        await Product.create(products);
        console.log(`✅ Created ${products.length} products for homepage sections:`);
        console.log('   🔥 2 On Sale products (with compareAtPrice)');
        console.log('   ⭐ 3 Featured products (featured: true)');
        console.log('   📈 2 Trending products (salesCount > 50)');
        console.log('   🆕 3 New Arrivals (recent products)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
}

seedHomepageProducts();
