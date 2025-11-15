const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initDatabase() {
    try {
        // Kết nối đến MySQL với database đã chọn
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Đã kết nối đến MySQL server');

        // Đọc file SQL
        const sqlPath = path.join(__dirname, '../database/init.sql');
        const sqlContent = await fs.readFile(sqlPath, 'utf8');

        // Tách các câu lệnh SQL và thực thi
        const sqlStatements = sqlContent.split(';').filter(statement => statement.trim());
        
        for (const statement of sqlStatements) {
            if (statement.trim()) {
                await connection.query(statement);
                console.log('Đã thực thi:', statement.trim());
            }
        }

        // Thêm dữ liệu mẫu
        await connection.query(`
            INSERT INTO tours (name, description, price, duration, destination, image, featured) VALUES
            ('Tour Hạ Long', 'Khám phá vịnh Hạ Long xinh đẹp', 2000000, '3 ngày 2 đêm', 'Hạ Long', '/images/halong.jpg', true),
            ('Tour Đà Nẵng', 'Thành phố đáng sống nhất Việt Nam', 3000000, '4 ngày 3 đêm', 'Đà Nẵng', '/images/danang.jpg', true),
            ('Tour Phú Quốc', 'Thiên đường biển đảo', 4000000, '3 ngày 2 đêm', 'Phú Quốc', '/images/phuquoc.jpg', true)
        `);

        console.log('Đã thêm dữ liệu mẫu');
        
        await connection.end();
        console.log('Khởi tạo database thành công!');
        
    } catch (error) {
        console.error('Lỗi:', error);
        process.exit(1);
    }
}

initDatabase(); 