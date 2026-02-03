import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IWalletTransaction {
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: Date;
}

export interface IUserAddress {
    isDefault: boolean;
    label: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    landmark?: string;
}

export interface IUser extends Document {
    email: string;
    phone: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'admin' | 'super_admin' | 'manager' | 'support' | 'editor';
    wallet: {
        balance: number;
        transactions: IWalletTransaction[];
    };
    addresses: IUserAddress[];
    emailVerified: boolean;
    phoneVerified: boolean;
    totalSpent: number;
    loyaltyTier: 'Enthusiast' | 'Elite' | 'Master';
    otp?: string;
    otpExpires?: Date;
    status: 'active' | 'suspended';
    lastLogin?: Date;
    comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
        type: String,
        enum: ['customer', 'admin', 'super_admin', 'manager', 'support', 'editor'],
        default: 'customer'
    },
    wallet: {
        balance: { type: Number, default: 0 },
        transactions: [{
            type: { type: String, enum: ['credit', 'debit'] },
            amount: Number,
            description: String,
            date: { type: Date, default: Date.now }
        }]
    },
    addresses: [{
        isDefault: { type: Boolean, default: false },
        label: String,
        fullName: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        landmark: String
    }],
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    totalSpent: { type: Number, default: 0 },
    loyaltyTier: {
        type: String,
        enum: ['Enthusiast', 'Elite', 'Master'],
        default: 'Enthusiast'
    },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    lastLogin: { type: Date }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password!, salt);
        next();
    } catch (err: any) {
        next(err);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password!);
};

UserSchema.statics.updateLoyaltyStatus = async function (userId: string, amount: number) {
    const user = await this.findById(userId);
    if (!user) return;

    user.totalSpent += amount;

    if (user.totalSpent >= 1000000) {
        user.loyaltyTier = 'Master';
    } else if (user.totalSpent >= 250000) {
        user.loyaltyTier = 'Elite';
    } else {
        user.loyaltyTier = 'Enthusiast';
    }

    await user.save({ validateBeforeSave: false });
    return user;
};

export default mongoose.model<IUser>('User', UserSchema) as any;
