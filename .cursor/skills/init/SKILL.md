---
name: init
description: >-
  Produces a vivid, narrative onboarding overview of the SpaceBorne car-hire
  platform (Space Borne LTD). Use when the user invokes /init, asks to initialize
  project context, onboard a new developer, or wants a rich explanation of what
  this codebase is and how it fits together.
disable-model-invocation: true
---

# /init — Project vivid overview

When the user runs **/init**, give them a **living picture** of this project — not a dry file tree. Write like a knowledgeable teammate walking someone through the product on day one.

## Before you respond

1. Skim [project-reference.md](project-reference.md) for accurate facts (stack, paths, flows).
2. Optionally spot-check `src/Routes.jsx`, `backend/server.js`, and `package.json` if the repo has drifted.
3. Do **not** dump secrets from `.env` files.

## Output structure

Use these sections in order. Keep prose **vivid and concrete** (sensory verbs, user journeys, “what happens when…”).

### 1. One breath — what this is
2–3 sentences. Name **SpaceBorne / Space Borne LTD**: premium mobility in Kenya — luxury car hire, curated trips & tours, and PSV corporate transport. Mention it is a **full-stack web app** (React + Node API + MongoDB), deployed on **Netlify** with a serverless API.

### 2. Who walks through the door
- **Customers** browsing fleet, booking vehicles or adventures, paying (M-Pesa), contacting via WhatsApp/call.
- **Admins** in the command center managing fleet, trips, bookings, availability.

### 3. The three front doors (customer journeys)
Paint each journey in 2–4 sentences:

| Journey | Route | Feel |
|---------|-------|------|
| **Fleet** | `/fleet-discovery` | Scrollable vehicle galleries, tiered hire rates, detail modal → booking |
| **Trips & tours** | `/road-trip-adventures` | Safari-style adventures, seats, fixed trip pricing |
| **PSV** | `/psv-professional-services` | Corporate/group transport quotes and bookings |

Include **homepage** as the hub (`/` or `/homepage`) and **instant booking** (`/instant-booking-flow`).

### 4. Under the hood — architecture in plain language
- **Frontend**: Vite + React 18, React Router, Tailwind, lazy-loaded pages in `src/`.
- **API**: Express in `backend/` locally; **same routes** wrapped by `netlify/functions/api.js` in production.
- **Data**: MongoDB Atlas (`MONGODB_URI`, database `car-hire`).
- **Media**: Cloudinary for vehicle/adventure images (server-side upload middleware).
- **Payments**: M-Pesa (Daraja) routes under `/api/mpesa`.
- **Auth**: JWT for admin (`/admin-login` → `/admin-command-center`).

### 5. Map of the territory (key folders)
Short bullets only — path + one line purpose:

- `src/pages/` — customer UI by feature
- `src/pages/admin-command-center/` — admin dashboard, fleet & adventure CRUD
- `backend/routes/` — REST API
- `backend/models/` — Mongoose schemas
- `netlify/functions/api.js` — production API gateway
- `src/config/contact.js` — canonical support phone & WhatsApp URLs

### 6. Admin command center
What an admin can do: add/edit/delete **vehicles** (multi-image, pricing tiers), manage **adventures/trips**, view **bookings** (vehicle, adventure, PSV), toggle availability. Routes: `/admin-command-center`, `/admin-command-center/add-vehicle`, `/admin-command-center/edit-vehicle/:id`.

### 7. Running & deploying
- **Local dev**: `npm start` (frontend); backend from `backend/` with `.env` (often port **3001**).
- **Production**: GitHub → Netlify; build `dist`; env vars for MongoDB, JWT, Cloudinary, optional M-Pesa.
- **Support contact**: `+254724440293` — call & WhatsApp via `src/config/contact.js`.

### 8. Sharp edges (honest footnotes)
Brief list of things a new dev should know:
- Duplicate nested folder `car-hire-main123/car-hire-main/` may exist — **repo root** `src/` + `backend/` is canonical for deploy.
- Production frontend calls `/api` on same origin (no separate backend URL).
- Image uploads require valid Cloudinary env on Netlify **Functions** scope.

## Tone rules

- **Do**: use active voice, customer/admin scenarios, metaphors sparingly (“command center”, “showroom”, “departure board”).
- **Don’t**: paste raw directory trees, list every file, or exceed ~600 words unless the user asks for more.
- **Don’t**: invent features not in the repo; if unsure, say “verify in code” and point to a path.

## Optional closing

End with one line: *“Say what you want to build or fix next — fleet, trips, admin, payments, or deploy.”*

## Additional reference

Full factual cheat sheet: [project-reference.md](project-reference.md)
