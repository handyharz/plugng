// npx ts-node scripts/seedCategories.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../src/models/Category';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugng';

// Nigerian Phone Accessory Categories
const categories = [
    // Level 1: Phone Brands
    { name: 'Apple (iPhone)', slug: 'apple', searchAliases: ['iphone', 'ios', 'apple accessories'], level: 1, order: 1, featured: true, description: 'Premium accessories for iPhone users', icon: '📱' },
    { name: 'Samsung', slug: 'samsung', searchAliases: ['galaxy', 'samsung galaxy'], level: 1, order: 2, featured: true, description: 'Quality accessories for Samsung Galaxy devices', icon: '📱' },
    { name: 'Tecno', slug: 'tecno', searchAliases: ['tecno spark', 'tecno camon'], level: 1, order: 3, featured: true, description: 'Affordable accessories for Tecno smartphones', icon: '📱' },
    { name: 'Infinix', slug: 'infinix', searchAliases: ['hot', 'note', 'smart'], level: 1, order: 4, featured: true, description: 'Stylish accessories for Infinix phones', icon: '📱' },
    { name: 'Xiaomi', slug: 'xiaomi', searchAliases: ['redmi', 'poco', 'mi'], level: 1, order: 5, featured: false, description: 'Smart accessories for Xiaomi, Redmi & Poco', icon: '📱' },
    { name: 'Oppo', slug: 'oppo', searchAliases: ['reno', 'a series'], level: 1, order: 6, featured: false, description: 'Trendy accessories for Oppo smartphones', icon: '📱' },
    { name: 'Realme', slug: 'realme', searchAliases: ['narzo', 'gt'], level: 1, order: 7, featured: false, description: 'Modern accessories for Realme devices', icon: '📱' },
    { name: 'Google Pixel', slug: 'google-pixel', searchAliases: ['pixel', 'google phone'], level: 1, order: 8, featured: false, description: 'Premium accessories for Google Pixel', icon: '📱' },
    { name: 'Oraimo', slug: 'oraimo', searchAliases: ['oraimo accessories', 'power bank', 'charger'], level: 1, order: 9, featured: true, description: 'Authentic Oraimo power banks and accessories', icon: '🔋' },
    { name: 'Other Brands', slug: 'other-brands', searchAliases: ['other phones', 'miscellaneous brands'], level: 1, order: 10, featured: false, description: 'Accessories for other smartphone brands', icon: '📱' },
];

// Level 2: Accessory Types (will be created for each brand)
const accessoryTypes = [
    { name: 'Cases & Covers', slug: 'cases-covers', searchAliases: ['case', 'cover', 'phone case', 'protective case'], description: 'Protective cases and stylish covers', icon: '🛡️', order: 1 },
    { name: 'Screen Protectors', slug: 'screen-protectors', searchAliases: ['tempered glass', 'screen guard', 'privacy glass'], description: 'Tempered glass and film protectors', icon: '🔲', order: 2 },
    { name: 'Chargers & Cables', slug: 'chargers-cables', searchAliases: ['charger', 'cable', 'cord', 'adapter', 'usb c'], description: 'Fast chargers and durable cables', icon: '🔌', order: 3 },
    { name: 'Power Banks', slug: 'power-banks', searchAliases: ['powerbank', 'portable charger', 'battery pack'], description: 'Portable charging solutions', icon: '🔋', order: 4 },
    { name: 'Earphones & Headsets', slug: 'earphones-headsets', searchAliases: ['earbuds', 'airpods', 'headphones', 'headset'], description: 'Wired and wireless audio accessories', icon: '🎧', order: 5 },
    { name: 'Phone Holders & Mounts', slug: 'phone-holders-mounts', searchAliases: ['mount', 'holder', 'car mount', 'stand'], description: 'Car mounts and desk stands', icon: '🚗', order: 6 },
    { name: 'Memory Cards & Storage', slug: 'memory-storage', searchAliases: ['sd card', 'storage', 'memory card'], description: 'Expand your phone storage', icon: '💾', order: 7 },
    { name: 'Repair Parts', slug: 'repair-parts', searchAliases: ['replacement screen', 'battery', 'repair'], description: 'Replacement screens and batteries', icon: '🔧', order: 8 },
];

