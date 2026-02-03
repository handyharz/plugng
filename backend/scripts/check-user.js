const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/plugng';

const userSchema = new mongoose.Schema({
    email: String,
    password: { type: String, select: false },
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function checkUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'harzkane@gmail.com';
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`❌ User NOT found: ${email}`);
            const allUsers = await User.find({}, { email: 1 });
            console.log('Available users:', allUsers.map(u => u.email));
        } else {
            console.log(`✅ User found: ${email}`);
            console.log('Has password field:', !!user.password);

            const isMatch = await bcrypt.compare('Admin@123', user.password);
            console.log('Password "Admin@123" matches:', isMatch);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUser();
