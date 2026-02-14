const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');

const resetPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB Connected');

        // Get all users
        const users = await User.find();
        console.log(`Found ${users.length} users`);

        // Define correct passwords
        const passwords = {
            'admin@anntra.com': 'admin123',
            'ngo@hope.org': 'ngo123',
            'donor1@hotel.com': 'donor123',
            'donor2@caterers.com': 'donor123',
            'volunteer1@email.com': 'volunteer123',
            'volunteer2@email.com': 'volunteer123',
            'volunteer3@email.com': 'volunteer123',
            'beneficiary1@community.org': 'beneficiary123',
            'beneficiary2@shelter.org': 'beneficiary123'
        };

        // Update each user's password
        for (const user of users) {
            const correctPassword = passwords[user.email];
            if (correctPassword) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(correctPassword, salt);

                // Directly update without triggering pre-save hook
                await User.updateOne(
                    { _id: user._id },
                    { $set: { password: hashedPassword } }
                );

                console.log(`✓ Updated password for ${user.email}`);
            }
        }

        console.log('\n✅ All passwords updated!');
        console.log('\nYou can now login with:');
        console.log('  admin@anntra.com / admin123');
        console.log('  donor1@hotel.com / donor123');
        console.log('  volunteer1@email.com / volunteer123');
        console.log('  etc...');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

resetPasswords();
