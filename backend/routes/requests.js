const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { sendRequestStatusEmail } = require('../config/mailer');

// POST /api/request - hospital requests blood
router.post('/', async (req, res) => {
  const { hospital_id, blood_group, units_requested, urgency = 'normal' } = req.body;

  if (!hospital_id || !blood_group || !units_requested) {
    return res.status(400).json({ success: false, message: 'hospital_id, blood_group, and units_requested are required.' });
  }

  try {
    // Check inventory availability
    const [inventory] = await db.query(
      'SELECT units_available FROM blood_inventory WHERE blood_group = ?',
      [blood_group]
    );

    if (inventory.length === 0 || inventory[0].units_available < units_requested) {
      // Still log the request
      const [result] = await db.query(
        'INSERT INTO blood_requests (hospital_id, blood_group, units_requested, urgency, status) VALUES (?, ?, ?, ?, "pending")',
        [hospital_id, blood_group, units_requested, urgency]
      );
      return res.status(202).json({
        success: true,
        message: 'Request logged. Insufficient stock - pending admin review.',
        request_id: result.insertId,
        available_units: inventory[0]?.units_available || 0
      });
    }

    const [result] = await db.query(
      'INSERT INTO blood_requests (hospital_id, blood_group, units_requested, urgency, status) VALUES (?, ?, ?, ?, "pending")',
      [hospital_id, blood_group, units_requested, urgency]
    );

    res.status(201).json({
      success: true,
      message: 'Blood request submitted successfully. Pending admin approval.',
      request_id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/request - list all requests
router.get('/', async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT br.*, h.name as hospital_name, h.email as hospital_email 
       FROM blood_requests br 
       JOIN hospitals h ON br.hospital_id = h.id 
       ORDER BY br.requested_at DESC`
    );
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/request/:id/approve - admin approves request (deducts stock with transaction lock)
router.put('/:id/approve', async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Lock the request row
    const [requests] = await conn.query(
      'SELECT br.*, h.email as hospital_email, h.name as hospital_name FROM blood_requests br JOIN hospitals h ON br.hospital_id = h.id WHERE br.id = ? FOR UPDATE',
      [id]
    );

    if (requests.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const request = requests[0];

    if (request.status !== 'pending') {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: `Request already ${request.status}.` });
    }

    // Lock inventory row and check availability
    const [inventory] = await conn.query(
      'SELECT units_available FROM blood_inventory WHERE blood_group = ? FOR UPDATE',
      [request.blood_group]
    );

    if (inventory.length === 0 || inventory[0].units_available < request.units_requested) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${inventory[0]?.units_available || 0} units.`
      });
    }

    // Deduct units with transaction lock
    await conn.query(
      'UPDATE blood_inventory SET units_available = units_available - ? WHERE blood_group = ?',
      [request.units_requested, request.blood_group]
    );

    // Update request status
    await conn.query('UPDATE blood_requests SET status = "approved" WHERE id = ?', [id]);

    await conn.commit();
    conn.release();

    // Send email notification
    sendRequestStatusEmail(
      request.hospital_email,
      request.hospital_name,
      request.blood_group,
      request.units_requested,
      'approved'
    );

    res.json({ success: true, message: 'Request approved and stock deducted.' });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/request/:id/reject - admin rejects request
router.put('/:id/reject', async (req, res) => {
  const { id } = req.params;
  try {
    const [requests] = await db.query(
      'SELECT br.*, h.email as hospital_email, h.name as hospital_name FROM blood_requests br JOIN hospitals h ON br.hospital_id = h.id WHERE br.id = ?',
      [id]
    );

    if (requests.length === 0) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (requests[0].status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request already ${requests[0].status}.` });
    }

    await db.query('UPDATE blood_requests SET status = "rejected" WHERE id = ?', [id]);

    sendRequestStatusEmail(
      requests[0].hospital_email,
      requests[0].hospital_name,
      requests[0].blood_group,
      requests[0].units_requested,
      'rejected'
    );

    res.json({ success: true, message: 'Request rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
