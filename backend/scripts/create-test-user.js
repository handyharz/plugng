const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/plugng';

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    password: String,
    role: String,
    phoneVerified: Boolean,
    walletBalance: Number,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createTestUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if user already exists
        const existing = await User.findOne({ email: '[email protected]' });
        if (existing) {
            console.log('ℹ️  Test user already exists');
            await mongoose.connection.close();
            return;
        }

        // Create test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const testUser = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: '[email protected]',
            phone: '08000000000',
            password: hashedPassword,
            role: 'customer',
            phoneVerified: true,
            walletBalance: 0,
        });

        console.log('✅ Test user created:', testUser.email);
        console.log('📧 Email: [email protected]');
        console.log('🔑 Password: password123');

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestUser();
