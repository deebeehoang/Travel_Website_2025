const mysql = require('mysql2/promise');

async function checkDatabaseSchema() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'travel_test001'
        });

        console.log('🔍 Kiểm tra cấu trúc database...');

        // Kiểm tra bảng Khach_hang
        const [khachHangColumns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'travel_test001' 
            AND TABLE_NAME = 'Khach_hang'
        `);
        
        console.log('📋 Cột trong bảng Khach_hang:');
        khachHangColumns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
        });

        // Kiểm tra bảng Tai_khoan
        const [taiKhoanColumns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'travel_test001' 
            AND TABLE_NAME = 'Tai_khoan'
        `);
        
        console.log('\n📋 Cột trong bảng Tai_khoan:');
        taiKhoanColumns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
        });

        // Kiểm tra bảng Booking
        const [bookingColumns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'travel_test001' 
            AND TABLE_NAME = 'Booking'
        `);
        
        console.log('\n📋 Cột trong bảng Booking:');
        bookingColumns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
        });

        // Test query đơn giản
        console.log('\n🧪 Test query đơn giản...');
        const [testResult] = await connection.execute(`
            SELECT 
                b.Ma_booking,
                kh.Ten_khach_hang,
                tk.Email
            FROM Booking b
            JOIN Khach_hang kh ON b.Ma_khach_hang = kh.Ma_khach_hang
            JOIN Tai_khoan tk ON kh.Id_user = tk.Id_user
            LIMIT 1
        `);
        
        console.log('✅ Query test thành công:', testResult);

        await connection.end();
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
}

checkDatabaseSchema();
