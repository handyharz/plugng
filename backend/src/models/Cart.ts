import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
    product: Schema.Types.ObjectId;
    variantId?: string;
    quantity: number;
    selectedOptions?: Map<string, string>;
}

export interface ICart extends Document {
    user: Schema.Types.ObjectId;
    items: ICartItem[];
}

const CartSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: String }, // Optional, for specific variant
        quantity: { type: Number, required: true, min: 1 },
        selectedOptions: { type: Map, of: String }
    }]
}, { timestamps: true });

export default mongoose.model<ICart>('Cart', CartSchema);
