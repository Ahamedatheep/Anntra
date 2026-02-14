const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const testConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB Connected Successfully');

        const userCount = await User.countDocuments();
        console.log(`✓ Total users in database: ${userCount}`);

        const users = await User.find().select('name email role');
        console.log('\n📋 Users in database:');
        users.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
        });

        await mongoose.connection.close();
        console.log('\n✓ Connection closed');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

testConnection();
