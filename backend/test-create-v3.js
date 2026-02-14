const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const fs = require('fs');

dotenv.config();

const testCreate = async () => {
    let output = '';
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        output += 'Connected\n';

        await User.deleteMany({});
        output += 'Cleared\n';

        const user = new User({
            name: 'Test',
            email: 'test@test.com',
            password: 'password123',
            role: 'admin'
        });

        output += 'Saving...\n';
        try {
            await user.save();
            output += 'Saved successfully\n';
        } catch (saveErr) {
            output += 'Save error: ' + saveErr.message + '\n';
            output += saveErr.stack + '\n';
        }
    } catch (err) {
        output += 'Overall error: ' + err.message + '\n';
        output += err.stack + '\n';
    } finally {
        await mongoose.connection.close();
        fs.writeFileSync('create_result.txt', output);
        process.exit(0);
    }
};

testCreate();
