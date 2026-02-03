import { Request, Response, NextFunction } from 'express';
import Cart from '../models/Cart';

/**
 * Interface to extend Request with user property
 * populated by the protect middleware
 */
interface AuthenticatedRequest extends Request {
    user?: any;
}

export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id || req.user.id;
        let cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        // Filter out items where the product no longer exists in the database
        const originalLength = cart.items.length;
        cart.items = cart.items.filter(item => item.product !== null);

        if (cart.items.length !== originalLength) {
            console.log(`🧹 Cleaned up ${originalLength - cart.items.length} stale items from cart for user ${userId}`);
            await cart.save();
        }

        res.status(200).json({
            status: 'success',
            data: { cart: cart.items }
        });
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id || req.user.id;
        const { productId, variantId, quantity, selectedOptions } = req.body;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        // Check if item exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemIndex = cart.items.findIndex((p: any) => {
            const sameProduct = p.product.toString() === productId;
            const sameVariant = variantId ? p.variantId === variantId : true;
            return sameProduct && sameVariant;
        });

        if (itemIndex > -1) {
            // Update quantity
            const existingItem = cart!.items[itemIndex];
            if (existingItem) {
                existingItem.quantity += quantity;
            }
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                variantId,
                quantity,
                selectedOptions
            });
        }

        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({
            status: 'success',
            data: { cart: cart.items }
        });
    } catch (error) {
        next(error);
    }
};

export const updateItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id || req.user.id;

        const { productId, variantId, quantity } = req.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            res.status(404).json({ status: 'fail', message: 'Cart not found' });
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemIndex = cart?.items.findIndex((p: any) => {
            const sameProduct = p.product.toString() === productId;
            // If variantId is undefined in DB, it matches if req.body.variantId is undefined
            const sameVariant = (p.variantId || '') === (variantId || '');
            return sameProduct && sameVariant;
        });

        if (itemIndex > -1) {
            const existingItem = cart!.items[itemIndex];
            if (existingItem) {
                if (quantity > 0) {
                    existingItem.quantity = quantity;
                } else {
                    cart!.items.splice(itemIndex, 1);
                }
            }
            await cart!.save();
            await cart!.populate('items.product');

            res.status(200).json({
                status: 'success',
                data: { cart: cart.items }
            });
        } else {
            res.status(404).json({ status: 'fail', message: 'Item not found in cart' });
        }
    } catch (error) {
        next(error);
    }
};

export const removeItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id || req.user.id;
        const { productId, variantId } = req.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            res.status(200).json({ status: 'success', data: { cart: [] } });
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cart.items = cart?.items.filter((p: any) => {
            const sameProduct = p.product.toString() === productId;
            const sameVariant = (p.variantId || '') === (variantId || '');
            return !(sameProduct && sameVariant);
        });

        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({
            status: 'success',
            data: { cart: cart.items }
        });
    } catch (error) {
        next(error);
    }
};

export const syncCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id || req.user.id;
        const { items } = req.body; // items from local storage

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Merge logic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const localItem of items) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const itemIndex = cart?.items.findIndex((p: any) => {
                const sameProduct = p.product.toString() === localItem.id; // localItem.id is productId
                const sameVariant = (p.variantId || '') === (localItem.variantId || '');
                return sameProduct && sameVariant;
            });

            if (itemIndex > -1) {
                const existingItem = cart!.items[itemIndex];
                if (existingItem) {
                    existingItem.quantity += localItem.quantity;
                }
            } else {
                cart!.items.push({
                    product: localItem.id,
                    variantId: localItem.variantId,
                    quantity: localItem.quantity,
                    selectedOptions: localItem.selectedOptions
                });
            }
        }

        await cart!.save();
        await cart!.populate('items.product');

        // Filter out items where the product no longer exists
        const originalLength = cart!.items.length;
        cart!.items = cart!.items.filter(item => item.product !== null);

        if (cart!.items.length !== originalLength) {
            await cart!.save();
        }

        res.status(200).json({
            status: 'success',
            data: { cart: cart!.items }
        });
    } catch (error) {
        next(error);
    }
};
