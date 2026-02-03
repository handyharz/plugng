import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
    category: 'general' | 'delivery' | 'payment' | 'email' | 'sms';
    key: string;
    value: any;
    description?: string;
    updatedBy: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SettingSchema: Schema = new Schema({
    category: {
        type: String,
        enum: ['general', 'delivery', 'payment', 'email', 'sms'],
        required: true
    },
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Compound unique index to prevent duplicate keys within same category
SettingSchema.index({ category: 1, key: 1 }, { unique: true });

export default mongoose.model<ISetting>('Setting', SettingSchema);
