const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/donors/register
router.post('/register', async (req, res) => {
  const { name, email, phone, blood_group, date_of_birth } = req.body;
  if (!name || !email || !blood_group) {
    return res.status(400).json({ success: false, message: 'Name, email, and blood group are required.' });
  }
  try {
    const [existing] = await db.query('SELECT id FROM donors WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    const [result] = await db.query(
      'INSERT INTO donors (name, email, phone, blood_group, date_of_birth) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, blood_group, date_of_birth || null]
    );
    res.status(201).json({ success: true, message: 'Donor registered successfully.', donor_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/donors - list all donors
router.get('/', async (req, res) => {
  try {
    const [donors] = await db.query(
      'SELECT id, name, email, phone, blood_group, date_of_birth, created_at FROM donors ORDER BY created_at DESC'
    );
    res.json({ success: true, donors });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/donors/:id - single donor
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM donors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Donor not found.' });
    res.json({ success: true, donor: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/donors/:id/history - donation history
router.get('/:id/history', async (req, res) => {
  try {
    const [donations] = await db.query(
      `SELECT d.*, dn.name, dn.blood_group as donor_blood_group 
       FROM donations d JOIN donors dn ON d.donor_id = dn.id 
       WHERE d.donor_id = ? ORDER BY d.donation_date DESC`,
      [req.params.id]
    );
    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
