const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/hospitals/register
router.post('/register', async (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }
  try {
    const [existing] = await db.query('SELECT id FROM hospitals WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Hospital email already registered.' });
    }
    const [result] = await db.query(
      'INSERT INTO hospitals (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone, address]
    );
    res.status(201).json({ success: true, message: 'Hospital registered.', hospital_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/hospitals
router.get('/', async (req, res) => {
  try {
    const [hospitals] = await db.query('SELECT * FROM hospitals ORDER BY registered_at DESC');
    res.json({ success: true, hospitals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
