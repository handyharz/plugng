import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    icon?: string; // Icon URL for navigation
    parent?: Schema.Types.ObjectId;
    level: number; // 1 (Brand), 2 (Type), 3 (Specific)
    order: number;
    active: boolean;
    featured: boolean; // For homepage display
    metaTitle?: string; // SEO
    metaDescription?: string; // SEO
    productCount: number; // Cached count for performance
    fullName?: string; // Virtual field for Brand > Type > Specific
    children?: ICategory[]; // Virtual field
}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String }, // Category banner image
    icon: { type: String }, // Small icon for navigation
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    level: { type: Number, required: true, min: 1, max: 3, default: 1 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
    productCount: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for children categories
CategorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Index for faster queries
CategorySchema.index({ parent: 1, active: 1 });
CategorySchema.index({ featured: 1, active: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);

