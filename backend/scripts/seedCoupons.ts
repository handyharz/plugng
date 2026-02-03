import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../src/models/Coupon';

dotenv.config();

const coupons = [
    {
        code: 'WELCOME500',
        type: 'fixed',
        value: 500,
        minOrderAmount: 2000,
        expiryDate: new Date('2026-12-31'),
        usageLimit: 0,
        limitPerUser: 1,
        isActive: true,
        description: 'New Customer Welcome Discount'
    }
];

const seedCoupons = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        for (const couponData of coupons) {
            await Coupon.findOneAndUpdate(
                { code: couponData.code },
                couponData,
                { upsert: true, new: true }
            );
            console.log(`Coupon ${couponData.code} seeded`);
        }

        console.log('All coupons seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding coupons:', error);
        process.exit(1);
    }
};

seedCoupons();
