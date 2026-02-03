const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function getOtp() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'test2@example.com' });
    console.log('OTP:', user.otp);
    await mongoose.disconnect();
}

getOtp().catch(console.error);
