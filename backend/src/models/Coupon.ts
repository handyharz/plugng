import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    expiryDate: Date;
    usageLimit: number;
    usageCount: number;
    limitPerUser: number;
    isActive: boolean;
    description: string;
}

const CouponSchema = new Schema<ICoupon>({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 }, // 0 for unlimited
    usageCount: { type: Number, default: 0 },
    limitPerUser: { type: Number, default: 0 }, // 0 for unlimited
    isActive: { type: Boolean, default: true },
    description: { type: String }
}, { timestamps: true });

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
