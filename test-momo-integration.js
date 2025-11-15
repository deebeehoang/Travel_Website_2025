const axios = require('axios');

// Test MoMo API integration
async function testMoMoIntegration() {
    console.log('🧪 Testing MoMo API Integration...\n');
    
    const baseURL = 'http://localhost:5000/api';
    const testToken = 'your-test-token-here'; // Replace with actual token
    
    try {
        // Test 1: Check if MoMo routes are accessible
        console.log('1️⃣ Testing MoMo routes accessibility...');
        
        try {
            const response = await axios.post(`${baseURL}/payment/momo/create`, {
                bookingId: 'TEST123',
                amount: 100000,
                orderInfo: 'Test payment'
            }, {
                headers: {
                    'Authorization': `Bearer ${testToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ MoMo create payment endpoint accessible');
            console.log('Response:', response.data);
        } catch (error) {
            if (error.response) {
                console.log('⚠️ MoMo endpoint accessible but returned error:', error.response.status);
                console.log('Error message:', error.response.data);
            } else {
                console.log('❌ MoMo endpoint not accessible:', error.message);
            }
        }
        
        // Test 2: Check IPN endpoint
        console.log('\n2️⃣ Testing MoMo IPN endpoint...');
        
        try {
            const ipnData = {
                partnerCode: 'MOMO',
                requestId: 'test-request-id',
                orderId: 'TEST123',
                amount: 100000,
                orderInfo: 'Test payment',
                orderType: 'momo_wallet',
                transId: 'test-trans-id',
                resultCode: 0,
                message: 'Success',
                payType: 'qr',
                responseTime: new Date().toISOString(),
                extraData: '',
                signature: 'test-signature'
            };
            
            const response = await axios.post(`${baseURL}/payment/momo/ipn`, ipnData);
            console.log('✅ MoMo IPN endpoint accessible');
            console.log('Response:', response.data);
        } catch (error) {
            if (error.response) {
                console.log('⚠️ MoMo IPN endpoint accessible but returned error:', error.response.status);
                console.log('Error message:', error.response.data);
            } else {
                console.log('❌ MoMo IPN endpoint not accessible:', error.message);
            }
        }
        
        // Test 3: Check return endpoint
        console.log('\n3️⃣ Testing MoMo return endpoint...');
        
        try {
            const returnParams = {
                orderId: 'TEST123',
                resultCode: '0',
                message: 'Success'
            };
            
            const response = await axios.get(`${baseURL}/payment/momo/return`, {
                params: returnParams
            });
            console.log('✅ MoMo return endpoint accessible');
            console.log('Response status:', response.status);
        } catch (error) {
            if (error.response) {
                console.log('⚠️ MoMo return endpoint accessible but returned error:', error.response.status);
                console.log('Error message:', error.response.data);
            } else {
                console.log('❌ MoMo return endpoint not accessible:', error.message);
            }
        }
        
        console.log('\n🎉 MoMo integration test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testMoMoIntegration();
