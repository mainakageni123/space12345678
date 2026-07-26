/**
 * rateLimit.js — Tiered rate limiting middleware for SpaceBorne Car Hire API
 *
 * Tiers:
 *  - globalLimiter      : All /api routes              → 200 req / 15 min
 *  - authLimiter        : Login / auth endpoints        → 10  req / 15 min  (brute-force protection)
 *  - paymentLimiter     : M-Pesa / payment endpoints    → 20  req / 15 min
 *  - bookingLimiter     : Booking creation endpoints    → 30  req / 15 min
 *  - adminLimiter       : Admin panel endpoints         → 100 req / 15 min
 *  - publicReadLimiter  : Read-only public endpoints    → 300 req / 15 min
 *  - webhookLimiter     : Webhook endpoints (Safaricom) → 500 req / 15 min (allow M-Pesa callbacks)
 */

const rateLimit = require('express-rate-limit');

// Helper: builds a standardised rate-limit response
const makeHandler = (label) => (req, res) => {
    console.warn(`[RateLimit] ${label} — ${req.ip} blocked on ${req.method} ${req.originalUrl}`);
    res.status(429).json({
        success: false,
        message: 'Too many requests. Please slow down and try again shortly.',
        retryAfter: res.getHeader('Retry-After') || '15 minutes'
    });
};

// ─── 1. Global fallback (all /api/* routes) ───────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,   // Return RateLimit-* headers (RFC 6585)
    legacyHeaders: false,
    handler: makeHandler('GLOBAL'),
    skip: (req) => req.path === '/health' // never block health checks
});

// ─── 2. Auth limiter (login / token endpoints) ───────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // only 10 login attempts per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: makeHandler('AUTH'),
    message: {
        success: false,
        message: 'Too many login attempts. Please wait 15 minutes before trying again.'
    }
});

// ─── 3. Payment limiter (M-Pesa STK push & payment initiation) ───────────────
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: makeHandler('PAYMENT'),
    message: {
        success: false,
        message: 'Too many payment requests. Please wait before initiating another payment.'
    }
});

// ─── 4. Booking limiter (booking creation) ───────────────────────────────────
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: makeHandler('BOOKING'),
    message: {
        success: false,
        message: 'Too many booking requests. Please wait before submitting another booking.'
    }
});

// ─── 5. Admin limiter (admin dashboard API) ──────────────────────────────────
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: makeHandler('ADMIN')
});

// ─── 6. Public read limiter (vehicles, adventures listing) ───────────────────
const publicReadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: makeHandler('PUBLIC_READ')
});

// ─── 7. Webhook limiter (M-Pesa callbacks from Safaricom servers) ─────────────
// High ceiling — Safaricom's servers may send many concurrent callbacks
const webhookLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    handler: makeHandler('WEBHOOK')
});

module.exports = {
    globalLimiter,
    authLimiter,
    paymentLimiter,
    bookingLimiter,
    adminLimiter,
    publicReadLimiter,
    webhookLimiter
};
