import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';

/**
 * Get instant search results (Predictive)
 * endpoint: GET /api/v1/search/instant?q=...
 */
export const getInstantResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.length < 2) {
            res.status(200).json({
                status: 'success',
                data: {
                    products: [],
                    categories: [],
                    brands: []
                }
            });
            return;
        }

        const regex = new RegExp(q, 'i'); // Case-insensitive match

        // Run queries in parallel for speed
        const [products, categories, brandDocs] = await Promise.all([
            // 1. Products (Limit 5)
            Product.find(
                {
                    status: 'active',
                    $or: [
                        { name: regex },
                        { 'compatibility.brands': regex }
                    ]
                },
                'name slug images variants.sellingPrice category' // Select only needed fields
            )
                .limit(5)
                .populate('category', 'name'),

            // 2. Categories (Limit 3)
            Category.find({ name: regex, active: true }, 'name slug icon').limit(3),

            // 3. Brands (Aggregation to find distinct matching brands)
            Product.aggregate([
                { $match: { status: 'active', 'compatibility.brands': regex } },
                { $unwind: '$compatibility.brands' },
                { $match: { 'compatibility.brands': regex } },
                { $group: { _id: '$compatibility.brands' } },
                { $limit: 3 }
            ])
        ]);

        const brands = brandDocs.map(doc => doc._id);

        res.status(200).json({
            status: 'success',
            data: {
                products,
                categories,
                brands
            }
        });

    } catch (error) {
        next(error);
    }
};
