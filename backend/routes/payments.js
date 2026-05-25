const express = require('express');
const router = express.Router();

// Placeholder MPesa STK push endpoint
router.post('/mpesa', async (req, res) => {
  try {
    const { phone, amount } = req.body || {};
    if (!phone || !amount) {
      return res.status(400).json({ success: false, error: 'phone and amount are required' });
    }
    // TODO: Integrate with Safaricom Daraja here
    // For now, simulate a success response
    res.json({ success: true, data: { checkoutRequestID: 'SIMULATED_CHECKOUT_ID', phone, amount } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;


