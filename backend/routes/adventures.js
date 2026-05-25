const express = require('express');
const router = express.Router();
const Adventure = require('../models/Adventure');
const authMiddleware = require('../middleware/auth');
const { normalizeAdventureData } = require('../utils/normalizeAdventure');
const { cloudinary } = require('../config/cloudinary');
const { singleImageUpload } = require('../middleware/cloudinaryUpload');
const mongoose = require('mongoose');

// List all adventures
router.get('/', async (req, res) => {
    try {
        const adventures = await Adventure.find().sort({ createdAt: -1 });
        
        // Auto-fix: Initialize bookedSeats for adventures that don't have it
        let fixed = 0;
        for (const adv of adventures) {
            if (adv.bookedSeats === undefined || adv.bookedSeats === null) {
                adv.bookedSeats = 0;
                await adv.save();
                fixed++;
                console.log(`✅ Auto-fixed: ${adv.title} → bookedSeats: 0`);
            }
        }
        if (fixed > 0) {
            console.log(`🔧 Auto-fixed ${fixed} adventure(s)`);
        }
        
        // Reload adventures to get updated data with virtuals
        const updatedAdventures = await Adventure.find().sort({ createdAt: -1 });
        
        // Log seat information for debugging
        console.log('=== Adventures Seat Status ===');
        updatedAdventures.forEach(adv => {
            console.log(`${adv.title}: max=${adv.maxParticipants}, booked=${adv.bookedSeats}, available=${adv.availableSeats}`);
        });
        
        res.json({ success: true, adventures: updatedAdventures });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Get one
router.get('/:id', async (req, res) => {
    try {
        const adv = await Adventure.findById(req.params.id);
        if (!adv) return res.status(404).json({ success: false, message: 'Not found' });
        
        // Auto-fix: Initialize bookedSeats if missing
        if (adv.bookedSeats === undefined || adv.bookedSeats === null) {
            adv.bookedSeats = 0;
            await adv.save();
            console.log(`✅ Auto-fixed: ${adv.title} → bookedSeats: 0`);
        }
        
        res.json({ success: true, adventure: adv });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
});

// Create (admin only)
router.post('/', authMiddleware, singleImageUpload, async (req, res) => {
    try {
        const adventureData = { ...req.body };
        
        // Handle image from file upload
        if (req.file) {
            adventureData.image = req.file.path;
        }

        // Parse array fields if they come as strings (from FormData)
        if (typeof adventureData.highlights === 'string') {
            try {
                adventureData.highlights = JSON.parse(adventureData.highlights);
            } catch (e) {
                adventureData.highlights = adventureData.highlights.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        
        if (typeof adventureData.included === 'string') {
            try {
                adventureData.included = JSON.parse(adventureData.included);
            } catch (e) {
                adventureData.included = adventureData.included.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        const normalized = normalizeAdventureData(adventureData);
        const adv = new Adventure(normalized);
        await adv.save();
        res.status(201).json({ success: true, adventure: adv });
    } catch (e) {
        console.error('Error creating adventure:', e);
        res.status(400).json({ success: false, message: e.message });
    }
});

// Update (admin only)
router.put('/:id', authMiddleware, singleImageUpload, async (req, res) => {
    try {
        const adventureData = { ...req.body };
        
        // Handle image from file upload
        if (req.file) {
            adventureData.image = req.file.path;
        }

        // Parse array fields if they come as strings (from FormData)
        if (typeof adventureData.highlights === 'string') {
            try {
                adventureData.highlights = JSON.parse(adventureData.highlights);
            } catch (e) {
                adventureData.highlights = adventureData.highlights.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        
        if (typeof adventureData.included === 'string') {
            try {
                adventureData.included = JSON.parse(adventureData.included);
            } catch (e) {
                adventureData.included = adventureData.included.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        const normalized = normalizeAdventureData(adventureData);
        const adv = await Adventure.findByIdAndUpdate(req.params.id, normalized, { new: true });
        if (!adv) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, adventure: adv });
    } catch (e) {
        console.error('Error updating adventure:', e);
        res.status(400).json({ success: false, message: e.message });
    }
});

// Helper function to extract Cloudinary public ID from URL
const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;
        const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
        return publicIdWithExt.split('.')[0];
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

// Delete (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Delete request received for adventure ID:', id);
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid adventure ID format' });
        }
        
        const adventure = await Adventure.findById(id);
        if (!adventure) {
            return res.status(404).json({ success: false, message: 'Adventure not found' });
        }
        
        // 1. Cleanup Cloudinary image if it exists
        if (adventure.image) {
            const publicId = getPublicIdFromUrl(adventure.image);
            if (publicId) {
                console.log(`[Cloudinary Cleanup] Deleting adventure image: ${publicId}`);
                await cloudinary.uploader.destroy(publicId).catch(err => {
                    console.error('Cloudinary destruction failed:', err);
                });
            }
        }

        // 2. Delete from MongoDB
        await Adventure.findByIdAndDelete(id);
        
        res.json({ 
            success: true, 
            message: 'Adventure and associated cloud image deleted successfully',
            id: id 
        });
    } catch (e) {
        console.error('Error deleting adventure:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;




