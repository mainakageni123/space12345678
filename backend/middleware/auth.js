const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
    try {
        // Check for token in header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Check if admin still exists
        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        // Attach admin to request
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        res.status(401).json({
            success: false,
            message: 'Invalid token. Please login again.'
        });
    }
};

// Middleware to check if admin has superadmin role
const superAdminOnly = async (req, res, next) => {
    try {
        // First ensure user is authenticated
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if admin has superadmin role
        if (req.admin.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Superadmin privileges required.'
            });
        }

        next();
    } catch (error) {
        console.error('SuperAdmin auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Authorization check failed'
        });
    }
};

module.exports = authMiddleware;
module.exports.superAdminOnly = superAdminOnly;