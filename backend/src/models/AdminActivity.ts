import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminActivity extends Document {
    admin: Schema.Types.ObjectId;
    action: 'create' | 'update' | 'delete' | 'status_change' | 'refund' | 'bulk_status_change' | 'bulk_update_products' | 'create_admin' | 'create_coupon' | 'delete_coupon' | 'delete_review' | 'inventory_adjust' | 'update_admin_status' | 'update_coupon' | 'update_review_status' | 'update_settings' | 'update_ticket' | 'update_tracking' | 'wallet_adjust';
    resource: 'product' | 'order' | 'customer' | 'category' | 'ticket' | 'settings' | 'coupon' | 'review' | 'system' | 'user';
    resourceId?: Schema.Types.ObjectId;
    details?: string;
    changes?: {
        before?: any;
        after?: any;
    };
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const AdminActivitySchema: Schema = new Schema({
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
        type: String,
        enum: [
            'create', 'update', 'delete', 'status_change', 'refund',
            'bulk_status_change', 'bulk_update_products', 'create_admin',
            'create_coupon', 'delete_coupon', 'delete_review', 'inventory_adjust',
            'update_admin_status', 'update_coupon', 'update_review_status',
            'update_settings', 'update_ticket', 'update_tracking', 'wallet_adjust'
        ],
        required: true
    },
    resource: {
        type: String,
        enum: ['product', 'order', 'customer', 'category', 'ticket', 'settings', 'coupon', 'review', 'system', 'user'],
        required: true
    },
    resourceId: { type: Schema.Types.ObjectId, required: false },
    details: { type: String },
    changes: {
        before: { type: Schema.Types.Mixed },
        after: { type: Schema.Types.Mixed }
    },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

// Indexes for efficient querying
AdminActivitySchema.index({ admin: 1, createdAt: -1 });
AdminActivitySchema.index({ resource: 1, resourceId: 1 });
AdminActivitySchema.index({ createdAt: -1 });

export default mongoose.model<IAdminActivity>('AdminActivity', AdminActivitySchema);
