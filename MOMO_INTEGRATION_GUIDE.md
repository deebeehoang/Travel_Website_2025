# Hướng dẫn tích hợp MoMo Payment

## Tổng quan
Dự án đã được tích hợp thành công với MoMo Payment Gateway. Dưới đây là hướng dẫn chi tiết về cách sử dụng và cấu hình.

## Cấu trúc tích hợp

### 1. Backend Files
- `src/config/momo.js` - Cấu hình MoMo API
- `src/services/momo.service.js` - Service xử lý logic MoMo
- `src/controllers/momo.controller.js` - Controller xử lý API requests
- `src/routes/momo.routes.js` - Định nghĩa routes cho MoMo
- `src/models/booking.model.js` - Cập nhật với methods MoMo
- `src/database/momo_schema.sql` - Schema database cho MoMo

### 2. Frontend Files
- `public/momo-payment.html` - Trang thanh toán MoMo chuyên dụng
- `public/payment-success.html` - Trang thành công thanh toán
- `public/payment-failed.html` - Trang thất bại thanh toán
- `public/payment.html` - Cập nhật với tùy chọn MoMo
- `public/js/payment.js` - Cập nhật logic xử lý MoMo

## API Endpoints

### 1. Tạo giao dịch MoMo
```
POST /api/payment/momo/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "B123456789",
  "amount": 1000000,
  "orderInfo": "Thanh toán tour B123456789"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "MoMo payment initiated",
  "data": {
    "requestId": "MOMO1234567890",
    "orderId": "B123456789",
    "amount": 1000000,
    "payUrl": "https://test-payment.momo.vn/...",
    "qrCodeUrl": "https://test-payment.momo.vn/qr/..."
  }
}
```

### 2. IPN (Instant Payment Notification)
```
POST /api/payment/momo/ipn
Content-Type: application/json

{
  "partnerCode": "MOMO",
  "requestId": "MOMO1234567890",
  "orderId": "B123456789",
  "amount": 1000000,
  "orderInfo": "Thanh toán tour B123456789",
  "orderType": "momo_wallet",
  "transId": "1234567890",
  "resultCode": 0,
  "message": "Success",
  "payType": "qr",
  "responseTime": "2024-01-01T00:00:00Z",
  "extraData": "",
  "signature": "abc123..."
}
```

### 3. Return URL
```
GET /api/payment/momo/return?orderId=B123456789&resultCode=0&message=Success
```

## Cấu hình

### 1. Environment Variables
Tạo file `.env` với nội dung:
```env
# MoMo Payment Configuration
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951BPE1waDMi640xX08PD3vg6EkVlz
MOMO_REDIRECT_URL=http://localhost:5000/api/payment/momo/return
MOMO_IPN_URL=http://localhost:5000/api/payment/momo/ipn
MOMO_API_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_QUERY_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/query
MOMO_REFUND_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/refund
```

### 2. Database Schema
Chạy file `src/database/momo_schema.sql` để thêm các cột MoMo vào bảng Booking:
```sql
ALTER TABLE Booking
ADD COLUMN MoMo_request_id VARCHAR(255) NULL,
ADD COLUMN MoMo_order_id VARCHAR(255) NULL,
ADD COLUMN MoMo_trans_id VARCHAR(255) NULL,
ADD COLUMN MoMo_amount DECIMAL(18,2) NULL;
```

## Luồng thanh toán

### 1. Tạo booking
1. User đặt tour trên `detailtour.html`
2. Booking được tạo với trạng thái "Chờ thanh toán"
3. User được chuyển đến `payment.html`

### 2. Chọn phương thức thanh toán
1. User chọn "Ví MoMo" trên trang payment
2. Hiển thị chi tiết thanh toán MoMo
3. User nhấn "Thanh toán với MoMo"

### 3. Xử lý thanh toán
1. Frontend gọi API `/api/payment/momo/create`
2. Backend tạo giao dịch MoMo và trả về `payUrl`
3. User được chuyển đến trang MoMo để thanh toán

### 4. Callback xử lý
1. MoMo gọi IPN URL khi thanh toán hoàn tất
2. Backend cập nhật trạng thái booking
3. User được chuyển về return URL

## Testing

### 1. Test với MoMo Sandbox
- Sử dụng thông tin test từ MoMo
- Partner Code: MOMO
- Access Key: F8BBA842ECF85
- Secret Key: K951BPE1waDMi640xX08PD3vg6EkVlz

### 2. Test Cases
1. **Tạo giao dịch thành công**
   - Gọi API create với booking hợp lệ
   - Kiểm tra response có payUrl

2. **IPN xử lý thành công**
   - Gửi IPN với resultCode = 0
   - Kiểm tra booking được cập nhật

3. **IPN xử lý thất bại**
   - Gửi IPN với resultCode != 0
   - Kiểm tra booking không được cập nhật

4. **Return URL**
   - Test với resultCode = 0 (thành công)
   - Test với resultCode != 0 (thất bại)

## Troubleshooting

### 1. Lỗi thường gặp
- **"Invalid signature"**: Kiểm tra secret key và cách tạo signature
- **"Partner code not found"**: Kiểm tra partner code
- **"Amount invalid"**: Kiểm tra số tiền phải > 0
- **"Order ID exists"**: Sử dụng order ID duy nhất

### 2. Debug
- Kiểm tra logs trong console
- Sử dụng MoMo test environment
- Kiểm tra network requests trong browser dev tools

## Security

### 1. Signature Verification
- Tất cả IPN requests phải được verify signature
- Sử dụng HMAC SHA256 với secret key

### 2. HTTPS
- Production phải sử dụng HTTPS
- MoMo chỉ chấp nhận HTTPS URLs

### 3. Data Validation
- Validate tất cả input data
- Kiểm tra amount và orderId

## Production Deployment

### 1. Cập nhật cấu hình
- Thay đổi URLs từ localhost sang domain thực
- Sử dụng production MoMo credentials
- Enable HTTPS

### 2. Database
- Chạy migration để thêm MoMo columns
- Backup database trước khi deploy

### 3. Monitoring
- Monitor IPN logs
- Setup alerts cho failed payments
- Track payment success rate

## Support

Nếu gặp vấn đề, hãy kiểm tra:
1. MoMo documentation: https://developers.momo.vn/
2. Console logs
3. Network requests
4. Database records

---

**Lưu ý**: Đây là tích hợp test environment. Để sử dụng production, cần đăng ký tài khoản MoMo thương mại và cập nhật credentials.
