const axios = require('axios');

// Test script để kiểm tra việc đặt tour sau khi sửa lỗi
async function testBooking() {
    const baseURL = 'http://localhost:5000';
    
    try {
        console.log('🧪 Bắt đầu test đặt tour...');
        
        // 1. Đăng nhập để lấy token
        console.log('1️⃣ Đăng nhập...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            id_user: 'testuser',
            password: 'test123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Đăng nhập thành công, token:', token.substring(0, 20) + '...');
        
        // 2. Lấy thông tin khách hàng
        console.log('2️⃣ Lấy thông tin khách hàng...');
        const customerResponse = await axios.get(`${baseURL}/api/customers/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const customerId = customerResponse.data.data.customer.Ma_khach_hang;
        console.log('✅ Mã khách hàng:', customerId);
        
        // 3. Lấy danh sách tour để test
        console.log('3️⃣ Lấy danh sách tour...');
        const toursResponse = await axios.get(`${baseURL}/api/tours`);
        const tours = toursResponse.data.data.tours;
        
        if (!tours || tours.length === 0) {
            throw new Error('Không có tour nào để test');
        }
        
        const testTour = tours[0];
        console.log('✅ Tour test:', testTour.Ma_tour, '-', testTour.Ten_tour);
        
        // 4. Lấy lịch khởi hành của tour
        console.log('4️⃣ Lấy lịch khởi hành...');
        const schedulesResponse = await axios.get(`${baseURL}/api/tours/${testTour.Ma_tour}/upcoming-schedules`);
        const schedules = schedulesResponse.data.data.schedules;
        
        if (!schedules || schedules.length === 0) {
            throw new Error('Không có lịch khởi hành nào để test');
        }
        
        const testSchedule = schedules[0];
        console.log('✅ Lịch test:', testSchedule.Ma_lich, '- Chỗ còn lại:', testSchedule.So_cho_con_lai);
        
        // 5. Test đặt tour
        console.log('5️⃣ Test đặt tour...');
        const bookingData = {
            ma_tour: testTour.Ma_tour,
            ma_lich_khoi_hanh: testSchedule.Ma_lich,
            so_nguoi_lon: 1,
            so_tre_em: 0,
            ma_khuyen_mai: null,
            ma_khach_hang: customerId,
            dich_vu: []
        };
        
        console.log('📋 Dữ liệu đặt tour:', bookingData);
        
        const bookingResponse = await axios.post(`${baseURL}/api/bookings`, bookingData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60 seconds timeout
        });
        
        console.log('✅ Đặt tour thành công!');
        console.log('📊 Kết quả:', bookingResponse.data);
        
        return {
            success: true,
            bookingId: bookingResponse.data.data.bookingId,
            message: 'Test đặt tour thành công!'
        };
        
    } catch (error) {
        console.error('❌ Test thất bại:', error.message);
        
        if (error.response) {
            console.error('📊 Response data:', error.response.data);
            console.error('📊 Status:', error.response.status);
        }
        
        return {
            success: false,
            error: error.message,
            details: error.response?.data
        };
    }
}

// Chạy test
if (require.main === module) {
    testBooking()
        .then(result => {
            console.log('\n🏁 Kết quả test:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Lỗi không mong đợi:', error);
            process.exit(1);
        });
}

module.exports = { testBooking };
