const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB Connected');

        // Try to find admin user
        const adminUser = await User.findOne({ email: 'admin@anntra.com' });

        if (!adminUser) {
            console.log('❌ Admin user not found!');
            process.exit(1);
        }

        console.log('\n📋 Admin User Found:');
        console.log('  - Name:', adminUser.name);
        console.log('  - Email:', adminUser.email);
        console.log('  - Role:', adminUser.role);
        console.log('  - Password hash:', adminUser.password.substring(0, 20) + '...');

        // Test password comparison
        const testPassword = 'admin123';
        const isMatch = await adminUser.comparePassword(testPassword);

        console.log('\n🔐 Password Test:');
        console.log('  - Testing password:', testPassword);
        console.log('  - Password matches:', isMatch);

        if (isMatch) {
            console.log('\n✅ Login should work!');
        } else {
            console.log('\n❌ Password does not match!');
            console.log('   The passwords were likely hashed. Let me check...');

            // Check if password is plain text
            if (adminUser.password === 'admin123') {
                console.log('   ⚠️  Password is stored as PLAIN TEXT!');
                console.log('   This means the pre-save hook did not run during seeding.');
            }
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

testLogin();
