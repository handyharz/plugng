import { Request, Response, NextFunction } from 'express';
import Wishlist from '../models/Wishlist';

/**
 * Get user's wishlist
 */
export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user!.id }).populate('items.product');

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user!.id, items: [] });
        }

        // Filter out items where product is null (product was deleted)
        const originalCount = wishlist.items.length;
        wishlist.items = wishlist.items.filter(item => item.product !== null);

        if (wishlist.items.length !== originalCount) {
            await wishlist.save();
        }

        res.status(200).json({
            status: 'success',
            data: { wishlist }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add product to wishlist
 */
export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.body;
        let wishlist = await Wishlist.findOne({ user: req.user!.id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user!.id, items: [] });
        }

        // Check if product already exists in wishlist
        const exists = wishlist.items.some(item => item.product.toString() === productId);
        if (exists) {
            res.status(400).json({ status: 'fail', message: 'Product already in wishlist' });
            return;
        }

        wishlist.items.push({ product: productId, addedAt: new Date() } as any);
        await wishlist.save();

        // Populate and return
        await wishlist.populate('items.product');

        // Filter out items where product is null
        wishlist.items = wishlist.items.filter(item => item.product !== null);

        res.status(200).json({
            status: 'success',
            data: { wishlist }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const wishlist = await Wishlist.findOne({ user: req.user!.id });

        if (!wishlist) {
            res.status(404).json({ status: 'fail', message: 'Wishlist not found' });
            return;
        }

        wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);
        await wishlist.save();
        await wishlist.populate('items.product');

        // Filter out items where product is null
        wishlist.items = wishlist.items.filter(item => item.product !== null);

        res.status(200).json({
            status: 'success',
            data: { wishlist }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear wishlist
 */
export const clearWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user!.id });
        if (wishlist) {
            wishlist.items = [];
            await wishlist.save();
        }

        res.status(200).json({
            status: 'success',
            message: 'Wishlist cleared'
        });
    } catch (error) {
        next(error);
    }
};
