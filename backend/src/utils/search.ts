import jwt from 'jsonwebtoken';
import Product from '../models/Product';
import Category from '../models/Category';
import Order from '../models/Order';
import type { Request } from 'express';

const FALLBACK_SYNONYM_GROUPS = [
    ['charger', 'charging', 'power adapter', 'adapter', 'fast charger', 'wall charger'],
    ['case', 'cover', 'protective case', 'shell'],
    ['screen protector', 'tempered glass', 'glass', 'screen guard'],
    ['earbuds', 'airpods', 'buds', 'earphones', 'wireless earbuds'],
    ['headphones', 'headset'],
    ['power bank', 'powerbank', 'portable charger'],
    ['usb c', 'usb-c', 'type c', 'type-c'],
    ['iphone', 'ios', 'apple'],
    ['samsung', 'galaxy'],
    ['magsafe', 'mag safe', 'magnetic'],
    ['cable', 'cord', 'wire'],
    ['speaker', 'bluetooth speaker'],
    ['watch', 'smartwatch', 'apple watch'],
];

const FALLBACK_TRENDING_TERMS = ['iPhone 15 Pro', '30W Charger', 'MagSafe Case', 'Screen Protector', 'AirPods', 'Power Bank'];
const SEARCH_LEXICON_CACHE_TTL = 1000 * 60 * 5;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeText = (value: unknown) =>
    String(value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const tokenize = (value: string) => normalizeText(value).split(' ').filter(Boolean);

const uniqueTerms = (terms: string[]) => Array.from(new Set(terms.filter(Boolean)));
const slugToTerm = (value: string) => normalizeText(value.replace(/-/g, ' '));

type SearchLexicon = {
    groups: string[][];
    generatedAt: number;
};

let lexiconCache: SearchLexicon | null = null;

const levenshteinDistance = (a: string, b: string) => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const matrix = Array.from({ length: b.length + 1 }, (_, row) =>
        Array.from({ length: a.length + 1 }, (_, col) => (row === 0 ? col : col === 0 ? row : 0))
    );

    for (let row = 1; row <= b.length; row += 1) {
        for (let col = 1; col <= a.length; col += 1) {
            const cost = a[col - 1] === b[row - 1] ? 0 : 1;
            matrix[row]![col] = Math.min(
                matrix[row - 1]![col]! + 1,
                matrix[row]![col - 1]! + 1,
                matrix[row - 1]![col - 1]! + cost
            );
        }
    }

    return matrix[b.length]![a.length]!;
};

const categoryToLexiconGroup = (category: any) =>
    uniqueTerms([
        normalizeText(category.name || ''),
        slugToTerm(category.slug || ''),
        ...(category.searchAliases || []).map((alias: string) => normalizeText(alias))
    ]).filter((term) => term.length >= 2);

const productToLexiconGroup = (product: any) =>
    uniqueTerms([
        normalizeText(product.name || ''),
        slugToTerm(product.slug || ''),
        normalizeText(product.brand || ''),
        normalizeText(product.subCategory || ''),
        ...(product.searchAliases || []).map((alias: string) => normalizeText(alias)),
        ...((product.compatibility?.brands || []).map((brand: string) => normalizeText(brand))),
        ...((product.compatibility?.models || []).map((model: string) => normalizeText(model)))
    ]).filter((term) => term.length >= 2);

const loadSearchLexicon = async () => {
    const now = Date.now();
    if (lexiconCache && now - lexiconCache.generatedAt < SEARCH_LEXICON_CACHE_TTL) {
        return lexiconCache.groups;
    }

    const [categories, products] = await Promise.all([
        Category.find({ active: true })
            .select('name slug searchAliases')
            .lean(),
        Product.find({ status: 'active' })
            .select('name slug brand subCategory searchAliases compatibility')
            .limit(250)
            .lean()
    ]);

    const dbGroups = [
        ...categories.map(categoryToLexiconGroup),
        ...products.map(productToLexiconGroup)
    ].filter((group) => group.length > 1);

    const groups = [
        ...dbGroups,
        ...FALLBACK_SYNONYM_GROUPS.map((group) => group.map((term) => normalizeText(term)))
    ];

    lexiconCache = {
        groups,
        generatedAt: now
    };

    return groups;
};

const getSynonyms = async (term: string) => {
    const normalized = normalizeText(term);
    const groups = await loadSearchLexicon();
    const matches = groups.find((group) => group.some((entry) => entry === normalized));
    return matches ? matches : [];
};

export const expandSearchTerms = async (query: string) => {
    const normalizedQuery = normalizeText(query);
    const tokens = tokenize(query);
    const expanded = new Set<string>([normalizedQuery, ...tokens]);

    for (const term of [normalizedQuery, ...tokens]) {
        const synonyms = await getSynonyms(term);
        synonyms.forEach((synonym) => expanded.add(synonym));
    }

    return uniqueTerms(Array.from(expanded)).filter((term) => term.length >= 2);
};

