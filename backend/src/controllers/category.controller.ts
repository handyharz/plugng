import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import slugify from 'slugify';

// Create new category (Admin only)
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description, image, icon, parent, level, order, featured, metaTitle, metaDescription } = req.body;

        // Generate slug from name
        const slug = slugify(name, { lower: true, strict: true });

        // Check if slug already exists
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            res.status(400).json({
                status: 'fail',
                message: 'Category with this name already exists'
            });
            return;
        }

        // If parent is provided, verify it exists and set level accordingly
        let categoryLevel = level || 1;
        if (parent) {
            const parentCategory = await Category.findById(parent);
            if (!parentCategory) {
                res.status(404).json({
                    status: 'fail',
                    message: 'Parent category not found'
                });
                return;
            }
            categoryLevel = parentCategory.level + 1;
            if (categoryLevel > 3) {
                res.status(400).json({
                    status: 'fail',
                    message: 'Maximum category depth is 3 levels'
                });
                return;
            }
        }

        const category = await Category.create({
            name,
            slug,
            description,
            image,
            icon,
            parent: parent || null,
            level: categoryLevel,
            order: order || 0,
            featured: featured || false,
            metaTitle: metaTitle || name,
            metaDescription: metaDescription || description
        });

        res.status(201).json({
            status: 'success',
            data: { category }
        });
    } catch (error) {
        next(error);
    }
};

// Get all categories with optional filtering
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { level, parent, featured, active } = req.query;

        const filter: any = {};
        if (level) filter.level = parseInt(level as string);
        if (parent) filter.parent = parent === 'null' ? null : parent;
        if (featured !== undefined) filter.featured = featured === 'true';
        if (active !== undefined) filter.active = active === 'true';

        const categories = await Category.find(filter)
            .populate({
                path: 'parent',
                select: '_id name slug parent',
                populate: {
                    path: 'parent',
                    select: '_id name slug'
                }
            })
            .sort({ level: 1, order: 1, name: 1 })
            .lean();

        // Construct full names for hierarchical categories
        const categoriesWithFullNames = categories.map((cat: any) => {
            let fullName = cat.name;
            if (cat.parent) {
                fullName = `${cat.parent.name} > ${fullName}`;
                if (cat.parent.parent) {
                    fullName = `${cat.parent.parent.name} > ${fullName}`;
                }
            }
            return { ...cat, fullName };
        });

        res.status(200).json({
            status: 'success',
            results: categoriesWithFullNames.length,
            data: { categories: categoriesWithFullNames }
        });
    } catch (error) {
        next(error);
    }
};

import Product from '../models/Product';
// ... (keep existing imports)

// Get category tree (hierarchical structure)
export const getCategoryTree = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // 1. Get all active categories
        const allCategories = await Category.find({ active: true }).sort({ order: 1, name: 1 }).lean();

        // 2. Get product counts and details per category
        const productStats = await Product.aggregate([
            { $match: { status: 'active' } },
            { $sort: { salesCount: -1 } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    products: {
                        $push: {
                            name: '$name',
                            image: { $arrayElemAt: ['$images.url', 0] }
                        }
                    }
                }
            },
            {
                $project: {
                    count: 1,
                    products: { $slice: ['$products', 3] }
                }
            }
        ]);

        // Create a map for quick lookup
        const statsMap = new Map();
        productStats.forEach((item: any) => {
            if (item._id) statsMap.set(item._id.toString(), { count: item.count, products: item.products });
        });

        // 3. Build tree structure
        const categoryMap = new Map();
        const tree: any[] = [];

        // First pass: create map and assign direct stats
        allCategories.forEach(cat => {
            const stats = statsMap.get(cat._id.toString()) || { count: 0, products: [] };
            categoryMap.set(cat._id.toString(), {
                ...cat,
                productCount: stats.count,
                products: stats.products,
                children: []
            });
        });

        // Second pass: build tree
        allCategories.forEach(cat => {
            const category = categoryMap.get(cat._id.toString());
            if (cat.parent) {
                const parent = categoryMap.get(cat.parent.toString());
                if (parent) {
                    parent.children.push(category);
                }
            } else {
                tree.push(category);
            }
        });

        // Helper to calculate total count and collect products recursively
        const calculateRecursiveStats = (category: any) => {
            let totalCount = category.productCount || 0;
            let allProducts: any[] = category.products || [];

            if (category.children && category.children.length > 0) {
                category.children.forEach((child: any) => {
                    const childStats = calculateRecursiveStats(child);
                    totalCount += childStats.count;
                    // Add child products to parent list
                    allProducts = [...allProducts, ...childStats.products];
                });
            }

            // Update category with recursive stats
            category.productCount = totalCount;
            // Deduplicate by name and keep top 3
            const seen = new Set();
            category.products = allProducts.filter(p => {
                if (!p || !p.name) return false;
                const duplicate = seen.has(p.name);
                seen.add(p.name);
                return !duplicate;
            }).slice(0, 3);

            return { count: totalCount, products: category.products };
        };

        // Calculate stats for all root nodes
        tree.forEach(root => calculateRecursiveStats(root));

        res.status(200).json({
            status: 'success',
            data: { tree }
        });
    } catch (error) {
        next(error);
    }
};

// Get single category by slug
export const getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { slug } = req.params;

        const category = await Category.findOne({ slug })
            .populate('parent', 'name slug')
            .populate('children');

        if (!category) {
            res.status(404).json({
                status: 'fail',
                message: 'Category not found'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { category }
        });
    } catch (error) {
        next(error);
    }
};

// Update category (Admin only)
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // If name is being updated, regenerate slug
        if (updates.name) {
            updates.slug = slugify(updates.name, { lower: true, strict: true });
        }

        // Prevent changing parent to create circular reference
        if (updates.parent) {
            const category = await Category.findById(id);
            if (category && updates.parent === id) {
                res.status(400).json({
                    status: 'fail',
                    message: 'Category cannot be its own parent'
                });
                return;
            }
        }

        const category = await Category.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('parent', 'name slug');

        if (!category) {
            res.status(404).json({
                status: 'fail',
                message: 'Category not found'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { category }
        });
    } catch (error) {
        next(error);
    }
};

// Delete category (Admin only - soft delete)
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if category has active children
        const hasChildren = await Category.findOne({ parent: id, active: true });
        if (hasChildren) {
            res.status(400).json({
                status: 'fail',
                message: 'Cannot delete category with subcategories. Delete children first.'
            });
            return;
        }

        // Soft delete by setting active to false
        const category = await Category.findByIdAndUpdate(
            id,
            { active: false },
            { new: true }
        );

        if (!category) {
            res.status(404).json({
                status: 'fail',
                message: 'Category not found'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: 'Category deleted successfully',
            data: { category }
        });
    } catch (error) {
        next(error);
    }
};
