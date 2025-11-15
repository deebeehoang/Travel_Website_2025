// Script để kiểm tra các tài khoản có sẵn
const User = require('./src/models/user.model');

async function checkAccounts() {
    console.log('🔍 Checking available accounts...\n');
    
    const accounts = ['admin', 'ad', 'user'];
    
    for (const account of accounts) {
        try {
            const user = await User.findById(account);
            if (user) {
                console.log(`✅ Account: ${user.Id_user}`);
                console.log(`   Email: ${user.Email}`);
                console.log(`   Role: ${user.Loai_tai_khoan}`);
                console.log(`   Password hash: ${user.Password.substring(0, 20)}...`);
                console.log('');
            } else {
                console.log(`❌ Account not found: ${account}\n`);
            }
        } catch (error) {
            console.log(`💥 Error checking ${account}: ${error.message}\n`);
        }
    }
}

checkAccounts();
