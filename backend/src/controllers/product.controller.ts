import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { optimizeAndUploadImage } from '../services/storageService';
import slugify from 'slugify';

/**
 * Helper: Process and Upload Images
 */
const uploadImages = async (files: Express.Multer.File[]): Promise<string[]> => {
    const uploadPromises = files.map(async file => {
        const { url } = await optimizeAndUploadImage(file.buffer);
        return url;
    });
    return Promise.all(uploadPromises);
};

/**
 * Create a new product
 */
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            name,
            description,
            category,
            brand,
            data // Expecting JSON string for complex nested data like attributes, options, variants
        } = req.body;

        // 1. Basic Validation
        if (!name || !description || !category) {
            res.status(400).json({ status: 'fail', message: 'Missing required fields' });
            return;
        }

        // 2. Parse JSON Data (for variants, options, etc.)
        let parsedData: any = {};
        if (data) {
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                res.status(400).json({ status: 'fail', message: 'Invalid JSON in "data" field' });
                return;
            }
        }

        // 3. Handle Main Product Images
        // req.files is an object if fields are used, or array if just array()
        // We will assume upload.fields([{ name: 'images', maxCount: 10 }, { name: 'variantImages', maxCount: 20 }])
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        let imageUrls: string[] = [];
        if (files && files['images']) {
            imageUrls = await uploadImages(files['images']);
        }

        // 4. Handle Variant Images (Map them to variants?)
        // For simplicity in this iteration, we might just upload them and expect frontend to link specific URLs.
        // OR, we can allow uploading specific indices.
        // Let's assume parsedData.variants contains the logic, but images need to be mapped.
        // A common strategy: Variants have an "imageIndex" in JSON, mapping to the uploaded file index.
        // But for now, let's keep it simple: Main images only, or user passes URLs if already uploaded.
        // Wait, 'options' might have swatches.

        // Let's just create the product document
        const slug = slugify(name, { lower: true });

        const product = await Product.create({
            name,
            slug,
            description,
            category,
            brand,
            images: imageUrls,
            // Spread parsed data (options, variants, specifications, etc.)
            ...parsedData
        });

        res.status(201).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all products (with pagination/filtering)
 */
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            search,
            sort,
            inStock,
            onSale,
            featured,
            trending,
            brands,
            colors,
            page: reqPage,
            limit: reqLimit
        } = req.query;

        const page = parseInt(reqPage as string) || 1;
        const limit = parseInt(reqLimit as string) || 20;
        const skip = (page - 1) * limit;

        // Initial filters - only active products unless admin specifies?
        // For now, let's assume active only for public
        const query: any = { status: 'active' };

        // 1. Search Logic
        if (search) {
            query.$text = { $search: search as string };
        }

        // 2. Category Logic (Recursive)
        if (category && category !== 'all') {
            const categoryDoc = await Category.findOne({ slug: category as string });
            if (categoryDoc) {
                // Find all sub-categories (level 2)
                const subCategories = await Category.find({ parent: categoryDoc._id });
                const subCategoryIds = subCategories.map(c => c._id);

                // Find sub-sub-categories (level 3)
                const level3Categories = await Category.find({ parent: { $in: subCategoryIds } });

                const allCategoryIds = [
                    categoryDoc._id,
                    ...subCategoryIds,
                    ...level3Categories.map(c => c._id)
                ];

                query.category = { $in: allCategoryIds };
            }
        }

        // 3. Price Logic (Filtering on variants)
        if (minPrice || maxPrice) {
            query['variants.sellingPrice'] = {};
            if (minPrice) query['variants.sellingPrice'].$gte = parseFloat(minPrice as string);
            if (maxPrice) query['variants.sellingPrice'].$lte = parseFloat(maxPrice as string);
        }

        // 4. Stock Availability Filter
        if (inStock === 'true') {
            query['variants.stock'] = { $gt: 0 };
        }

        // 5. On Sale Filter (products with discount)
        if (onSale === 'true') {
            query.$expr = {
                $gt: [
                    {
                        $size: {
                            $filter: {
                                input: "$variants",
                                as: "variant",
                                cond: {
                                    $and: [
                                        { $gt: ["$$variant.compareAtPrice", "$$variant.sellingPrice"] },
                                        { $ne: ["$$variant.compareAtPrice", null] }
                                    ]
                                }
                            }
                        }
                    },
                    0
                ]
            };
        }

        // 6. Featured/Trending Filters
        if (featured === 'true') {
            query.featured = true;
        }
        if (trending === 'true') {
            // For now, use salesCount as trending indicator
            query.salesCount = { $gt: 0 };
        }

        // 7. Brand/Compatibility Filter
        if (brands) {
            const brandArray = Array.isArray(brands) ? brands : (brands as string).split(',');
            query['compatibility.brands'] = { $in: brandArray };
        }

        // 8. Color Filter
        if (colors) {
            const colorArray = Array.isArray(colors) ? colors : (colors as string).split(',');
            query['options'] = {
                $elemMatch: {
                    name: { $in: ['Color', 'Colour'] },
                    'values.value': { $in: colorArray }
                }
            };
        }

        // 9. Sort Logic
        let sortQuery: any = { createdAt: -1 };
        if (sort === 'price-asc') sortQuery = { 'variants.sellingPrice': 1 };
        if (sort === 'price-desc') sortQuery = { 'variants.sellingPrice': -1 };
        if (sort === 'newest') sortQuery = { createdAt: -1 };

        const startTime = Date.now();
        const products = await Product.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate('category', 'name slug');

        const total = await Product.countDocuments(query);
        console.log(`📦 Product Search Query: ${Date.now() - startTime}ms`);

        res.status(200).json({
            status: 'success',
            results: products.length,
            data: {
                products,
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single product
 */
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        let query;

        if (!id) {
            res.status(400).json({ status: 'fail', message: 'Product ID or Slug is required' });
            return;
        }

        // Check if id is a valid ObjectId
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            query = Product.findById(id);
        } else {
            // Otherwise treat as slug
            query = Product.findOne({ slug: id });
        }

        const product = await query.populate('category');

        if (!product) {
            res.status(404).json({ status: 'fail', message: 'Product not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get available filter options (brands, colors)
 */
export const getFilterOptions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        // Get unique brands from compatibility.brands
        const brands = await Product.distinct('compatibility.brands', { status: 'active' });

        // Get unique colors from options where name is 'Color'
        const colorDocs = await Product.aggregate([
            { $match: { status: 'active' } },
            { $unwind: '$options' },
            { $match: { 'options.name': { $in: ['Color', 'Colour'] } } },
            { $unwind: '$options.values' },
            { $group: { _id: '$options.values.value' } },
            { $sort: { _id: 1 } }
        ]);

        const colors = colorDocs.map(doc => doc._id).filter(Boolean);

        res.status(200).json({
            status: 'success',
            data: {
                brands: brands.filter(Boolean).sort(),
                colors
            }
        });
    } catch (error) {
        next(error);
    }
};
