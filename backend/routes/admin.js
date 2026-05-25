const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

// Create new admin (Protected Route)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both username and password'
            });
        }

        // Check if username already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Create new admin
        const admin = new Admin({ username, password });
        await admin.save();

        res.json({
            success: true,
            message: 'Admin user created successfully'
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating admin user'
        });
    }
});

// Admin Login
router.post('/login', async (req, res) => {
    console.log('POST /admin/login called');
    try {
        const { username, password } = req.body;
        console.log('Login request body:', req.body);

        // Validate input
        if (!username || !password) {
            console.log('Missing credentials:', { username: !!username, password: !!password });
            return res.status(400).json({
                success: false,
                message: 'Please provide both username and password'
            });
        }
        
        console.log('Login attempt for username:', username);
        
        // Find admin user
        const admin = await Admin.findOne({ username });
        if (!admin) {
            console.log('No admin found with username:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        console.log('Admin found:', admin.username);

        // Verify password
        console.log('Comparing passwords...');
        const isMatch = await admin.comparePassword(password);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('Password verification failed');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate token using the model method
        const token = admin.generateAuthToken();

        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                lastLogin: admin.lastLogin
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login. Please try again.'
        });
    }
});

// Verify admin token
router.get('/verify', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password');
        if (!admin) {
            return res.status(401).json({ 
                success: false,
                message: 'Admin user not found' 
            });
        }
        res.json({ 
            success: true,
            message: 'Token valid', 
            admin: {
                id: admin._id,
                username: admin.username,
                lastLogin: admin.lastLogin
            }
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
});

// Change Password (Protected Route)
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find admin user
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Verify current password
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Token (Used to check if admin is still authenticated)
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json({ valid: true });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;