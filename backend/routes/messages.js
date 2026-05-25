const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

// Create (public - from customer form)
router.post('/', async (req, res) => {
    try {
        const msg = new Message(req.body);
        const saved = await msg.save();
        res.status(201).json({ success: true, message: saved });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// List (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Mark read (admin only)
router.patch('/:id/read', authMiddleware, async (req, res) => {
    try {
        const updated = await Message.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
        res.json({ success: true, message: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Delete (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true, id: req.params.id });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;


