/**
 * Netlify Serverless Function - API Gateway
 * 
 * This function acts as a serverless wrapper around the existing Express backend.
 * It maintains all existing routes and functionality while adapting to Netlify's
 * serverless architecture.
 * 
 * How it works:
 * 1. Frontend requests go to /api/* or /images/*
 * 2. Netlify redirects to /.netlify/functions/api
 * 3. This function forwards to the Express app
 * 4. Express routes handle the request (unchanged)
 * 5. Response is returned to the frontend
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const serverless = require('serverless-http');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

// MongoDB Connection - check multiple possible env var names for flexibility
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI || '';
const DB_NAME = process.env.DB_NAME || 'car-hire';
mongoose.set('strictQuery', false);

// Initialize Express app
const app = express();

// Security middleware with relaxed settings for Netlify
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'blob:', '*'],
            connectSrc: ["'self'", '*']
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    handler: (req, res) => {
        res.status(429).json({ 
            success: false, 
            message: 'Too many requests from this IP, please try again later.' 
        });
    }
});
app.use('/api/', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-auth-token'],
    exposedHeaders: ['Authorization'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('dev'));

// Request logging with detailed path information
app.use((req, res, next) => {
    console.log(`[Request] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log(`[Request] Original URL: ${req.originalUrl}, Path: ${req.path}, Base URL: ${req.baseUrl}`);
    next();
});

// Static file serving (paths adjusted for serverless)
const backendPath = path.join(__dirname, '../../backend');
app.use('/images', express.static(path.join(backendPath, 'uploads')));
app.use('/static', express.static(path.join(backendPath, 'public')));
app.use('/uploads', express.static(path.join(backendPath, 'uploads')));

// MongoDB connection (lazy initialization for serverless)
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    if (!MONGODB_URI) {
        console.warn('No MongoDB URI provided. Running without DB connection.');
        return;
    }

    try {
        console.log('Establishing new MongoDB connection...');
        await mongoose.connect(MONGODB_URI, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            heartbeatFrequencyMS: 2000,
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            autoIndex: true
        });
        
        isConnected = true;
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        throw err;
    }
};

// Middleware to ensure DB connection before each request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(503).json({
            success: false,
            message: 'Database temporarily unavailable'
        });
    }
});

// Import routes (all existing routes remain unchanged)
const routes = {
    vehicles: require('../../backend/routes/vehicles'),
    bookings: require('../../backend/routes/bookings'),
    adventureBookings: require('../../backend/routes/adventure-bookings'),
    mpesa: require('../../backend/routes/mpesa'),
    adminAuth: require('../../backend/routes/admin-auth'),
    admin: require('../../backend/routes/admin'),
    system: require('../../backend/routes/system'),
    messages: require('../../backend/routes/messages'),
    adminUsers: require('../../backend/routes/admin-users'),
    adventures: require('../../backend/routes/adventures'),
    psvBookings: require('../../backend/routes/psv-bookings')
};

// Register vehicle image route - handles both /images/vehicles/:id and /api/images/vehicles/:id
// This ensures compatibility with different path prefixes after Netlify redirects
// Images are stored in MongoDB as Buffer data, not in filesystem
const handleVehicleImage = async (req, res) => {
    try {
        const vehicleId = req.params.id;
        const index = req.params.index ? parseInt(req.params.index) : 0;
        console.log(`[Image Route] Serving image for vehicle ID: ${vehicleId}, index: ${index}, path: ${req.path}`);
        
        await connectDB();
        const Vehicle = require('../../backend/models/Vehicle');
        
        // Fetch vehicle with image data from MongoDB
        const vehicle = await Vehicle.findById(vehicleId).select('image images');
        
        if (!vehicle) {
            console.warn(`[Image Route] Vehicle not found for ID: ${vehicleId}`);
            return res.status(404).send('Vehicle not found');
        }
        
        // Get the requested image from MongoDB
        let imageData;
        if (index === 0 && vehicle.image) {
            imageData = vehicle.image; // Primary image from MongoDB
        } else if (vehicle.images && vehicle.images[index]) {
            imageData = vehicle.images[index]; // Image from images array in MongoDB
        } else {
            console.warn(`[Image Route] Image not found for vehicle ID: ${vehicleId}, index: ${index}`);
            return res.status(404).send('Image not found');
        }
        
        // Generate ETag for caching
        const etag = `"${vehicleId}-${index}-${imageData.data.length}"`;
        
        // Check if browser has a cached version
        if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();
        }
        
        // Set proper headers for image serving from MongoDB Buffer
        res.set({
            'Content-Type': imageData.contentType,
            'Content-Length': imageData.data.length,
            'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
            'ETag': etag,
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
            'Cross-Origin-Resource-Policy': 'cross-origin',
            'Vary': 'Accept-Encoding'
        });
        
        // Send the image Buffer data from MongoDB
        res.send(imageData.data);
    } catch (error) {
        console.error('[Image Route] Error serving image from MongoDB:', error);
        res.status(500).send('Error loading image');
    }
};

// Note: The main image route is handled by the vehicles router at /api/vehicles/:id/image/:index?
// This is a backup route for /images/vehicles/:id pattern (alternative path)
// The vehicles router handles the primary route: /api/vehicles/:id/image/:index?
app.get(['/images/vehicles/:id/:index?', '/api/images/vehicles/:id/:index?'], handleVehicleImage);

// Register all API routes
// IMPORTANT: Routes are mounted at BOTH /api/* and /* paths to handle Netlify's path rewriting.
// When Netlify redirects /api/* to /.netlify/functions/api/:splat, serverless-http may strip
// the prefix, so we mount at both paths to ensure requests work regardless of how the path is processed.
app.use(['/api/vehicles', '/vehicles'], routes.vehicles);
app.use(['/api/bookings', '/bookings'], routes.bookings);
app.use(['/api/adventure-bookings', '/adventure-bookings'], routes.adventureBookings);
app.use(['/api/mpesa', '/mpesa'], routes.mpesa);
app.use(['/api/admin', '/admin'], routes.admin);
app.use(['/api/admin/auth', '/admin/auth'], routes.adminAuth);
app.use(['/api/system', '/system'], routes.system);
app.use(['/api/messages', '/messages'], routes.messages);
app.use(['/api/admin/users', '/admin/users'], routes.adminUsers);
app.use(['/api/adventures', '/adventures'], routes.adventures);
app.use(['/api/psv-bookings', '/psv-bookings'], routes.psvBookings);

// API request logging
let lastVerifyLogAt = 0;
app.use('/api', (req, res, next) => {
    if (req.originalUrl.startsWith('/api/admin/auth/verify')) {
        const now = Date.now();
        if (now - lastVerifyLogAt > 2000) {
            console.log(`API Request: ${req.method} ${req.originalUrl}`);
            lastVerifyLogAt = now;
        }
    } else {
        console.log(`API Request: ${req.method} ${req.originalUrl}`);
    }
    
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
        res.header('Access-Control-Max-Age', '86400');
        return res.status(204).end();
    }
    next();
});

// Test database connection endpoint (unchanged from original)
app.get('/api/test-db', async (req, res) => {
    try {
        await connectDB();
        
        const Vehicle = require('../../backend/models/Vehicle');
        const Adventure = require('../../backend/models/Adventure');
        const Admin = require('../../backend/models/Admin');

        const results = {
            vehicles: await Vehicle.find().limit(1),
            adventures: await Adventure.find().limit(1),
            admins: await Admin.find().select('-password').limit(1),
            dbStatus: 'connected'
        };

        res.json({
            success: true,
            dbStatus: 'connected',
            environment: 'netlify-serverless',
            collectionsStatus: {
                vehicles: results.vehicles.length > 0 ? 'has data' : 'empty',
                adventures: results.adventures.length > 0 ? 'has data' : 'empty',
                admins: results.admins.length > 0 ? 'has data' : 'empty'
            },
            data: results
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            dbStatus: 'error', 
            error: error.message 
        });
    }
});

// 404 handler
app.use((req, res) => {
    console.log('404 hit for:', req.method, req.url);
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

// Export the serverless handler
// This wraps the Express app for Netlify Functions
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // Keep connection alive across invocations
    context.callbackWaitsForEmptyEventLoop = false;
    
    // Log incoming event for debugging image requests
    if (event.path && (event.path.includes('/image') || event.path.includes('/vehicles'))) {
        console.log('[Image Debug] Event received:', {
            path: event.path,
            rawPath: event.rawPath,
            httpMethod: event.httpMethod,
            pathParameters: event.pathParameters,
            queryStringParameters: event.queryStringParameters
        });
    }
    
    try {
        await connectDB();
        const result = await handler(event, context);
        
        // Log response for image requests
        if (event.path && (event.path.includes('/image') || event.path.includes('/vehicles'))) {
            console.log('[Image Debug] Response status:', result?.statusCode);
        }
        
        return result;
    } catch (error) {
        console.error('[Function Error]', error);
        console.error('[Function Error] Stack:', error.stack);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'production' ? undefined : error.message
            })
        };
    }
};
