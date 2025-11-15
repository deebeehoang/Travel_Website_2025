const pool = require('../config/database');

class Ticket {
  /**
   * Get all tickets
   */
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM Ve');
    return rows;
  }

  /**
   * Get ticket by ID (So_ve)
   */
  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM Ve WHERE So_ve = ?',
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Delete ticket by ID
   */
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM Ve WHERE So_ve = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get tickets by booking ID
   * @param {string} bookingId - Booking ID
   * @returns {Array} - List of tickets for booking
   */
  static async getByBookingId(bookingId) {
    const [rows] = await pool.query(
      'SELECT * FROM Ve WHERE Ma_booking = ?',
      [bookingId]
    );
    return rows;
  }

  /**
   * Update ticket price and status
   * @param {string} id - Ticket ID (So_ve)
   * @param {Object} ticketData - { gia_ve, trang_thai_ve }
   * @returns {Object} - Updated ticket
   */
  static async update(id, ticketData) {
    const { gia_ve, trang_thai_ve } = ticketData;
    
    // Tạo query động dựa trên các trường được cung cấp
    let fields = [];
    let values = [];
    
    if (gia_ve !== undefined) {
      fields.push('Gia_ve = ?');
      values.push(gia_ve);
    }
    
    if (trang_thai_ve !== undefined) {
      fields.push('Trang_thai_ve = ?');
      values.push(trang_thai_ve);
    }
    
    if (fields.length === 0) {
      return await this.getById(id); // Không có trường nào cần cập nhật
    }
    
    // Thêm ID vé vào cuối mảng values
    values.push(id);
    
    await pool.query(
      `UPDATE Ve SET ${fields.join(', ')} WHERE So_ve = ?`,
      values
    );
    
    return await this.getById(id);
  }
  
  /**
   * Update ticket status
   * @param {string} id - Ticket ID (So_ve)
   * @param {string} status - New status ('Chua_su_dung', 'Da_su_dung', 'Da_huy')
   * @returns {Object} - Updated ticket
   */
  static async updateStatus(id, status) {
    if (!['Chua_su_dung', 'Da_su_dung', 'Da_huy'].includes(status)) {
      throw new Error('Invalid ticket status');
    }
    
    await pool.query(
      'UPDATE Ve SET Trang_thai_ve = ? WHERE So_ve = ?',
      [status, id]
    );
    
    return await this.getById(id);
  }
}

module.exports = Ticket;