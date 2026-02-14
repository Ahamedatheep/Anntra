const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testCreate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        await User.deleteMany({});
        console.log('Cleared');

        const user = new User({
            name: 'Test',
            email: 'test@test.com',
            password: 'password123',
            role: 'admin'
        });

        console.log('Saving...');
        await user.save();
        console.log('Saved successfully');

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error during test:', err);
    }
};

testCreate();
