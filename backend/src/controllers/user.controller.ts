import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

/**
 * Get current user profile
 */
export const getMe = (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
};

/**
 * Update current user profile
 */
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Filter out fields that are not allowed to be updated (password, role, wallet)
        const filteredBody: any = {};
        const allowedFields = ['firstName', 'lastName'];

        Object.keys(req.body).forEach(el => {
            if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
        });

        // 2. Update user document
        const updatedUser = await User.findByIdAndUpdate(req.user!.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add or update address
 */
export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { address, isDefault } = req.body;
        const user = await User.findById(req.user!.id);

        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }

        if (isDefault) {
            user.addresses.forEach((addr: any) => addr.isDefault = false);
        }

        user.addresses.push(address);
        await user.save();

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an address
 */
export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user!.id);

        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }

        user.addresses = user.addresses.filter((addr: any) => (addr as any)._id.toString() !== addressId);
        await user.save();

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Set an address as default
 */
export const setDefaultAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user!.id);

        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }

        user.addresses.forEach((addr: any) => {
            addr.isDefault = (addr as any)._id.toString() === addressId;
        });

        await user.save();

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user password
 */
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user!.id).select('+password');
        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }

        // 1. Check if current password is correct
        if (!(await user.comparePassword(currentPassword))) {
            res.status(401).json({ status: 'fail', message: 'Current password is incorrect' });
            return;
        }

        // 2. Set new password and save (to trigger hashing hook)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};
