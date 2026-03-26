import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import {
    buildSearchClauses,
    buildTrendingPayload,
    enrichSearchQueryMeta,
    expandSearchTerms,
    getPersonalizationSignals,
    scoreBrandResult,
    scoreCategoryResult,
    scoreProductResult
} from '../utils/search';

/**
 * Get instant search results (Predictive)
 * endpoint: GET /api/v1/search/instant?q=...
 */
export const getInstantResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.length < 2) {
            const trending = await buildTrendingPayload();
            res.status(200).json({
                status: 'success',
                data: {
                    products: [],
                    categories: [],
                    brands: [],
                    suggestions: trending.terms,
                    trending,
                    queryMeta: {
                        normalizedQuery: '',
                        expandedTerms: [],
                        personalized: false
                    }
                }
            });
            return;
        }

        const searchQuery = q.trim();
        const expandedTerms = await expandSearchTerms(searchQuery);
        const clauses = buildSearchClauses(expandedTerms);
        const personalization = await getPersonalizationSignals(req);

        const [candidateProducts, candidateCategories, trending] = await Promise.all([
            Product.find(
                {
                    status: 'active',
                    $or: clauses
                },
                'name slug searchAliases images variants.sellingPrice category description subCategory compatibility options specifications metaTitle metaDescription featured salesCount views status brand'
            )
                .limit(40)
                .populate('category', 'name'),
            Category.find(
                {
                    active: true,
                    $or: expandedTerms.flatMap((term) => {
                        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                        return [{ name: regex }, { slug: regex }, { description: regex }, { metaTitle: regex }, { metaDescription: regex }];
                    })
                },
                'name slug searchAliases icon description metaTitle metaDescription featured productCount'
            ).limit(20),
            buildTrendingPayload()
        ]);

        const products = candidateProducts
            .map((product: any) => ({
                ...product.toObject(),
                _score: scoreProductResult(product, searchQuery, expandedTerms, personalization)
            }))
            .filter((product) => product._score > 0)
            .sort((left, right) => right._score - left._score)
            .slice(0, 6);

        const categories = candidateCategories
            .map((category: any) => ({
                ...category.toObject(),
                _score: scoreCategoryResult(category, searchQuery, expandedTerms)
            }))
            .filter((category) => category._score > 0)
            .sort((left, right) => right._score - left._score)
            .slice(0, 4);

        const brandCounts = new Map<string, number>();
        candidateProducts.forEach((product: any) => {
            (product.compatibility?.brands || []).forEach((brand: string) => {
                if (!brand) return;
                brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
            });
        });

        const brands = Array.from(brandCounts.keys())
            .map((brand) => ({
                label: brand,
                _score: scoreBrandResult(brand, searchQuery, expandedTerms, personalization) + (brandCounts.get(brand) || 0) * 4
            }))
            .filter((brand) => brand._score > 0)
            .sort((left, right) => right._score - left._score)
            .slice(0, 5)
            .map((brand) => brand.label);

        const suggestions = Array.from(new Set([
            searchQuery,
            ...products.map((product) => product.name),
            ...brands,
            ...categories.map((category) => category.name),
            ...trending.terms
        ])).slice(0, 8);

        res.status(200).json({
            status: 'success',
            data: {
                products,
                categories,
                brands,
                suggestions,
                trending,
                queryMeta: enrichSearchQueryMeta(searchQuery, expandedTerms, personalization)
            }
        });

    } catch (error) {
        next(error);
    }
};

export const getTrendingSearchData = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const trending = await buildTrendingPayload();
        res.status(200).json({
            status: 'success',
            data: trending
        });
    } catch (error) {
        next(error);
    }
};
