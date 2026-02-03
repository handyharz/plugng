import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    orderNumber: string;
    user: Schema.Types.ObjectId;
    items: {
        product: Schema.Types.ObjectId;
        name: string;
        sku: string;
        price: number;
        quantity: number;
        image: string;
        variantAttributes?: Record<string, string>;
    }[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    paymentMethod: 'card' | 'bank_transfer' | 'wallet' | 'cash_on_delivery';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentReference?: string;
    paidAt?: Date;
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        landmark?: string;
    };
    deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    trackingNumber?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
    trackingEvents: {
        status: string;
        location: string;
        message: string;
        timestamp: Date;
    }[];
    customerNote?: string;
    adminNote?: string;
    couponCode?: string;
    couponDiscount?: number;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        sku: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        variantAttributes: { type: Map, of: String }
    }],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
        type: String,
        enum: ['card', 'bank_transfer', 'wallet', 'cash_on_delivery'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentReference: { type: String },
    paidAt: { type: Date },
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        landmark: { type: String }
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: { type: String },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    trackingEvents: [{
        status: String,
        location: String,
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    customerNote: { type: String },
    adminNote: { type: String },
    couponCode: { type: String, uppercase: true },
    couponDiscount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
