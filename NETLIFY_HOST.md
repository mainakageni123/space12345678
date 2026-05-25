# Deploy SpaceBorne to Netlify

Your repo is configured for **full-stack Netlify hosting**: Vite React frontend + serverless Express API + MongoDB Atlas.

**GitHub repo:** https://github.com/mainakageni123/space12345678

---

## Before you deploy (required)

### 1. MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Database Access** → create a user with password
3. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
4. **Connect** → **Drivers** → copy your connection string

Example:
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 2. JWT secret

Run locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Save the output — you will paste it into Netlify.

---

## Deploy on Netlify (GitHub — recommended)

### Step 1 — Import the site

1. Open [app.netlify.com](https://app.netlify.com/)
2. **Add new site** → **Import an existing project**
3. Choose **GitHub** → authorize → select **`mainakageni123/space12345678`**
4. Build settings (should auto-detect from `netlify.toml`):

| Setting | Value |
|---------|-------|
| Branch | `main` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |

5. Click **Deploy site** (first build may fail until env vars are set — that is normal)

### Step 2 — Environment variables

Go to **Site configuration** → **Environment variables** → **Add a variable**.

Add each variable below. For every variable, enable scopes: **Builds** and **Functions**.

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `MONGODB_URI` | Yes | Your Atlas connection string |
| `DB_NAME` | Yes | `car-hire` |
| `JWT_SECRET` | Yes | 32+ char random string from command above |
| `NODE_ENV` | Yes | `production` |

**Optional — M-Pesa payments**

| Variable | Notes |
|----------|-------|
| `MPESA_CONSUMER_KEY` | From [Daraja Portal](https://developer.safaricom.co.ke/) |
| `MPESA_CONSUMER_SECRET` | |
| `MPESA_PASSKEY` | |
| `MPESA_SHORTCODE` | `174379` for sandbox |
| `MPESA_CALLBACK_URL` | `https://YOUR-SITE.netlify.app/api/mpesa/callback` |
| `MPESA_ENV` | `sandbox` or `production` |

**Optional — WhatsApp (Twilio)**

| Variable |
|----------|
| `TWILIO_ACCOUNT_SID` |
| `TWILIO_AUTH_TOKEN` |
| `TWILIO_WHATSAPP_NUMBER` |
| `ADMIN_WHATSAPP_NUMBER` |

See `.env.netlify.template` for a full copy-paste template.

### Step 3 — Redeploy

1. **Deploys** → **Trigger deploy** → **Deploy site**
2. Wait until status is **Published**

### Step 4 — Verify

Replace `YOUR-SITE` with your Netlify URL (e.g. `space12345678.netlify.app`):

| Test | URL | Expected |
|------|-----|----------|
| Frontend | `https://YOUR-SITE.netlify.app` | Homepage loads |
| API health | `https://YOUR-SITE.netlify.app/api/health` | `{ "success": true, "status": "ok" }` |
| Database | `https://YOUR-SITE.netlify.app/api/test-db` | `{ "dbStatus": "connected" }` |

If `/api/test-db` fails:
- Check `MONGODB_URI` password and username
- Confirm Atlas **Network Access** allows `0.0.0.0/0`
- Confirm variables have **Functions** scope enabled
- Redeploy after fixing variables

### Step 5 — Update M-Pesa callback (if using payments)

After you know your live URL:

1. Set `MPESA_CALLBACK_URL` = `https://YOUR-SITE.netlify.app/api/mpesa/callback`
2. Trigger another deploy

---

## What Netlify runs automatically

From `netlify.toml`:

- **Build:** `npm run build` → static files in `dist/`
- **API:** `/api/*` → serverless function `netlify/functions/api.js`
- **SPA routing:** all other paths → `index.html` (React Router)
- **Node version:** 20 (`.nvmrc` + `NODE_VERSION` in config)

The frontend calls `/api` in production (no separate backend URL needed).

---

## Local production test (optional)

```bash
npm install
npm run build
npx netlify dev
```

Open http://localhost:8888 — uses your local `.env` / `backend/.env`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails | Run `npm run build` locally; fix any errors shown |
| Blank page after deploy | Check **Deploy log**; confirm `dist` is publish directory |
| API 404 | Confirm `netlify/functions/api.js` exists; redeploy |
| API 503 / DB error | Add/fix `MONGODB_URI`; allow `0.0.0.0/0` in Atlas |
| Function timeout | Cold start + DB; retry; consider Netlify Pro for longer timeout |
| CORS errors | Should not happen — API uses same origin `/api` |

---

## Custom domain (optional)

**Site configuration** → **Domain management** → **Add a domain** → follow DNS steps. SSL is automatic.

---

## Security reminder

Never commit `.env` files. All secrets live only in **Netlify Environment variables**.
