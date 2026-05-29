# SpaceBorne — project reference (facts for /init)

## Product

- **Brand**: SpaceBorne / Space Borne LTD — premium mobility (Kenya).
- **GitHub**: `mainakageni123/space12345678`
- **Three offerings**:
  1. **Vehicle hire** — luxury/sedan/SUV fleet with hourly and daily pricing tiers.
  2. **Trips & tours** — road-trip adventures (e.g. safaris), per-trip pricing, seat capacity.
  3. **PSV professional services** — corporate/group transport, quote forms, PSV bookings.

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 18, Vite 7, React Router 6, Tailwind CSS |
| API | Express 4, Mongoose 8 |
| Hosting | Netlify (static `dist` + serverless function) |
| Database | MongoDB Atlas |
| Images | Cloudinary (`backend/config/cloudinary.js`, `backend/middleware/cloudinaryUpload.js`) |
| Payments | M-Pesa Daraja (`backend/routes/mpesa.js`) |
| Admin auth | JWT (`backend/middleware/auth.js`, `src/contexts/AdminAuthContext.jsx`) |

## Repository layout (canonical root)

```
car-hire-main123/          ← workspace root
├── src/                   ← React frontend
├── backend/               ← Express API (local + Netlify function source)
├── netlify/functions/api.js
├── netlify.toml
├── package.json           ← Vite build scripts
└── .cursor/skills/init/   ← this skill
```

Nested `car-hire-main123/car-hire-main/` may duplicate older copies — prefer root `src/` and `backend/` for changes.

## Customer routes (`src/Routes.jsx`)

| Path | Page |
|------|------|
| `/`, `/homepage` | Homepage |
| `/fleet-discovery` | Vehicle catalog |
| `/road-trip-adventures` | Trips & tours |
| `/psv-professional-services` | PSV services |
| `/instant-booking-flow` | Booking wizard |
| `/booking-confirmation` | Post-booking confirmation |
| `/booking-success` | Payment success |
| `/mpesa-pay` | M-Pesa payment helper |
| `/customer-registration` | Customer signup |

## Admin routes

| Path | Purpose |
|------|---------|
| `/admin-login` | Admin sign-in |
| `/admin-command-center` | Dashboard (tabs: overview, bookings, fleet, adventures, system, admin users) |
| `/admin-command-center/add-vehicle` | Add vehicle + images |
| `/admin-command-center/edit-vehicle/:id` | Edit vehicle, images, pricing |

Adventure CRUD is inline in `AdventureManagement.jsx` (no separate edit route).

## API routes (mounted in `backend/server.js`)

- `/api/vehicles` — fleet CRUD, images
- `/api/adventures` — trips CRUD
- `/api/bookings` — vehicle bookings
- `/api/adventure-bookings` — trip bookings (server locks adventure price from DB)
- `/api/psv-bookings` — PSV bookings
- `/api/mpesa` — payments
- `/api/admin-auth`, `/api/admin` — admin
- `/api/health`, `/api/test-db` — health checks

## Key frontend modules

- `src/contexts/VehicleContext.jsx` — fleet state for customer + admin
- `src/utils/mapVehicle.js` — normalizes vehicle images for cards/modals
- `src/utils/adventurePricing.js` — adventure price display/booking consistency
- `src/components/VehicleImageCarousel.jsx` — multi-image cards
- `src/pages/fleet-discovery/components/VehicleDetailModal.jsx` — hire tiers, mobile scroll
- `src/config/api.js` — `API_BASE_URL` (`/api` in production)

## Contact (single source of truth)

`src/config/contact.js`:

- Phone: **+254724440293**
- WhatsApp: `https://wa.me/254724440293`
- UI copy: “Text us on WhatsApp” where applicable

## Environment variables (typical)

**Netlify / backend**

- `MONGODB_URI`, `DB_NAME` (e.g. `car-hire`)
- `JWT_SECRET`, `NODE_ENV=production`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Optional: `MPESA_*`, Twilio `TWILIO_*` for WhatsApp notifications

## Local development

```bash
# Frontend (from repo root)
npm install && npm start

# Backend (from backend/)
cd backend && npm install && npm start
# Default PORT 3001; .env with MONGODB_URI + Cloudinary + JWT
```

## Deploy

- Push to `main` → Netlify builds `npm run build` → publishes `dist`
- API: `netlify/functions/api.js` proxies to Express routes
- Redeploy after env var changes

## Recent UX patterns (conversation context)

- Book Now on cards opens **detail modal** first (packages/rates), then Book Now in modal goes to booking flow.
- Fleet/adventure cards support **image carousels**.
- Adventure booking price locked server-side from DB `adventure.price`.
- Trips hero: “Your Next Adventure Starts Here” / “Trips across Kenya, crafted for you.”
