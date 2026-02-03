import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Order from '../models/Order';

/**
 * Create a new review
 */
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { product, order, rating, comment, images } = req.body;

        // Verify that the user has actually ordered the product
        const checkOrder = await Order.findOne({
            _id: order,
            user: req.user!.id,
            'items.product': product,
            deliveryStatus: 'delivered'
        });

        if (!checkOrder) {
            res.status(400).json({ status: 'fail', message: 'You must have a delivered order for this product to leave a review.' });
            return;
        }

        const review = await Review.create({
            user: req.user!.id,
            product,
            order,
            rating,
            comment,
            images
        });

        res.status(201).json({
            status: 'success',
            data: { review }
        });
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ status: 'fail', message: 'You have already reviewed this product for this order.' });
            return;
        }
        next(error);
    }
};

/**
 * Get all reviews for a specific user
 */
export const getMyReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviews = await Review.find({ user: req.user!.id }).populate('product', 'name images');

        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: { reviews }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get reviews for a product (public)
 */
export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
            .populate('user', 'firstName lastName')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: { reviews }
        });
    } catch (error) {
        next(error);
    }
};
