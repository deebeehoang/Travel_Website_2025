// require('dotenv').config();
// const jwt = require('jsonwebtoken');

// // Thông tin người dùng giả định
// const user = {
//   id: 'test_user',
//   role: 'Khach_hang'
// };

// // Lấy JWT_SECRET từ biến môi trường
// const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';

// console.log('====== TEST JWT ======');
// console.log('JWT_SECRET:', jwtSecret);

// try {
//   // Tạo token
//   console.log('\n1. Tạo JWT token...');
//   const token = jwt.sign(
//     { id: user.id, role: user.role },
//     jwtSecret,
//     { expiresIn: '24h' }
//   );
//   console.log('✅ Token đã được tạo thành công');
//   console.log('Token:', token);

//   // Xác thực token
//   console.log('\n2. Xác thực JWT token...');
//   const decoded = jwt.verify(token, jwtSecret);
//   console.log('✅ Token hợp lệ');
//   console.log('Thông tin giải mã:', decoded);

//   // Kiểm tra xác thực với khóa sai
//   console.log('\n3. Kiểm tra xác thực với khóa sai...');
//   try {
//     const wrongSecret = 'wrong_secret_key';
//     jwt.verify(token, wrongSecret);
//     console.log('❌ Lỗi: Token không nên được xác thực với khóa sai');
//   } catch (error) {
//     console.log('✅ Xác thực thất bại (như mong đợi):', error.message);
//   }

//   console.log('\n✅ Tất cả các bài kiểm tra đã thành công!');
// } catch (error) {
//   console.error('\n❌ Lỗi kiểm tra JWT:', error);
// } 

// Tìm thẻ hr trong booking-summary
// const hrElement = summaryContainer.querySelector('hr');

// // Nếu có thẻ hr, chèn sau hr và trước phần tử tổng cộng
// if (hrElement) {
//     hrElement.parentNode.insertBefore(serviceSummary, hrElement.nextSibling);
// } else {
//     // Nếu không tìm thấy hr, thêm vào cuối container
//     summaryContainer.appendChild(serviceSummary);
// } 

// static async addServiceDetail(bookingId, serviceId, quantity, connection) {
//   try {
//     console.log(`Thêm dịch vụ ${serviceId} vào booking ${bookingId} với số lượng ${quantity}`);
    
//     // Get service price
//     const [serviceRows] = await connection.query(
//       'SELECT Gia FROM Dich_vu WHERE Ma_dich_vu = ?',
//       [serviceId]
//     );
    
//     if (serviceRows.length === 0) {
//       throw new Error(`Không tìm thấy dịch vụ với mã ${serviceId}`);
//     }
    
//     const servicePrice = serviceRows[0].Gia;
//     const totalPrice = servicePrice * quantity;
    
//     // Add service detail
//     await connection.query(
//       'INSERT INTO Chi_tiet_dich_vu (Ma_booking, Ma_dich_vu, So_luong, Thanh_tien) VALUES (?, ?, ?, ?)',
//       [bookingId, serviceId, quantity, totalPrice]
//     );
    
//     return true;
//   } catch (error) {
//     console.error('Lỗi khi thêm chi tiết dịch vụ:', error);
//     throw error;
//   }
// } 