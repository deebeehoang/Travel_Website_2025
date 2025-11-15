const axios = require('axios');

async function testPaymentAPI() {
    try {
        console.log('🧪 Testing Payment APIs...');
        
        // Login first
        const login = await axios.post('http://localhost:5000/api/auth/login', {
            id_user: 'testuser',
            password: 'test123'
        });
        
        const token = login.data.data.token;
        console.log('✅ Login OK');
        
        // Test MoMo API
        console.log('\n🔍 Testing MoMo API...');
        try {
            const momoResponse = await axios.post('http://localhost:5000/api/payment/momo/create', {
                bookingId: 'B1761453721378',
                amount: 1000000,
                orderInfo: 'Test MoMo payment'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('✅ MoMo API Response:', momoResponse.data);
        } catch (error) {
            console.error('❌ MoMo API Error:', error.response?.data || error.message);
        }
        
        // Test ZaloPay API
        console.log('\n🔍 Testing ZaloPay API...');
        try {
            const zaloResponse = await axios.post('http://localhost:5000/api/payment/zalo-create', {
                bookingId: 'B1761453721378',
                amount: 1000000
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('✅ ZaloPay API Response:', zaloResponse.data);
        } catch (error) {
            console.error('❌ ZaloPay API Error:', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('❌ Test Error:', error.message);
    }
}

testPaymentAPI();
