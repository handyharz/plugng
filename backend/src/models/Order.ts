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
    paymentMethod: 'card' | 'bank_transfer' | 'wallet' | 'cash_on_delivery' | 'afriexchange';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentReference?: string;
    paidAt?: Date;
    afriExchange?: {
        transactionId?: string;
        reference?: string;
        paymentUrl?: string;
        tokenType?: string;
        amount?: number;
        quote?: {
            source_currency?: string;
            source_amount?: number;
            settlement_currency?: string;
            settlement_amount?: number;
            exchange_rate?: number;
        };
        status?: string;
        lastWebhookEvent?: string;
        lastWebhookAt?: Date;
        verifiedAt?: Date;
        webhookEvents?: {
            eventId?: string;
            type?: string;
            receivedAt?: Date;
            status?: string;
        }[];
    };
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        country?: string;
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
        enum: ['card', 'bank_transfer', 'wallet', 'cash_on_delivery', 'afriexchange'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentReference: { type: String },
    paidAt: { type: Date },
    afriExchange: {
        transactionId: { type: String },
        reference: { type: String, index: true },
        paymentUrl: { type: String },
        tokenType: { type: String },
        amount: { type: Number },
        quote: {
            source_currency: { type: String },
            source_amount: { type: Number },
            settlement_currency: { type: String },
            settlement_amount: { type: Number },
            exchange_rate: { type: Number }
        },
        status: { type: String },
        lastWebhookEvent: { type: String },
        lastWebhookAt: { type: Date },
        verifiedAt: { type: Date },
        webhookEvents: [{
            eventId: { type: String },
            type: { type: String },
            receivedAt: { type: Date, default: Date.now },
            status: { type: String }
        }]
    },
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, uppercase: true, default: 'NG' },
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
