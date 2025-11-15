# Hệ thống Đặt Tour Tạm Giữ Chỗ

## Tổng quan

Hệ thống đặt tour với cơ chế tạm giữ chỗ (temporary reservation) để tránh overbooking và cải thiện trải nghiệm người dùng.

## Kiến trúc

### 1. Database Schema

#### Bảng `Booking`
- Thêm trường `expires_at`: Thời gian hết hạn booking (10 phút sau khi tạo)
- Trạng thái: `Chờ thanh toán` → `Đã thanh toán` hoặc `Hủy`

#### Bảng `Lich_khoi_hanh`
- Thêm trường `So_cho_con_lai`: Số chỗ còn lại (được cập nhật real-time)
- Được tạm trừ ngay khi tạo booking

### 2. Quy trình đặt tour

```
1. User bấm "Đặt tour"
   ↓
2. Backend kiểm tra số chỗ còn lại (So_cho_con_lai)
   ↓
3. Nếu đủ chỗ:
   - Tạo booking với trạng thái "Chờ thanh toán"
   - Lưu expires_at = NOW() + 10 phút
   - Tạm trừ số chỗ: So_cho_con_lai -= (So_nguoi_lon + So_tre_em)
   - Lock schedule với FOR UPDATE để tránh race condition
   ↓
4. User thanh toán trong 10 phút
   ↓
5. Nếu thanh toán thành công:
   - Cập nhật Trang_thai_booking = "Đã thanh toán"
   - Giữ nguyên số chỗ đã trừ
   ↓
6. Nếu hết hạn (10 phút):
   - Cron job tự động hủy booking
   - Cập nhật Trang_thai_booking = "Hủy"
   - Trả lại số chỗ: So_cho_con_lai += (So_nguoi_lon + So_tre_em)
```

### 3. Các Service

#### `BookingCleanupService`
- `cancelExpiredBookings()`: Hủy booking hết hạn và trả lại số chỗ
- `syncAvailableSeats()`: Đồng bộ số chỗ còn lại (backup)

#### `BookingValidationService`
- `validateBookingForPayment()`: Kiểm tra booking hợp lệ trước khi thanh toán
- `confirmPayment()`: Xác nhận thanh toán và cập nhật trạng thái

#### `CronService`
- Khởi động cron jobs:
  - Hủy booking hết hạn: Mỗi 1 phút
  - Đồng bộ số chỗ: Mỗi 5 phút (backup)

### 4. Race Condition Prevention

- Sử dụng `FOR UPDATE` lock khi kiểm tra và cập nhật số chỗ
- Transaction để đảm bảo atomicity
- Kiểm tra số chỗ trước khi tạo booking

## Cài đặt

### 1. Chạy Migration

```bash
mysql -u root -p < src/database/add_booking_reservation_fields.sql
```

Hoặc chạy SQL script trong MySQL Workbench.

### 2. Cài đặt Dependencies

```bash
npm install
```

### 3. Khởi động Server

```bash
npm start
```

Cron jobs sẽ tự động khởi động khi server start.

## API Endpoints

### 1. Tạo Booking

```
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "ma_tour": "666",
  "ma_lich_khoi_hanh": "vua",
  "so_nguoi_lon": 1,
  "so_tre_em": 0,
  "ma_khuyen_mai": null,
  "ma_khach_hang": "KH755206",
  "dich_vu": []
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Đặt tour thành công. Vui lòng thanh toán trong vòng 10 phút.",
  "data": {
    "bookingId": "B1234567890",
    "booking": {
      "expires_at": "2025-01-20T10:10:00.000Z",
      ...
    },
    "expires_in": 600,
    "available_seats": 4
  }
}
```

### 2. Thanh toán

Các endpoint thanh toán (MoMo, ZaloPay, VNPay) sẽ tự động:
- Kiểm tra booking hợp lệ
- Kiểm tra booking chưa hết hạn
- Cập nhật trạng thái thành "Đã thanh toán"

## Cron Jobs

### 1. Hủy Booking Hết Hạn
- **Schedule**: Mỗi 1 phút (`* * * * *`)
- **Chức năng**: Tìm và hủy các booking hết hạn, trả lại số chỗ

### 2. Đồng bộ Số Chỗ
- **Schedule**: Mỗi 5 phút (`*/5 * * * *`)
- **Chức năng**: Đồng bộ lại số chỗ còn lại (backup)

## Testing

### 1. Test Tạo Booking

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "ma_tour": "666",
    "ma_lich_khoi_hanh": "vua",
    "so_nguoi_lon": 1,
    "so_tre_em": 0,
    "ma_khach_hang": "KH755206"
  }'
```

### 2. Test Cron Job

Cron job sẽ tự động chạy. Để test manual:

```javascript
const BookingCleanupService = require('./src/services/booking-cleanup.service');
BookingCleanupService.cancelExpiredBookings();
```

### 3. Test Thanh Toán

```bash
curl -X POST http://localhost:5000/api/payment/confirm \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "B1234567890",
    "payment_method": "MoMo",
    "amount": 1000000
  }'
```

## Lưu ý

1. **Thời gian hết hạn**: Mặc định 10 phút, có thể thay đổi trong `booking.controller.js`
2. **Số chỗ còn lại**: Được cập nhật real-time, nhưng có cron job backup mỗi 5 phút
3. **Race condition**: Được xử lý bằng `FOR UPDATE` lock và transaction
4. **Booking hết hạn**: Tự động hủy và trả lại chỗ, không cần can thiệp thủ công

## Troubleshooting

### 1. Booking không tự động hủy
- Kiểm tra cron job đang chạy
- Kiểm tra `expires_at` có được set đúng không
- Kiểm tra logs của cron service

### 2. Số chỗ không chính xác
- Chạy `syncAvailableSeats()` để đồng bộ lại
- Kiểm tra các booking có trạng thái đúng không

### 3. Race condition
- Đảm bảo sử dụng transaction
- Kiểm tra `FOR UPDATE` lock đang hoạt động

## Tương lai

- [ ] Thêm Socket.io để thông báo real-time khi booking sắp hết hạn
- [ ] Cho phép gia hạn thời gian thanh toán
- [ ] Thêm thống kê booking hết hạn
- [ ] Tối ưu performance với caching

