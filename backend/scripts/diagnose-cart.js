const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/plugng';

async function diagnoseCart() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({ email: String }));
        const Product = mongoose.model('Product', new mongoose.Schema({ name: String }));
        const Cart = mongoose.model('Cart', new mongoose.Schema({
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            items: [{
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                quantity: Number
            }]
        }));

        const email = 'harzkane@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return;
        }

        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            console.log(`❌ Cart not found for user: ${email}`);
            return;
        }

        console.log(`🛒 Cart for ${email}:`, JSON.stringify(cart.items, null, 2));

        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                console.log(`❌ STALE PRODUCT ID: ${item.product} (Not found in Products collection)`);
            } else {
                console.log(`✅ Product found: ${product.name} (${item.product})`);
            }
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

diagnoseCart();
