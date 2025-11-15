const mysql = require('mysql2/promise');

async function checkSchema() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'travel_test003'
        });
        
        console.log('🔍 Checking Chi_tiet_booking schema...');
        const [ctbRows] = await connection.execute('DESCRIBE Chi_tiet_booking');
        
        console.log('\n📊 Schema Chi_tiet_booking:');
        ctbRows.forEach(row => {
            console.log(`- ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Key ? `(${row.Key})` : ''}`);
        });
        
        console.log('\n🔍 Checking sample data...');
        const [ctbData] = await connection.execute('SELECT * FROM Chi_tiet_booking LIMIT 1');
        if (ctbData.length > 0) {
            console.log('📋 Sample Chi_tiet_booking record:', ctbData[0]);
        } else {
            console.log('❌ No Chi_tiet_booking data found');
        }
        
        console.log('\n🔍 Checking Booking schema...');
        const [bookingRows] = await connection.execute('DESCRIBE Booking');
        
        console.log('\n📊 Schema Booking:');
        bookingRows.forEach(row => {
            console.log(`- ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Key ? `(${row.Key})` : ''}`);
        });
        
        console.log('\n🔍 Checking sample Booking data...');
        const [bookingData] = await connection.execute('SELECT * FROM Booking LIMIT 1');
        if (bookingData.length > 0) {
            console.log('📋 Sample Booking record:', bookingData[0]);
        } else {
            console.log('❌ No Booking data found');
        }
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkSchema();
