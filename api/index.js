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
const {
    globalLimiter,
    authLimiter,
    paymentLimiter,
    bookingLimiter,
    adminLimiter,
    publicReadLimiter,
    webhookLimiter
} = require('../backend/middleware/rateLimit');

// Load environment variables (local only — Vercel injects them directly)
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

// ── Security guard: fail loudly if JWT_SECRET is missing ──────────────────────
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Admin authentication will be insecure.');
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI || '';
const DB_NAME = process.env.DB_NAME || 'car-hire';
mongoose.set('strictQuery', false);

// Initialize Express app
const app = express();

// Trust Vercel / reverse proxies so rate-limiters get true client IPs from X-Forwarded-For
app.set('trust proxy', 1);

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

// ── CORS — locked to your Vercel domain ─────────────────────────────────────
const allowedOrigins = [
    'https://space12345678.vercel.app',
    /^https:\/\/space12345678-[a-z0-9]+-spaceborne-s-projects\.vercel\.app$/, // preview deploys
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (Safaricom callbacks, curl, Postman)
        if (!origin) return callback(null, true);
        const allowed = allowedOrigins.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
        );
        if (allowed) return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-auth-token'],
    exposedHeaders: ['Authorization'],
    credentials: true
}));

// ── Body parsing — tight size limits to prevent DoS ──────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Logging — 'combined' never logs request bodies (no PII leakage) ──────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

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

// ── Rate Limiters ─────────────────────────────────────────────────────────────
app.use('/api', globalLimiter);                         // All routes: 200 req/15min
app.use('/api/admin/login', authLimiter);               // Login brute-force: 10 req/15min
app.use('/api/admin/auth', authLimiter);                // Auth verify: 10 req/15min
app.use('/api/mpesa/stkpush', paymentLimiter);          // STK push: 20 req/15min
app.use('/api/mpesa/pay-booking', paymentLimiter);      // Pay booking: 20 req/15min
app.use('/api/mpesa/callback', webhookLimiter);         // Safaricom callbacks: 500 req/15min
app.use('/api/bookings', bookingLimiter);               // Booking creation: 30 req/15min
app.use('/api/adventure-bookings', bookingLimiter);     // Adventure booking: 30 req/15min
app.use('/api/psv-bookings', bookingLimiter);           // PSV booking: 30 req/15min
app.use('/api/admin', adminLimiter);                    // Admin panel: 100 req/15min
app.use('/api/vehicles', publicReadLimiter);            // Vehicle listing: 300 req/15min
app.use('/api/adventures', publicReadLimiter);          // Adventure listing: 300 req/15min

// ── API Routes ────────────────────────────────────────────────────────────────
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

// Options preflight
app.options('*', cors());

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'API Route not found' });
});

// Global error handler — never leak stack traces to clients
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (err.message && err.message.startsWith('CORS:')) {
        return res.status(403).json({ success: false, message: 'Forbidden: cross-origin request blocked' });
    }
    console.error('API Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Export the Express app for Vercel
module.exports = app;
