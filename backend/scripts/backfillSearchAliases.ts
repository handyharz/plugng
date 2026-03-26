import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../src/models/Category';
import Product from '../src/models/Product';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugng';

const normalize = (value: string) => value.toLowerCase().trim();
const unique = (values: string[]) => Array.from(new Set(values.map(normalize).filter(Boolean)));

const categoryAliasPatterns: Array<{ test: (slug: string, name: string) => boolean; aliases: string[] }> = [
    { test: (slug) => slug === 'apple', aliases: ['iphone', 'ios', 'apple accessories'] },
    { test: (slug) => slug === 'samsung', aliases: ['galaxy', 'samsung galaxy'] },
    { test: (slug) => slug === 'xiaomi', aliases: ['redmi', 'poco', 'mi'] },
    { test: (slug) => slug === 'google-pixel', aliases: ['pixel', 'google phone'] },
    { test: (slug) => slug.includes('cases-covers'), aliases: ['case', 'cover', 'phone case', 'protective case'] },
    { test: (slug) => slug.includes('screen-protectors'), aliases: ['tempered glass', 'screen protector', 'screen guard'] },
    { test: (slug) => slug.includes('chargers-cables'), aliases: ['charger', 'cable', 'adapter', 'usb c'] },
    { test: (slug) => slug.includes('power-banks'), aliases: ['powerbank', 'portable charger', 'battery pack'] },
    { test: (slug) => slug.includes('earphones-headsets'), aliases: ['earbuds', 'headphones', 'headset', 'airpods'] },
    { test: (slug) => slug.includes('phone-holders-mounts'), aliases: ['holder', 'mount', 'car mount', 'stand'] },
    { test: (slug) => slug.includes('memory-storage'), aliases: ['sd card', 'storage', 'memory card'] },
    { test: (slug) => slug.includes('repair-parts'), aliases: ['repair', 'replacement screen', 'battery'] },
    { test: (slug) => slug.includes('silicone-cases'), aliases: ['silicone cover', 'soft case'] },
    { test: (slug) => slug.includes('transparent-cases'), aliases: ['clear case', 'clear cover'] },
    { test: (slug) => slug.includes('rugged-shockproof-cases'), aliases: ['shockproof case', 'rugged case'] },
    { test: (slug) => slug.includes('tempered-glass'), aliases: ['glass protector', 'screen protector'] },
    { test: (slug) => slug.includes('usb-type-c-cables'), aliases: ['usb c cable', 'type c cable'] },
    { test: (slug) => slug.includes('lightning-cables'), aliases: ['iphone cable', 'lightning charger'] },
    { test: (slug) => slug.includes('wireless-chargers'), aliases: ['wireless charger', 'magnetic charger'] },
];

const deriveCategoryAliases = (category: any) => {
    const slug = String(category.slug || '');
    const name = String(category.name || '');
    const aliases = [
        ...((category.searchAliases as string[]) || []),
        ...categoryAliasPatterns
            .filter((entry) => entry.test(slug, name))
            .flatMap((entry) => entry.aliases)
    ];

    return unique(aliases);
};

const deriveProductAliases = (product: any) => {
    const aliases = new Set<string>((product.searchAliases || []).map(normalize));
    const name = normalize(product.name || '');
    const brand = normalize(product.brand || '');

    if (brand) aliases.add(brand);

    (product.compatibility?.brands || []).forEach((entry: string) => aliases.add(normalize(entry)));
    (product.compatibility?.models || []).forEach((entry: string) => aliases.add(normalize(entry)));

    if (name.includes('case')) {
        aliases.add('cover');
        aliases.add('protective case');
    }
    if (name.includes('silicone')) aliases.add('silicone cover');
    if (name.includes('clear')) aliases.add('transparent case');
    if (name.includes('magsafe')) aliases.add('magnetic case');
    if (name.includes('charger') || name.includes('adapter')) {
        aliases.add('power adapter');
        aliases.add('fast charger');
    }
    if (name.includes('usb-c') || name.includes('usb c')) aliases.add('type c charger');
    if (name.includes('power bank')) {
        aliases.add('powerbank');
        aliases.add('portable charger');
    }
    if (name.includes('earbuds') || name.includes('airpods')) {
        aliases.add('earphones');
        aliases.add('wireless earbuds');
    }
    if (name.includes('screen protector') || name.includes('tempered glass')) {
        aliases.add('screen guard');
        aliases.add('glass protector');
    }

    (product.variants || []).forEach((variant: any) => {
        if (variant.sku) aliases.add(normalize(variant.sku));
        Object.values(variant.attributeValues || {}).forEach((value) => aliases.add(normalize(String(value))));
    });

    (product.options || []).forEach((option: any) => {
        if (option.name) aliases.add(normalize(option.name));
        (option.values || []).forEach((value: any) => {
            if (value.value) aliases.add(normalize(value.value));
        });
    });

    return unique(Array.from(aliases));
};

async function backfillSearchAliases() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const [categories, products] = await Promise.all([
            Category.find({}),
            Product.find({})
        ]);

        let updatedCategories = 0;
        let updatedProducts = 0;

        for (const category of categories) {
            const nextAliases = deriveCategoryAliases(category);
            if (JSON.stringify(nextAliases) !== JSON.stringify(category.searchAliases || [])) {
                category.searchAliases = nextAliases;
                await category.save({ validateBeforeSave: false });
                updatedCategories += 1;
            }
        }

        for (const product of products) {
            const nextAliases = deriveProductAliases(product);
            if (JSON.stringify(nextAliases) !== JSON.stringify(product.searchAliases || [])) {
                product.searchAliases = nextAliases;
                await product.save({ validateBeforeSave: false });
                updatedProducts += 1;
            }
        }

        console.log(`✅ Updated ${updatedCategories} categories with search aliases`);
        console.log(`✅ Updated ${updatedProducts} products with search aliases`);
        console.log('🎯 Search alias backfill complete');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error backfilling search aliases:', error);
        process.exit(1);
    }
}

backfillSearchAliases();