export const buildSearchClauses = (terms: string[]) => {
    return terms.flatMap((term) => {
        const regex = new RegExp(escapeRegex(term), 'i');
        return [
            { name: regex },
            { slug: regex },
            { searchAliases: regex },
            { description: regex },
            { subCategory: regex },
            { brand: regex },
            { metaTitle: regex },
            { metaDescription: regex },
            { 'compatibility.brands': regex },
            { 'compatibility.models': regex },
            { 'variants.sku': regex },
            { 'options.name': regex },
            { 'options.values.value': regex },
            { 'specifications.key': regex },
            { 'specifications.value': regex }
        ];
    });
};

const buildTextScore = (value: string | undefined, query: string, terms: string[], weight: number) => {
    if (!value) return 0;
    const normalizedValue = normalizeText(value);
    if (!normalizedValue) return 0;

    let score = 0;
    if (normalizedValue === query) score += weight * 1.9;
    if (normalizedValue.startsWith(query)) score += weight * 1.25;
    if (normalizedValue.includes(query)) score += weight;

    for (const term of terms) {
        if (!term || term === query) continue;
        if (normalizedValue === term) score += weight * 0.9;
        else if (normalizedValue.startsWith(term)) score += weight * 0.65;
        else if (normalizedValue.includes(term)) score += weight * 0.5;
    }

    const words = normalizedValue.split(' ');
    for (const word of words) {
        const distanceToQuery = levenshteinDistance(word, query);
        if (query.length >= 4 && distanceToQuery === 1) score += weight * 0.75;
        else if (query.length >= 6 && distanceToQuery === 2) score += weight * 0.4;

        for (const term of terms) {
            if (term.length < 4) continue;
            const distance = levenshteinDistance(word, term);
            if (distance === 1) score += weight * 0.4;
        }
    }

    return score;
};

const valueFromMap = (value: unknown) => {
    if (!value) return [];
    if (value instanceof Map) return Array.from(value.values()).map(String);
    if (typeof value === 'object') return Object.values(value as Record<string, string>).map(String);
    return [];
};

export type PersonalizationSignals = {
    userId?: string;
    tokens: string[];
    brands: string[];
    models: string[];
    productNames: string[];
};

export const getPersonalizationSignals = async (req: Request): Promise<PersonalizationSignals> => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token || !process.env.JWT_ACCESS_SECRET) {
        return { tokens: [], brands: [], models: [], productNames: [] };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as { id?: string };
        if (!decoded.id) {
            return { tokens: [], brands: [], models: [], productNames: [] };
        }

        const orders = await Order.find({
            user: decoded.id,
            paymentStatus: 'paid'
        })
            .sort({ createdAt: -1 })
            .limit(8)
            .select('items.product items.name');

        const productIds = uniqueTerms(
            orders.flatMap((order: any) => order.items.map((item: any) => String(item.product))).filter(Boolean)
        );

        const purchasedProducts = productIds.length
            ? await Product.find({ _id: { $in: productIds } })
                .select('name compatibility.brands compatibility.models')
                .lean()
            : [];

        const brands = uniqueTerms(
            purchasedProducts.flatMap((product: any) => (product.compatibility?.brands || []).map((brand: string) => normalizeText(brand)))
        );
        const models = uniqueTerms(
            purchasedProducts.flatMap((product: any) => (product.compatibility?.models || []).map((model: string) => normalizeText(model)))
        );
        const productNames = uniqueTerms(
            purchasedProducts.map((product: any) => normalizeText(product.name)).filter(Boolean)
        );
        const tokens = uniqueTerms(
            [...brands, ...models, ...productNames.flatMap((name) => tokenize(name))]
                .filter((term) => term.length >= 3)
                .slice(0, 20)
        );

        return {
            userId: decoded.id,
            tokens,
            brands,
            models,
            productNames
        };
    } catch {
        return { tokens: [], brands: [], models: [], productNames: [] };
    }
};

