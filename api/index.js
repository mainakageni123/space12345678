/**
 * Vercel Serverless Function - API Gateway
 * 
 * This file allows Vercel to host your Express backend directly, avoiding
 * external cold starts (like Railway) and allowing direct MongoDB connections
 * with caching for instant load times.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables (mostly for local testing, Vercel will inject them)
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI || '';
const DB_NAME = process.env.DB_NAME || 'car-hire';
mongoose.set('strictQuery', false);

// Initialize Express app
const app = express();

// Security middleware
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

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression middleware
app.use(compression());

// CORS configuration (allow Vercel frontend to talk to this API)
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

// MongoDB connection (lazy initialization & cached for serverless)
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    if (!MONGODB_URI) {
        console.warn('No MongoDB URI provided. Backend running without DB connection.');
        return;
    }

    try {
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
        console.log('✅ MongoDB Connected Successfully on Vercel');
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
        res.status(503).json({ success: false, message: 'Database temporarily unavailable' });
    }
});

// Import existing backend routes
const routes = {
    vehicles: require('../backend/routes/vehicles'),
    bookings: require('../backend/routes/bookings'),
    adventureBookings: require('../backend/routes/adventure-bookings'),
    mpesa: require('../backend/routes/mpesa'),
    adminAuth: require('../backend/routes/admin-auth'),
    admin: require('../backend/routes/admin'),
    system: require('../backend/routes/system'),
    messages: require('../backend/routes/messages'),
    adminUsers: require('../backend/routes/admin-users'),
    adventures: require('../backend/routes/adventures'),
    psvBookings: require('../backend/routes/psv-bookings'),
    whatsapp: require('../backend/routes/whatsapp-webhook')
};

// Register all API routes
app.use('/api/vehicles', routes.vehicles);
app.use('/api/bookings', routes.bookings);
app.use('/api/adventure-bookings', routes.adventureBookings);
app.use('/api/mpesa', routes.mpesa);
app.use('/api/admin', routes.admin);
app.use('/api/admin/auth', routes.adminAuth);
app.use('/api/system', routes.system);
app.use('/api/messages', routes.messages);
app.use('/api/admin/users', routes.adminUsers);
app.use('/api/adventures', routes.adventures);
app.use('/api/psv-bookings', routes.psvBookings);
app.use('/api/whatsapp', routes.whatsapp);

app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'ok', environment: 'vercel-serverless' });
});

// Options handling
app.options('*', (req, res) => {
    res.status(204).end();
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'API Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('API Error:', err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Export the Express app for Vercel
module.exports = app;
