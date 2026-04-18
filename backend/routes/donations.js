const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { sendLowStockAlert } = require('../config/mailer');

const LOW_STOCK_THRESHOLD = 5;

// POST /api/donate - record a donation
router.post('/', async (req, res) => {
  const { donor_id, blood_group, units = 1.0, donation_date, test_result = 'passed', notes } = req.body;

  if (!donor_id || !blood_group || !donation_date) {
    return res.status(400).json({ success: false, message: 'donor_id, blood_group, and donation_date are required.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Eligibility check: last donation >= 90 days ago
    const [lastDonation] = await conn.query(
      'SELECT donation_date FROM donations WHERE donor_id = ? ORDER BY donation_date DESC LIMIT 1',
      [donor_id]
    );

    if (lastDonation.length > 0) {
      const last = new Date(lastDonation[0].donation_date);
      const today = new Date(donation_date);
      const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
      if (diffDays < 90) {
        await conn.rollback();
        conn.release();
        await db.query(
          'INSERT INTO eligibility_checks (donor_id, is_eligible, reason) VALUES (?, false, ?)',
          [donor_id, `Last donation was ${diffDays} days ago. Must wait 90 days.`]
        );
        return res.status(400).json({
          success: false,
          eligible: false,
          message: `Not eligible. Last donation was ${diffDays} days ago. Must wait ${90 - diffDays} more days.`
        });
      }
    }

    // Record donation
    const [result] = await conn.query(
      'INSERT INTO donations (donor_id, blood_group, units, donation_date, test_result, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [donor_id, blood_group, units, donation_date, test_result, notes]
    );

    // Update inventory only if test passed
    if (test_result === 'passed') {
      await conn.query(
        `INSERT INTO blood_inventory (blood_group, units_available) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE units_available = units_available + ?`,
        [blood_group, units, units]
      );
    }

    await conn.query(
      'INSERT INTO eligibility_checks (donor_id, is_eligible, reason) VALUES (?, true, "Eligible - donation recorded")',
      [donor_id]
    );

    await conn.commit();
    conn.release();

    // Check if low stock alert needed
    const [inventory] = await db.query(
      'SELECT units_available, low_stock_threshold FROM blood_inventory WHERE blood_group = ?',
      [blood_group]
    );
    if (inventory.length > 0) {
      const { units_available, low_stock_threshold } = inventory[0];
      if (units_available <= low_stock_threshold) {
        const [eligibleDonors] = await db.query(
          `SELECT DISTINCT dn.email FROM donors dn
           LEFT JOIN donations d ON dn.id = d.donor_id
           WHERE dn.blood_group = ?
           AND (d.donation_date IS NULL OR DATEDIFF(CURDATE(), d.donation_date) >= 90)`,
          [blood_group]
        );
        sendLowStockAlert(blood_group, units_available, eligibleDonors);
      }
    }

    res.status(201).json({ success: true, message: 'Donation recorded successfully.', donation_id: result.insertId });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/donate/check-eligibility/:donor_id
router.get('/check-eligibility/:donor_id', async (req, res) => {
  const { donor_id } = req.params;
  try {
    const [donor] = await db.query('SELECT * FROM donors WHERE id = ?', [donor_id]);
    if (donor.length === 0) return res.status(404).json({ success: false, message: 'Donor not found.' });

    const [lastDonation] = await db.query(
      'SELECT donation_date FROM donations WHERE donor_id = ? ORDER BY donation_date DESC LIMIT 1',
      [donor_id]
    );

    if (lastDonation.length === 0) {
      return res.json({ success: true, eligible: true, message: 'No previous donations. Eligible to donate.' });
    }

    const last = new Date(lastDonation[0].donation_date);
    const today = new Date();
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    if (diffDays >= 90) {
      res.json({
        success: true, eligible: true,
        message: `Eligible to donate. Last donation was ${diffDays} days ago.`,
        last_donation: lastDonation[0].donation_date,
        days_since: diffDays
      });
    } else {
      const daysLeft = 90 - diffDays;
      res.json({
        success: true, eligible: false,
        message: `Not eligible. ${daysLeft} more days required.`,
        last_donation: lastDonation[0].donation_date,
        days_since: diffDays,
        days_until_eligible: daysLeft
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/donate/all
router.get('/all', async (req, res) => {
  try {
    const [donations] = await db.query(
      `SELECT d.*, dn.name as donor_name, dn.email as donor_email 
       FROM donations d JOIN donors dn ON d.donor_id = dn.id 
       ORDER BY d.donation_date DESC LIMIT 100`
    );
    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
