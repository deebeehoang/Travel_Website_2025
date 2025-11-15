# Hướng dẫn kích hoạt Gemini API

## Vấn đề hiện tại
Tất cả các model Gemini đều trả về lỗi 404, điều này cho thấy Generative AI API chưa được kích hoạt trong Google Cloud Console.

## Các bước khắc phục

### 1. Kiểm tra và kích hoạt Generative AI API

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn: **projects/16291446795** (Project number: 16291446795)
3. Điều hướng đến **APIs & Services** > **Library**
4. Tìm kiếm "**Generative Language API**" hoặc "**Gemini API**"
5. Click vào API và nhấn **Enable** (Kích hoạt)

### 2. Kiểm tra quyền truy cập API Key

1. Điều hướng đến **APIs & Services** > **Credentials**
2. Tìm API key: **ChatboxAI-Key** (AIzaSyBmlWn7yZcveKJQuIGIRMTgvi0j7aIYMT4)
3. Click vào API key để chỉnh sửa
4. Trong phần **API restrictions**, đảm bảo:
   - Chọn **Restrict key**
   - Thêm **Generative Language API** vào danh sách được phép
   - Hoặc chọn **Don't restrict key** (không khuyến nghị cho production)

### 3. Kiểm tra billing (nếu cần)

- Đảm bảo project đã có billing account được kích hoạt
- Gemini API có thể yêu cầu billing để sử dụng

### 4. Kiểm tra lại sau khi kích hoạt

Sau khi kích hoạt API, đợi vài phút rồi thử lại. Hệ thống sẽ tự động thử các model sau theo thứ tự:

1. `gemini-2.0-flash-exp` (Model mới nhất)
2. `gemini-1.5-pro-latest`
3. `gemini-1.5-flash-latest`
4. `gemini-1.5-pro`
5. `gemini-1.5-flash`
6. `gemini-pro`

## API Key hiện tại

- **API Key**: `AIzaSyBmlWn7yZcveKJQuIGIRMTgvi0j7aIYMT4`
- **Name**: ChatboxAI-Key
- **Project**: projects/16291446795
- **Đã được thiết lập trong**: `.env` file

## Kiểm tra nhanh

Sau khi kích hoạt API, khởi động lại server và thử chat với AI. Hệ thống sẽ tự động:
- Thử từng model cho đến khi tìm thấy model hoạt động
- Hiển thị log cho biết model nào đang được sử dụng
- Tự động fallback nếu model không khả dụng

## Liên kết hữu ích

- [Google AI Studio](https://makersuite.google.com/app/apikey) - Quản lý API keys
- [Gemini API Documentation](https://ai.google.dev/docs) - Tài liệu API
- [Google Cloud Console](https://console.cloud.google.com/) - Quản lý project

