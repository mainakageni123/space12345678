// Primary backend server implementation follows

// Load environment variables and modules
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Load env
dotenv.config();

// MongoDB Connection (read from environment for security)
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';
const DB_NAME = process.env.DB_NAME || 'car-hire';
mongoose.set('strictQuery', false);

// Port (allow override via env, default to 3001)
const PORT = process.env.PORT || 3001;

// Initialize Express app
const app = express();

// Security middleware with relaxed settings for development
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
// Express Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // increased limit for development
    handler: (req, res) => {
        res.status(429).json({ success: false, message: 'Too many requests from this IP, please try again later.' });
    }
});
app.use('/api/', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression middleware
app.use(compression());

// Configure CORS middleware - more permissive for development
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

// Request logging middleware
// Request logging and traffic tracking middleware
global.trafficStats = {
    totalRequests: 0,
    startTime: Date.now(),
    requestsPerMinute: 0,
    recentRequests: [] // Store timestamps of last 1000 requests to calc RPM
};

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Traffic tracking
    global.trafficStats.totalRequests++;
    const now = Date.now();
    global.trafficStats.recentRequests.push(now);
    
    // Clean up old requests (> 1 min ago)
    const oneMinuteAgo = now - 60000;
    global.trafficStats.recentRequests = global.trafficStats.recentRequests.filter(time => time > oneMinuteAgo);
    global.trafficStats.requestsPerMinute = global.trafficStats.recentRequests.length;
    
    next();
});

// Static file serving
app.use('/images', express.static(path.join(__dirname, 'uploads')));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { requireDb, isDbConnected } = require('./middleware/requireDb');

// Health check (no DB required — reports connection status)
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        db: isDbConnected() ? 'connected' : 'disconnected'
    });
});

// Block API routes when MongoDB is not connected
app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next();
    requireDb(req, res, next);
});

// Import and configure routes
const routes = {
    vehicles: require('./routes/vehicles'),
    bookings: require('./routes/bookings'),
    adventureBookings: require('./routes/adventure-bookings'),
    adminAuth: require('./routes/admin-auth'),
    admin: require('./routes/admin'),
    system: require('./routes/system'),
    messages: require('./routes/messages'),
    adminUsers: require('./routes/admin-users'),
    adventures: require('./routes/adventures'),
    psvBookings: require('./routes/psv-bookings'),
    mpesa: require('./routes/mpesa'),
    whatsapp: require('./routes/whatsapp-webhook')
};

// Register vehicle image route separately for direct access
app.get('/images/vehicles/:id', async (req, res) => {
    try {
        const Vehicle = require('./models/Vehicle');
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle || !vehicle.image) return res.status(404).send('Image not found');
        // Redirect to the Cloudinary URL
        res.redirect(vehicle.image);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).send('Error loading image');
    }
});

// Register API routes
app.use('/api/vehicles', routes.vehicles);
app.use('/api/bookings', routes.bookings);
app.use('/api/adventure-bookings', routes.adventureBookings);
app.use('/api/admin', routes.admin);
app.use('/api/admin/auth', routes.adminAuth);
app.use('/api/system', routes.system);
app.use('/api/messages', routes.messages);
app.use('/api/admin/users', routes.adminUsers);
app.use('/api/adventures', routes.adventures);
app.use('/api/psv-bookings', routes.psvBookings);
app.use('/api/mpesa', routes.mpesa);
app.use('/api/whatsapp', routes.whatsapp);

// Log registered routes
console.log('Available API routes:', [
    '/api/vehicles',
    '/api/bookings',
    '/api/adventure-bookings',
    '/api/psv-bookings',
    '/api/mpesa',
    '/api/whatsapp',
    '/api/system',
    '/api/messages',
    '/api/admin/users',
    '/api/adventures'
].join(', '));

// API request logging and CORS preflight (throttled verify logging)
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
        res.header('Access-Control-Max-Age', '86400'); // 24 hours
        return res.status(204).end();
    }
    next();
});

// Test database connection and data
app.get('/api/test-db', async (req, res) => {
    try {
        const Vehicle = require('./models/Vehicle');
        const Adventure = require('./models/Adventure');
        const Admin = require('./models/Admin');

        const results = {
            vehicles: await Vehicle.find().limit(1),
            adventures: await Adventure.find().limit(1),
            admins: await Admin.find().select('-password').limit(1),
            dbStatus: 'connected'
        };

        res.json({
            success: true,
            dbStatus: 'connected',
            collectionsStatus: {
                vehicles: results.vehicles.length > 0 ? 'has data' : 'empty',
                adventures: results.adventures.length > 0 ? 'has data' : 'empty',
                admins: results.admins.length > 0 ? 'has data' : 'empty'
            },
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, dbStatus: 'error', error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    console.log('404 hit for:', req.method, req.url);
    res.status(404).json({ message: 'Route not found' });
});

// Ensure all error responses are JSON
app.use((err, req, res, next) => {
    console.error('Error:', err.message, err.stack);
    const isCloudinary = /cloudinary|signature|api_secret/i.test(String(err.message || ''));
    const status = isCloudinary ? 500 : (err.status && err.status !== 401 ? err.status : err.http_code && err.http_code !== 401 ? err.http_code : 500);
    res.status(status).json({
        success: false,
        message: isCloudinary
            ? (err.message?.includes('api_secret') || err.message?.includes('Signature')
                ? 'Image upload failed: check CLOUDINARY_API_SECRET in backend/.env matches your Cloudinary dashboard.'
                : `Image upload failed: ${err.message}`)
            : (err.message || 'Something went wrong!')
    });
});

// Database connection and startup helper
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!MONGODB_URI) {
            console.warn('No MongoDB URI provided. Starting server without DB connection (development).');
            const server = app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
            return;
        }

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
        console.log('✅ MongoDB Connected Successfully');

        // Start server after successful DB connection
        const server = app.listen(PORT, '0.0.0.0', () => {
            const interfaces = require('os').networkInterfaces();
            console.log(`\n🚀 Server is running on port ${PORT}`);
            console.log('\n📡 Access the backend using any of these URLs:');
            Object.keys(interfaces).forEach((iface) => {
                interfaces[iface].forEach((details) => {
                    if (details.family === 'IPv4' && !details.internal) {
                        console.log(`   http://${details.address}:${PORT}`);
                        try {
                            require('fs').writeFileSync(require('path').join(__dirname, 'server-ip.txt'), details.address);
                        } catch (e) {
                            console.warn('Could not write server-ip.txt:', e && e.message ? e.message : e);
                        }
                    }
                });
            });
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use`);
                process.exit(1);
            } else {
                console.error('Server error:', err);
                process.exit(1);
            }
        });

        // Graceful shutdown
        const shutdown = async (signal) => {
            console.info(`${signal} signal received. Closing server...`);
            try {
                await server.close();
                if (mongoose && mongoose.connection && mongoose.connection.readyState === 1) {
                    await mongoose.connection.close();
                    console.log('MongoDB connection closed.');
                }
                process.exit(0);
            } catch (err) {
                console.error('Error during shutdown:', err);
                process.exit(1);
            }
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (err) {
        console.error('MongoDB Connection Error:', err.message || err);
        console.error('\nCannot start API — MongoDB is unreachable.');
        console.error('Fix MongoDB Atlas Network Access (IP whitelist) and restart: npm run dev:backend\n');
        process.exit(1);
    }
};

// Start the application
console.log('Starting server...');
connectDB();
