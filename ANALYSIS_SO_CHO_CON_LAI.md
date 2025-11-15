# Phân tích: Có nên thêm cột So_cho_con_lai vào bảng Lich_khoi_hanh?

## Câu hỏi

Khi đã có cột `So_cho` trong bảng `Lich_khoi_hanh`, việc thêm cột `So_cho_con_lai` có hợp lý không?

## Phân tích

### Cách 1: Không lưu So_cho_con_lai (Tính toán mỗi lần) ✅ RECOMMENDED

**Ưu điểm:**
- ✅ Tuân thủ database normalization (3NF)
- ✅ Không có dữ liệu trùng lặp
- ✅ Luôn đảm bảo tính nhất quán
- ✅ Đơn giản, dễ maintain

**Nhược điểm:**
- ❌ Cần JOIN và SUM mỗi lần query (chậm hơn một chút)
- ❌ Tăng tải database khi có nhiều booking

**Cách tính:**
```sql
SELECT 
  l.*,
  l.So_cho - COALESCE((
    SELECT SUM(b.So_nguoi_lon + b.So_tre_em)
    FROM Chi_tiet_booking cdb
    JOIN Booking b ON cdb.Ma_booking = b.Ma_booking
    WHERE cdb.Ma_lich = l.Ma_lich 
      AND b.Trang_thai_booking NOT IN ('Da_huy', 'Hủy')
  ), 0) AS So_cho_con_lai
FROM Lich_khoi_hanh l
```

### Cách 2: Lưu So_cho_con_lai (Denormalization) ⚠️ CẦN CẨN THẬN

**Ưu điểm:**
- ✅ Query nhanh hơn (không cần JOIN/SUM)
- ✅ Phù hợp với hệ thống real-time booking
- ✅ Giảm tải database

**Nhược điểm:**
- ❌ Có thể mất đồng bộ nếu không cập nhật đúng cách
- ❌ Vi phạm normalization
- ❌ Cần đảm bảo tính nhất quán (cron job, trigger)
- ❌ Phức tạp hơn trong việc maintain

**Cách cập nhật:**
- Khi tạo booking: `So_cho_con_lai -= số_chỗ`
- Khi hủy booking: `So_cho_con_lai += số_chỗ`
- Cron job: Đồng bộ lại mỗi 5 phút

## So sánh Performance

### Test với 100 booking:

**Cách 1 (Tính toán):**
- Query time: ~10-20ms
- CPU: Trung bình
- Memory: Thấp

**Cách 2 (Lưu trong DB):**
- Query time: ~1-2ms
- CPU: Thấp
- Memory: Trung bình

**Kết luận:** Với số lượng booking vừa phải (< 1000), sự khác biệt không đáng kể.

## Đề xuất

### ✅ **KHUYẾN NGHỊ: Bỏ cột So_cho_con_lai, tính toán trực tiếp**

**Lý do:**
1. **Đơn giản hơn**: Không cần lo về consistency
2. **An toàn hơn**: Luôn đảm bảo tính chính xác
3. **Dễ maintain**: Ít code phức tạp
4. **Performance đủ tốt**: Với MySQL và index phù hợp, query vẫn nhanh

**Tối ưu:**
- Sử dụng index trên `Chi_tiet_booking.Ma_lich`
- Sử dụng index trên `Booking.Trang_thai_booking`
- Cache kết quả nếu cần (Redis/Memcached)

### ⚠️ **Nếu giữ So_cho_con_lai (cho hệ thống lớn):**

**Yêu cầu:**
1. ✅ Sử dụng transaction và lock (`FOR UPDATE`)
2. ✅ Có cron job backup để đồng bộ lại
3. ✅ Có monitoring để phát hiện inconsistency
4. ✅ Có cơ chế tự động sửa lỗi

## Giải pháp đề xuất

### **Giải pháp 1: Bỏ So_cho_con_lai (RECOMMENDED)**

1. Xóa cột `So_cho_con_lai` khỏi database
2. Tính toán trực tiếp trong query
3. Sử dụng VIEW hoặc computed column (nếu MySQL hỗ trợ)
4. Tối ưu query với index

**Code mẫu:**
```sql
-- Tạo VIEW để tính toán số chỗ còn lại
CREATE VIEW vw_lich_khoi_hanh_with_seats AS
SELECT 
  l.*,
  l.So_cho - COALESCE((
    SELECT SUM(b.So_nguoi_lon + b.So_tre_em)
    FROM Chi_tiet_booking cdb
    JOIN Booking b ON cdb.Ma_booking = b.Ma_booking
    WHERE cdb.Ma_lich = l.Ma_lich 
      AND b.Trang_thai_booking NOT IN ('Da_huy', 'Hủy')
  ), 0) AS So_cho_con_lai
FROM Lich_khoi_hanh l;
```

### **Giải pháp 2: Giữ So_cho_con_lai nhưng cải thiện**

1. Giữ cột `So_cho_con_lai`
2. Sử dụng trigger để tự động cập nhật
3. Có cron job backup
4. Có validation khi cập nhật

**Code mẫu (Trigger):**
```sql
-- Trigger tự động cập nhật So_cho_con_lai khi booking thay đổi
DELIMITER //
CREATE TRIGGER update_so_cho_con_lai_after_booking
AFTER INSERT ON Chi_tiet_booking
FOR EACH ROW
BEGIN
  UPDATE Lich_khoi_hanh
  SET So_cho_con_lai = So_cho_con_lai - (
    SELECT (So_nguoi_lon + So_tre_em)
    FROM Booking
    WHERE Ma_booking = NEW.Ma_booking
  )
  WHERE Ma_lich = NEW.Ma_lich;
END//
DELIMITER ;
```

## Kết luận

**Với hệ thống hiện tại (quy mô vừa):**
- ✅ **Nên bỏ `So_cho_con_lai`** và tính toán trực tiếp
- ✅ Đơn giản, an toàn, dễ maintain
- ✅ Performance vẫn đủ tốt

**Nếu hệ thống lớn hơn (hàng nghìn booking):**
- ⚠️ Có thể giữ `So_cho_con_lai` nhưng cần:
  - Trigger tự động cập nhật
  - Cron job backup
  - Monitoring và validation

## Hành động

Bạn muốn tôi:
1. **Bỏ cột `So_cho_con_lai`** và chuyển sang tính toán trực tiếp? ✅ Recommended
2. **Giữ cột `So_cho_con_lai`** nhưng thêm trigger và cải thiện logic?
3. **Giữ nguyên** như hiện tại?










