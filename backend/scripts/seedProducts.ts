// npx ts-node scripts/seedProducts.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../src/models/Category';
import Product from '../src/models/Product';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugng';

async function seedProducts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Get categories (Level 3 for specific types, Level 1 for fallback)
        const siliconeCases = await Category.findOne({ slug: 'apple-cases-covers-silicone-cases' });
        const samsungSilicone = await Category.findOne({ slug: 'samsung-cases-covers-silicone-cases' });
        const fastChargers = await Category.findOne({ slug: 'apple-chargers-cables-fast-chargers' });
        const oraimoPowerBank = await Category.findOne({ slug: 'oraimo-power-banks-fast-charging' });
        const tecnoBrand = await Category.findOne({ slug: 'tecno' });

        if (!siliconeCases || !samsungSilicone || !fastChargers || !oraimoPowerBank || !tecnoBrand) {
            console.error('❌ Categories not found. Run seedCategories first.');
            process.exit(1);
        }

        const products = [
            // 🔥 ON SALE PRODUCTS (compareAtPrice > sellingPrice)
            {
                name: 'iPhone 15 Pro Silicone Case with MagSafe',
                slug: 'iphone-15-pro-silicone-case',
                description: 'A silky, soft-touch finish of the silicone exterior feels great in your hand. And on the inside, there’s a soft microfiber lining for even more protection.',
                category: siliconeCases._id,
                brand: 'Apple',
                images: [
                    { url: '/products/iphone-case-black.png', key: 'iphone-case-black', alt: 'iPhone 15 Pro Case - Black', isPrimary: true },
                    { url: '/products/iphone-case-blue.png', key: 'iphone-case-blue', alt: 'iPhone 15 Pro Case - Blue', isPrimary: false }
                ],
                status: 'active',
                featured: false,
                salesCount: 45,
                compatibility: { brands: ['Apple'], models: ['iPhone 15 Pro'] },
                options: [{
                    name: 'Color',
                    values: [
                        { value: 'Black', swatchUrl: '/swatches/case-black.png' },
                        { value: 'Blue', swatchUrl: '/swatches/case-blue.png' }
                    ]
                }],
                variants: [
                    {
                        sku: 'APL-IP15P-SIL-BLK',
                        attributeValues: { 'Color': 'Black' },
                        sellingPrice: 35000,
                        compareAtPrice: 50000,
                        costPrice: 25000,
                        stock: 50,
                        image: '/products/iphone-case-black.png'
                    },
                    {
                        sku: 'APL-IP15P-SIL-BLU',
                        attributeValues: { 'Color': 'Blue' },
                        sellingPrice: 45000,
                        compareAtPrice: 50000,
                        costPrice: 35000,
                        stock: 30,
                        image: '/products/iphone-case-blue.png'
                    }
                ]
            },
            {
                name: 'Samsung Galaxy S24 Ultra Grip Case',
                slug: 'samsung-s24-ultra-silicone-case',
                description: 'This case protects your phone while providing a secure grip. The integrated strap helps you hold your phone more firmly.',
                category: samsungSilicone._id,
                brand: 'Samsung',
                images: [
                    { url: '/products/samsung-case-gray.png', key: 'samsung-case-gray', alt: 'Samsung S24 Case - Gray', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 32,
                compatibility: { brands: ['Samsung'], models: ['Galaxy S24 Ultra'] },
                variants: [
                    {
                        sku: 'SAM-S24U-SIL-GRY',
                        attributeValues: { 'Color': 'Gray' },
                        sellingPrice: 28000,
                        compareAtPrice: 40000,
                        costPrice: 20000,
                        stock: 40,
                        image: '/products/samsung-case-gray.png'
                    }
                ]
            },

            // ⭐ FEATURED PRODUCTS (featured: true)
            {
                name: 'Apple 20W USB-C Power Adapter',
                slug: 'apple-20w-usb-c-adapter',
                description: 'Fast, efficient charging at home, in the office, or on the go.',
                category: fastChargers._id,
                brand: 'Apple',
                images: [
                    { url: '/products/apple-adapter.png', key: 'apple-20w-adapter', alt: 'Apple 20W Adapter', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 15,
                compatibility: { brands: ['Apple'], models: ['iPhone 15', 'iPad Pro'] },
                variants: [{
                    sku: 'APL-20W-ADPT-UK',
                    attributeValues: { 'Plug Type': 'UK Plug' },
                    sellingPrice: 28500,
                    costPrice: 18500,
                    stock: 100,
                    image: '/products/apple-adapter.png'
                }]
            },
            {
                name: 'Oraimo 20000mAh Power Bank',
                slug: 'oraimo-20000mah-power-bank',
                description: 'High capacity power bank with fast charging support.',
                category: oraimoPowerBank._id,
                brand: 'Oraimo',
                images: [
                    { url: '/products/oraimo-powerbank.png', key: 'oraimo-powerbank', alt: 'Oraimo Power Bank', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 8,
                variants: [{
                    sku: 'ORA-PB-20K',
                    attributeValues: { 'Color': 'Black' },
                    sellingPrice: 25000,
                    costPrice: 15000,
                    stock: 75,
                    image: '/products/oraimo-powerbank.png'
                }]
            },

            // 📈 TRENDING PRODUCTS (salesCount > 0)
            {
                name: 'iPhone 14 Clear Case with MagSafe',
                slug: 'iphone-14-clear-case',
                description: 'Clear design shows off the brilliant finish of your iPhone.',
                category: siliconeCases._id,
                brand: 'Apple',
                images: [
                    { url: '/products/iphone-case-green.png', key: 'iphone-14-clear', alt: 'iPhone 14 Clear Case', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 127,
                compatibility: { brands: ['Apple'], models: ['iPhone 14'] },
                variants: [{
                    sku: 'APL-IP14-CLR-WHT',
                    attributeValues: { 'Color': 'Clear' },
                    sellingPrice: 38000,
                    costPrice: 28000,
                    stock: 60,
                    image: '/products/iphone-case-green.png'
                }]
            }
        ];

        await Product.create(products);
        console.log(`✅ Created ${products.length} rich sample products for homepage and admin`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();
