const axios = require('axios');

async function quickTest() {
    try {
        console.log('🧪 Quick test booking...');
        
        // Login
        const login = await axios.post('http://localhost:5000/api/auth/login', {
            id_user: 'testuser',
            password: 'test123'
        });
        
        const token = login.data.data.token;
        console.log('✅ Login OK');
        
        // Get customer info
        const customer = await axios.get('http://localhost:5000/api/customers/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const customerId = customer.data.data.customer.Ma_khach_hang;
        console.log('✅ Customer ID:', customerId);
        
        // Simple booking test
        const bookingData = {
            ma_tour: '666',
            ma_lich_khoi_hanh: 'vua',
            so_nguoi_lon: 1,
            so_tre_em: 0,
            ma_khuyen_mai: null,
            ma_khach_hang: customerId,
            dich_vu: []
        };
        
        console.log('📋 Booking data:', bookingData);
        
        const booking = await axios.post('http://localhost:5000/api/bookings', bookingData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 seconds
        });
        
        console.log('✅ Booking SUCCESS!');
        console.log('📊 Result:', booking.data);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📊 Data:', error.response.data);
        }
    }
}

quickTest();
