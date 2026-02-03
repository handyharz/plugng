// npx ts-node scripts/createAdmin.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugng';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        let adminUser = await User.findOne({ email: 'admin@plugng.shop' });

        if (adminUser) {
            console.log('⚠️  Admin user already exists. Updating password and role...');
            adminUser.password = 'Admin123!';
            adminUser.role = 'super_admin';
            await adminUser.save();
        } else {
            // Create admin user
            adminUser = await User.create({
                email: 'admin@plugng.shop',
                password: 'Admin123!', // Plain password, let model hash it
                firstName: 'Admin',
                lastName: 'User',
                phone: '+2348012345678',
                role: 'super_admin',
                emailVerified: true,
                phoneVerified: true
            });
        }

        console.log('✅ Admin user ready!');
        console.log('📧 Email: admin@plugng.shop');
        console.log('🔑 Password: Admin123!');
        console.log('👤 User ID:', adminUser._id);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