// Level 3: Specific Categories (examples for Cases & Chargers)
const specificCategories: any = {
    'cases-covers': [
        { name: 'Silicone Cases', slug: 'silicone-cases', searchAliases: ['silicone cover', 'soft case'], order: 1 },
        { name: 'Hard Shell Cases', slug: 'hard-shell-cases', searchAliases: ['hard case', 'shell case'], order: 2 },
        { name: 'Flip/Wallet Cases', slug: 'flip-wallet-cases', searchAliases: ['wallet cover', 'flip cover'], order: 3 },
        { name: 'Transparent Cases', slug: 'transparent-cases', searchAliases: ['clear case', 'clear cover'], order: 4 },
        { name: 'Rugged/Shockproof Cases', slug: 'rugged-shockproof-cases', searchAliases: ['shockproof case', 'rugged case'], order: 5 },
    ],
    'screen-protectors': [
        { name: 'Tempered Glass', slug: 'tempered-glass', searchAliases: ['screen protector', 'glass protector'], order: 1 },
        { name: 'Hydrogel Film', slug: 'hydrogel-film', searchAliases: ['screen film', 'hydrogel protector'], order: 2 },
        { name: 'Privacy Screen', slug: 'privacy-screen', searchAliases: ['privacy glass', 'privacy protector'], order: 3 },
        { name: 'Camera Lens Protector', slug: 'camera-lens-protector', searchAliases: ['lens guard', 'camera glass'], order: 4 },
    ],
    'chargers-cables': [
        { name: 'Fast Chargers (18W-65W)', slug: 'fast-chargers', searchAliases: ['fast charger', 'power adapter'], order: 1 },
        { name: 'USB Type-C Cables', slug: 'usb-type-c-cables', searchAliases: ['usb c cable', 'type c cable'], order: 2 },
        { name: 'Lightning Cables', slug: 'lightning-cables', searchAliases: ['iphone cable', 'lightning charger'], order: 3 },
        { name: 'Micro-USB Cables', slug: 'micro-usb-cables', searchAliases: ['micro usb charger', 'android cable'], order: 4 },
        { name: 'Car Chargers', slug: 'car-chargers', searchAliases: ['car adapter', 'vehicle charger'], order: 5 },
        { name: 'Wireless Chargers', slug: 'wireless-chargers', searchAliases: ['wireless charger', 'magnetic charger'], order: 6 },
    ],
    'power-banks': [
        { name: 'Fast Charging Power Banks', slug: 'fast-charging', searchAliases: ['fast powerbank', 'quick charge power bank'], order: 1 },
        { name: 'High Capacity (20k-50k)', slug: 'high-capacity', searchAliases: ['20000mah', '50000mah', 'big power bank'], order: 2 },
        { name: 'Mini/Portable Power Banks', slug: 'mini-portable', searchAliases: ['mini powerbank', 'portable charger'], order: 3 },
    ],
};

async function seedCategories() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('🗑️  Cleared existing categories');

        // Create Level 1 categories (Brands)
        const createdBrands = await Category.insertMany(categories);
        console.log(`✅ Created ${createdBrands.length} brand categories`);

        // Create Level 2 categories (Accessory Types) for each brand
        const level2Categories = [];
        for (const brand of createdBrands) {
            for (const type of accessoryTypes) {
                level2Categories.push({
                    name: type.name,
                    slug: `${brand.slug}-${type.slug}`,
                    searchAliases: type.searchAliases,
                    description: type.description,
                    icon: type.icon,
                    parent: brand._id,
                    level: 2,
                    order: type.order,
                    active: true,
                    featured: false
                });
            }
        }
        const createdTypes = await Category.insertMany(level2Categories);
        console.log(`✅ Created ${createdTypes.length} accessory type categories`);

        // Create Level 3 categories (Specific) for selected types
        const level3Categories = [];
        for (const typeCategory of createdTypes) {
            const matchingAccessoryType = accessoryTypes.find((type) =>
                typeCategory.slug.endsWith(`-${type.slug}`)
            );
            const baseTypeSlug = matchingAccessoryType?.slug;

            if (baseTypeSlug && specificCategories[baseTypeSlug]) {
                for (const specific of specificCategories[baseTypeSlug]) {
                    level3Categories.push({
                        name: specific.name,
                        slug: `${typeCategory.slug}-${specific.slug}`,
                        searchAliases: specific.searchAliases,
                        parent: typeCategory._id,
                        level: 3,
                        order: specific.order,
                        active: true,
                        featured: false
                    });
                }
            }
        }
        const createdSpecific = await Category.insertMany(level3Categories);
        console.log(`✅ Created ${createdSpecific.length} specific categories`);

        console.log(`\n🎉 Total categories created: ${createdBrands.length + createdTypes.length + createdSpecific.length}`);
        console.log('📊 Breakdown:');
        console.log(`   - Level 1 (Brands): ${createdBrands.length}`);
        console.log(`   - Level 2 (Types): ${createdTypes.length}`);
        console.log(`   - Level 3 (Specific): ${createdSpecific.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
