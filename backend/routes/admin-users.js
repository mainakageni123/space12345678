const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/auth');

// Helper to ensure superuser 'admin'
function requireSuperuser(req, res, next) {
  if (req.admin?.username !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
}

// List all admins (admin only)
router.get('/', authMiddleware, requireSuperuser, async (req, res) => {
  const admins = await Admin.find().select('-password');
  res.json({ success: true, admins, count: admins.length });
});

// Create new admin (admin only)
router.post('/', authMiddleware, requireSuperuser, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'username and password required' });
  }
  const exists = await Admin.findOne({ username });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }
  const admin = new Admin({ username, password });
  await admin.save();
  res.status(201).json({ success: true });
});

// Delete admin (admin only; cannot delete superuser)
router.delete('/:id', authMiddleware, requireSuperuser, async (req, res) => {
  const user = await Admin.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  if (user.username === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot delete superuser' });
  }
  await Admin.findByIdAndDelete(user._id);
  res.json({ success: true });
});

// Change password (self or superuser can change anyone)
router.post('/:id/password', authMiddleware, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'password required' });
  }

  const isSuperuser = req.admin.username === 'admin';
  const isSelf = req.admin._id.toString() === req.params.id;

  if (!isSuperuser && !isSelf) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const user = await Admin.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  user.password = password; // Will be hashed by pre-save middleware
  await user.save();

  res.json({ success: true });
});

module.exports = router;
