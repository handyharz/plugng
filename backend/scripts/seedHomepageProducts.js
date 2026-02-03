// node scripts/seedHomepageProducts.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugng';

// Define schemas inline
const CategorySchema = new mongoose.Schema({
    name: String,
    slug: String
});

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{
        url: String,
        key: String,
        alt: String,
        isPrimary: Boolean
    }],
    status: { type: String, default: 'active' },
    featured: { type: Boolean, default: false },
    salesCount: { type: Number, default: 0 },
    compatibility: {
        brands: [String],
        models: [String]
    },
    options: [{
        name: String,
        values: [{
            value: String,
            swatchUrl: String
        }]
    }],
    variants: [{
        sku: { type: String, required: true, unique: true },
        attributeValues: { type: Map, of: String },
        sellingPrice: { type: Number, required: true },
        compareAtPrice: Number,
        costPrice: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        image: String
    }]
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);

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
            // 🔥 ON SALE PRODUCTS
            {
                name: 'iPhone 15 Pro Silicone Case with MagSafe',
                slug: 'iphone-15-pro-silicone-case',
                description: 'A silky, soft-touch finish of the silicone exterior feels great in your hand. And on the inside, there’s a soft microfiber lining for even more protection.',
                category: appleCases._id,
                images: [
                    { url: '/products/iphone-case-black.png', key: 'iphone-case-black', alt: 'iPhone 15 Pro Case - Black', isPrimary: true },
                    { url: '/products/iphone-case-blue.png', key: 'iphone-case-blue', alt: 'iPhone 15 Pro Case - Blue', isPrimary: false },
                    { url: '/products/iphone-case-golden.png', key: 'iphone-case-golden', alt: 'iPhone 15 Pro Case - Golden', isPrimary: false },
                    { url: '/products/iphone-case-gray.png', key: 'iphone-case-gray', alt: 'iPhone 15 Pro Case - Gray', isPrimary: false },
                    { url: '/products/iphone-case-green.png', key: 'iphone-case-green', alt: 'iPhone 15 Pro Case - Green', isPrimary: false },
                    { url: '/products/iphone-case-rose.png', key: 'iphone-case-rose', alt: 'iPhone 15 Pro Case - Rose', isPrimary: false }
                ],
                status: 'active',
                featured: false,
                salesCount: 45,
                compatibility: { brands: ['Apple'], models: ['iPhone 15 Pro'] },
                options: [{
                    name: 'Color',
                    values: [
                        { value: 'Black', swatchUrl: '/swatches/case-black.png' },
                        { value: 'Blue', swatchUrl: '/swatches/case-blue.png' },
                        { value: 'Golden', swatchUrl: '/swatches/case-golden.png' },
                        { value: 'Gray', swatchUrl: '/swatches/case-gray.png' },
                        { value: 'Green', swatchUrl: '/swatches/case-green.png' },
                        { value: 'Rose', swatchUrl: '/swatches/case-rose.png' }
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
                        costPrice: 35000,
                        stock: 30,
                        image: '/products/iphone-case-blue.png'
                    },
                    {
                        sku: 'APL-IP15P-SIL-GLD',
                        attributeValues: { 'Color': 'Golden' },
                        sellingPrice: 48000,
                        costPrice: 36000,
                        stock: 0,
                        image: '/products/iphone-case-golden.png'
                    },
                    {
                        sku: 'APL-IP15P-SIL-GRY',
                        attributeValues: { 'Color': 'Gray' },
                        sellingPrice: 48000,
                        costPrice: 36000,
                        stock: 40,
                        image: '/products/iphone-case-gray.png'
                    },
                    {
                        sku: 'APL-IP15P-SIL-GRN',
                        attributeValues: { 'Color': 'Green' },
                        sellingPrice: 48000,
                        costPrice: 36000,
                        stock: 15,
                        image: '/products/iphone-case-green.png'
                    },
                    {
                        sku: 'APL-IP15P-SIL-ROS',
                        attributeValues: { 'Color': 'Rose' },
                        sellingPrice: 48000,
                        costPrice: 36000,
                        stock: 10,
                        image: '/products/iphone-case-rose.png'
                    }
                ]
            },
            {
                name: 'Samsung Galaxy S24 Ultra Grip Case',
                slug: 'samsung-s24-ultra-silicone-case',
                description: 'This case protects your phone while providing a secure grip. The integrated strap helps you hold your phone more firmly.',
                category: samsungCases._id,
                images: [
                    { url: '/products/samsung-case-gray.png', key: 'samsung-case-gray', alt: 'Samsung S24 Case - Gray', isPrimary: true },
                    { url: '/products/samsung-case-white.png', key: 'samsung-case-white', alt: 'Samsung S24 Case - White', isPrimary: false }
                ],
                status: 'active',
                featured: false,
                salesCount: 32,
                compatibility: { brands: ['Samsung'], models: ['Galaxy S24 Ultra'] },
                options: [{
                    name: 'Color',
                    values: [
                        { value: 'Gray', swatchUrl: '/swatches/titanium-gray.png' },
                        { value: 'White', swatchUrl: '/swatches/cream-white.png' }
                    ]
                }],
                variants: [
                    {
                        sku: 'SAM-S24U-SIL-GRY',
                        attributeValues: { 'Color': 'Gray' },
                        sellingPrice: 28000,
                        compareAtPrice: 40000,
                        costPrice: 20000,
                        stock: 40,
                        image: '/products/samsung-case-gray.png'
                    },
                    {
                        sku: 'SAM-S24U-SIL-WHT',
                        attributeValues: { 'Color': 'White' },
                        sellingPrice: 28000,
                        costPrice: 20000,
                        stock: 15,
                        image: '/products/samsung-case-white.png'
                    }
                ]
            },

            // ⭐ FEATURED PRODUCTS
            {
                name: 'Apple 20W USB-C Power Adapter',
                slug: 'apple-20w-usb-c-adapter',
                description: 'Fast, efficient charging at home, in the office, or on the go.',
                category: chargers._id,
                images: [
                    { url: '/products/apple-adapter.png', key: 'apple-20w-adapter', alt: 'Apple 20W Adapter', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 15,
                compatibility: { brands: ['Apple'], models: ['iPhone 15', 'iPad Pro'] },
                options: [{ name: 'Plug Type', values: [{ value: 'UK Plug' }] }],
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
                category: tecno._id,
                images: [
                    { url: '/products/oraimo-powerbank.png', key: 'oraimo-powerbank', alt: 'Oraimo Power Bank', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 8,
                compatibility: { brands: ['Apple', 'Samsung', 'Xiaomi'], models: [] },
                options: [{ name: 'Color', values: [{ value: 'Black' }] }],
                variants: [{
                    sku: 'ORA-PB-20K',
                    attributeValues: { 'Color': 'Black' },
                    sellingPrice: 25000,
                    costPrice: 15000,
                    stock: 75,
                    image: '/products/oraimo-powerbank.png'
                }]
            },

            // 📈 TRENDING PRODUCTS
            {
                name: 'iPhone 14 Clear Case with MagSafe',
                slug: 'iphone-14-clear-case',
                description: 'Clear design shows off the brilliant finish of your iPhone.',
                category: appleCases._id,
                images: [
                    { url: '/products/iphone-case-black.png', key: 'iphone-14-clear', alt: 'iPhone 14 Clear Case', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 127,
                compatibility: { brands: ['Apple'], models: ['iPhone 14'] },
                options: [{ name: 'Color', values: [{ value: 'White' }] }],
                variants: [{
                    sku: 'APL-IP14-CLR-WHT',
                    attributeValues: { 'Color': 'White' },
                    sellingPrice: 38000,
                    costPrice: 28000,
                    stock: 60,
                    image: '/products/iphone-case-black.png'
                }]
            },
            {
                name: 'Samsung 25W Super Fast Charger',
                slug: 'samsung-25w-super-fast-charger',
                description: 'Charges your Galaxy device from 0 to 50% in 30 minutes.',
                category: chargers._id,
                images: [
                    { url: '/products/apple-adapter.png', key: 'samsung-25w-charger', alt: 'Samsung 25W Charger', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 89,
                compatibility: { brands: ['Samsung'], models: ['Galaxy S24', 'Galaxy S23'] },
                options: [{ name: 'Color', values: [{ value: 'White' }] }],
                variants: [{
                    sku: 'SAM-25W-CHG-WHT',
                    attributeValues: { 'Color': 'White' },
                    sellingPrice: 22000,
                    costPrice: 14000,
                    stock: 85,
                    image: '/products/apple-adapter.png'
                }]
            },

            // 🆕 NEW ARRIVALS
            {
                name: 'Google Pixel 8 Pro Fabric Case',
                slug: 'google-pixel-8-pro-fabric-case',
                description: 'Made with recycled materials, designed to protect your Pixel 8 Pro.',
                category: appleCases._id,
                images: [
                    { url: '/products/iphone-case-gray.png', key: 'pixel-8-fabric', alt: 'Pixel 8 Pro Case', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 3,
                compatibility: { brands: ['Google'], models: ['Pixel 8 Pro'] },
                options: [{ name: 'Color', values: [{ value: 'Gray' }] }],
                variants: [{
                    sku: 'GOO-P8P-FAB-GRY',
                    attributeValues: { 'Color': 'Gray' },
                    sellingPrice: 32000,
                    costPrice: 22000,
                    stock: 25,
                    image: '/products/iphone-case-gray.png'
                }]
            },
            {
                name: 'OnePlus 65W SUPERVOOC Charger',
                slug: 'oneplus-65w-supervooc-charger',
                description: 'Charge your OnePlus device at lightning speed. Full charge in 30 minutes.',
                category: chargers._id,
                images: [
                    { url: '/products/apple-adapter.png', key: 'oneplus-65w', alt: 'OnePlus 65W Charger', isPrimary: true }
                ],
                status: 'active',
                featured: true,
                salesCount: 12,
                compatibility: { brands: ['OnePlus'], models: ['OnePlus 12', 'OnePlus 11'] },
                options: [{ name: 'Color', values: [{ value: 'Red' }] }],
                variants: [{
                    sku: 'OPL-65W-CHG-RED',
                    attributeValues: { 'Color': 'Red' },
                    sellingPrice: 35000,
                    costPrice: 24000,
                    stock: 40,
                    image: '/products/apple-adapter.png'
                }]
            },
            {
                name: 'Xiaomi 20000mAh Power Bank 3 Pro',
                slug: 'xiaomi-20000mah-power-bank-3-pro',
                description: 'Triple USB output with 50W max. Charges laptops, tablets, and phones.',
                category: tecno._id,
                images: [
                    { url: '/products/oraimo-powerbank.png', key: 'xiaomi-pb-3-pro', alt: 'Xiaomi Power Bank', isPrimary: true }
                ],
                status: 'active',
                featured: false,
                salesCount: 5,
                compatibility: { brands: ['Xiaomi', 'Apple', 'Samsung'], models: [] },
                options: [{ name: 'Color', values: [{ value: 'Black' }] }],
                variants: [{
                    sku: 'XIA-PB3P-20K-BLK',
                    attributeValues: { 'Color': 'Black' },
                    sellingPrice: 28000,
                    costPrice: 18000,
                    stock: 30,
                    image: '/products/oraimo-powerbank.png'
                }]
            }
        ];

        await Product.create(products);
        console.log(`✅ Created ${products.length} products for homepage sections:`);
        console.log('   🔥 2 On Sale products (with compareAtPrice)');
        console.log('   ⭐ 3 Featured products (featured: true)');
        console.log('   📈 2 Trending products (salesCount > 50)');
        console.log('   🆕 3 New Arrivals (recent products)');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
}

seedHomepageProducts();
