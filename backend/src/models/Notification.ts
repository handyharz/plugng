import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipient: Schema.Types.ObjectId; // User ID
    type: 'order_update' | 'payment_success' | 'payment_failed' | 'low_stock' | 'system' | 'wallet_update' | 'shipped' | 'delivered' | 'order_cancelled' | 'ticket_reply' | 'new_order' | 'new_ticket';
    title: string;
    message: string;
    link?: string; // Deep link to order or product
    isRead: boolean;
    metadata?: Record<string, any>;
}

const NotificationSchema: Schema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        enum: [
            'order_update',
            'payment_success',
            'payment_failed',
            'low_stock',
            'system',
            'wallet_update',
            'shipped',
            'delivered',
            'order_cancelled',
            'ticket_reply',
            'new_order',
            'new_ticket'
        ],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

// TTL Index: Auto-delete notifications after 30 days to keep DB light
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
