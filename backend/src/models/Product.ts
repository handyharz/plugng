import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    category: Schema.Types.ObjectId;
    subCategory?: string;
    lowStockThreshold: number;
    images: {
        url: string;
        key: string;
        alt: string;
        isPrimary: boolean;
    }[];
    options: {
        name: string;
        values: {
            value: string;
            swatchUrl?: string;
            swatchKey?: string;
        }[];
    }[];
    variants: {
        sku: string;
        attributeValues: Map<string, string>;
        costPrice: number;
        sellingPrice: number;
        compareAtPrice?: number;
        stock: number;
        image?: string;
    }[];
    specifications: {
        key: string;
        value: string;
    }[];
    compatibility: {
        brands: string[];
        models: string[];
    };
    metaTitle?: string;
    metaDescription?: string;
    status: 'active' | 'draft' | 'out_of_stock';
    featured: boolean;
    views: number;
    salesCount: number;
    walletOnlyDiscount?: {
        enabled: boolean;
        percentage: number;
        validUntil?: Date;
    };
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: String },
    lowStockThreshold: { type: Number, default: 10 },
    images: [{
        url: { type: String, required: true },
        key: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false }
    }],
    options: [{
        name: { type: String, required: true }, // e.g., 'Color', 'Size'
        values: [{
            value: { type: String, required: true }, // e.g., 'Midnight Blue'
            swatchUrl: { type: String }, // The "tiny image" representing the color
            swatchKey: { type: String }
        }]
    }],
    variants: [{
        sku: { type: String, required: true, unique: true, uppercase: true },
        attributeValues: { type: Map, of: String }, // e.g., { 'Color': 'Midnight Blue', 'Size': 'L' }
        costPrice: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        compareAtPrice: { type: Number },
        stock: { type: Number, required: true, default: 0 },
        image: { type: String } // URL to specific variant image
    }],
    specifications: [{
        key: { type: String },
        value: { type: String }
    }],
    compatibility: {
        brands: [String],
        models: [String]
    },
    metaTitle: { type: String },
    metaDescription: { type: String },
    status: { type: String, enum: ['active', 'draft', 'out_of_stock'], default: 'draft' },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    walletOnlyDiscount: {
        enabled: { type: Boolean, default: false },
        percentage: { type: Number, min: 0, max: 50 },
        validUntil: { type: Date }
    }
}, { timestamps: true });

// Index for search
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
