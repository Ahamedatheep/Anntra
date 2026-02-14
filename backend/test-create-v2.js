const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testCreate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        process.stdout.write('Connected\n');

        await User.deleteMany({});
        process.stdout.write('Cleared\n');

        const user = new User({
            name: 'Test',
            email: 'test@test.com',
            password: 'password123',
            role: 'admin'
        });

        process.stdout.write('Saving...\n');
        try {
            await user.save();
            process.stdout.write('Saved successfully\n');
        } catch (saveErr) {
            process.stdout.write('Save error: ' + saveErr.message + '\n');
            if (saveErr.stack) process.stdout.write(saveErr.stack + '\n');
        }

        await mongoose.connection.close();
    } catch (err) {
        process.stdout.write('Overall error: ' + err.message + '\n');
    }
};

testCreate();
