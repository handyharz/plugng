const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/plugng';

async function clearCart() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({ email: String }));
        const Cart = mongoose.model('Cart', new mongoose.Schema({
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            items: Array
        }));

        const email = 'harzkane@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return;
        }

        const result = await Cart.deleteOne({ user: user._id });
        if (result.deletedCount > 0) {
            console.log(`✅ Cart cleared for ${email}`);
        } else {
            console.log(`ℹ️  No cart found for ${email}`);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

clearCart();
