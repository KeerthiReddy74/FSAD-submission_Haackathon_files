const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { sendLowStockAlert } = require('../config/mailer');

// GET /api/inventory - current count per blood group
router.get('/', async (req, res) => {
  try {
    const [inventory] = await db.query(
      'SELECT blood_group, units_available, low_stock_threshold, last_updated FROM blood_inventory ORDER BY blood_group'
    );
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/inventory/:blood_group - update stock manually (admin)
router.put('/:blood_group', async (req, res) => {
  const { blood_group } = req.params;
  const { units_available, low_stock_threshold } = req.body;

  try {
    await db.query(
      'UPDATE blood_inventory SET units_available = ?, low_stock_threshold = ? WHERE blood_group = ?',
      [units_available, low_stock_threshold || 5, blood_group]
    );

    // Check for low stock
    if (units_available <= (low_stock_threshold || 5)) {
      const [eligibleDonors] = await db.query(
        `SELECT DISTINCT dn.email FROM donors dn
         LEFT JOIN donations d ON dn.id = d.donor_id
         WHERE dn.blood_group = ?
         AND (d.donation_date IS NULL OR DATEDIFF(CURDATE(), d.donation_date) >= 90)`,
        [blood_group]
      );
      sendLowStockAlert(blood_group, units_available, eligibleDonors);
    }

    res.json({ success: true, message: 'Inventory updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