export const scoreProductResult = (
    product: any,
    query: string,
    expandedTerms: string[],
    personalization?: PersonalizationSignals
) => {
    const normalizedQuery = normalizeText(query);

    const textWeights = [
        [product.name, 120],
        [product.slug, 70],
        [(product.searchAliases || []).join(' '), 58],
        [product.description, 34],
        [product.subCategory, 28],
        [product.brand, 35],
        [product.metaTitle, 24],
        [product.metaDescription, 18],
        [product.category?.name, 28]
    ] as const;

    let score = textWeights.reduce(
        (total, [value, weight]) => total + buildTextScore(value, normalizedQuery, expandedTerms, weight),
        0
    );

    const brandValues = (product.compatibility?.brands || []) as string[];
    const modelValues = (product.compatibility?.models || []) as string[];
    const variantValues = (product.variants || []).flatMap((variant: any) => [
        variant.sku,
        ...valueFromMap(variant.attributeValues)
    ]);
    const optionValues = (product.options || []).flatMap((option: any) => [
        option.name,
        ...(option.values || []).map((value: any) => value.value)
    ]);
    const specificationValues = (product.specifications || []).flatMap((spec: any) => [spec.key, spec.value]);

    [...brandValues, ...modelValues].forEach((value) => {
        score += buildTextScore(value, normalizedQuery, expandedTerms, 58);
    });

    variantValues.forEach((value: string) => {
        score += buildTextScore(value, normalizedQuery, expandedTerms, 44);
    });

    optionValues.forEach((value: string) => {
        score += buildTextScore(value, normalizedQuery, expandedTerms, 24);
    });

    specificationValues.forEach((value: string) => {
        score += buildTextScore(value, normalizedQuery, expandedTerms, 20);
    });

    if (product.featured) score += 16;
    score += Math.min((product.salesCount || 0) * 1.7, 42);
    score += Math.min((product.views || 0) * 0.08, 20);
    if (product.status === 'active') score += 6;

    if (personalization?.tokens.length) {
        const personalizationMatches = [
            ...brandValues.map(normalizeText),
            ...modelValues.map(normalizeText),
            normalizeText(product.name),
            ...variantValues.map(normalizeText)
        ].filter((value) => Boolean(value));

        let matchedSignals = 0;
        personalization.tokens.forEach((signal) => {
            if (personalizationMatches.some((value) => value.includes(signal) || signal.includes(value))) {
                matchedSignals += 1;
            }
        });

        score += Math.min(matchedSignals * 14, 56);
    }

    return Math.round(score);
};

export const scoreCategoryResult = (category: any, query: string, expandedTerms: string[]) => {
    const normalizedQuery = normalizeText(query);
    let score = 0;

    score += buildTextScore(category.name, normalizedQuery, expandedTerms, 96);
    score += buildTextScore(category.slug, normalizedQuery, expandedTerms, 42);
    score += buildTextScore((category.searchAliases || []).join(' '), normalizedQuery, expandedTerms, 48);
    score += buildTextScore(category.description, normalizedQuery, expandedTerms, 26);
    score += buildTextScore(category.metaTitle, normalizedQuery, expandedTerms, 18);
    score += buildTextScore(category.metaDescription, normalizedQuery, expandedTerms, 14);

    if (category.featured) score += 12;
    score += Math.min((category.productCount || 0) * 0.6, 24);

    return Math.round(score);
};

export const scoreBrandResult = (
    brand: string,
    query: string,
    expandedTerms: string[],
    personalization?: PersonalizationSignals
) => {
    const normalizedQuery = normalizeText(query);
    let score = buildTextScore(brand, normalizedQuery, expandedTerms, 90);

    if (personalization?.brands.includes(normalizeText(brand))) {
        score += 28;
    }

    return Math.round(score);
};

const extractCategoryTerms = (categories: any[]) =>
    uniqueTerms(
        categories
            .filter((category) => category?.featured || (category?.productCount || 0) > 0)
            .sort((left, right) => (right.productCount || 0) - (left.productCount || 0))
            .slice(0, 10)
            .flatMap((category) => [category.name, ...(category.searchAliases || []).slice(0, 2)])
    );

const extractBrandTerms = (products: any[]) => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
        (product.compatibility?.brands || []).forEach((brand: string) => {
            const normalized = brand.trim();
            if (!normalized) return;
            counts.set(normalized, (counts.get(normalized) || 0) + 1);
        });
    });

    return Array.from(counts.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 10)
        .map(([brand]) => brand);
};

const extractProductTerms = (products: any[]) =>
    uniqueTerms(products.slice(0, 12).flatMap((product) => [product.name, ...(product.searchAliases || []).slice(0, 2)]).filter(Boolean));

export const buildTrendingPayload = async () => {
    const [products, categories] = await Promise.all([
        Product.find({ status: 'active' })
            .sort({ featured: -1, salesCount: -1, views: -1, createdAt: -1 })
            .limit(18)
            .select('name searchAliases compatibility.brands salesCount views featured'),
        Category.find({ active: true })
            .sort({ featured: -1, productCount: -1, order: 1 })
            .limit(12)
            .select('name slug searchAliases productCount featured')
    ]);

    const dbTerms = uniqueTerms([
        ...extractProductTerms(products),
        ...extractBrandTerms(products),
        ...extractCategoryTerms(categories)
    ]);

    const derivedTerms = (dbTerms.length ? dbTerms : FALLBACK_TRENDING_TERMS).slice(0, 8);

    return {
        terms: derivedTerms,
        categories: categories.slice(0, 6),
        brands: extractBrandTerms(products).slice(0, 6)
    };
};

export const enrichSearchQueryMeta = (query: string, expandedTerms: string[], personalization?: PersonalizationSignals) => ({
    normalizedQuery: normalizeText(query),
    expandedTerms: expandedTerms.filter((term) => term !== normalizeText(query)).slice(0, 8),
    personalized: Boolean(personalization?.tokens.length)
});
