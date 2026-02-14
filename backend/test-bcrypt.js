const bcrypt = require('bcryptjs');
(async () => {
    try {
        const salt = await bcrypt.genSalt(10);
        console.log('Salt:', salt);
        const hash = await bcrypt.hash('test', salt);
        console.log('Hash:', hash);
        console.log('Success');
    } catch (e) {
        console.error('Bcrypt error:', e);
    }
})();
