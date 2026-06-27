# Chaki Munshi — Atta Chaki Management System

Aata chakki / flour mill ke liye complete management system.

- **Frontend:** React 19 + Vite + Tailwind CSS
- **Backend:** Express (Node.js) REST API
- **Database:** Turso (libSQL) — SQLite-compatible **cloud database**

Features: Dashboard, Customers (with history), Wheat Entries, Atta (flour) Issues,
Expenses, Daily/Monthly/Yearly Reports, QR-code Invoices, multi-language & themes.

---

## 1. Local Setup

```bash
npm install
```

Create a `.env` file in the project root (copy from `env.example`):

```
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
PORT=5000
```

Run the API server + frontend together:

```bash
npm run dev:all
```

- Frontend (Vite): http://localhost:5173
- API server: http://localhost:5000 (proxied at `/api`)

> Optional: `npm run seed` sample data daal deta hai. Production by default **empty** DB use karta hai.

---

## 2. Cloud Database — Turso (libSQL)

1. https://turso.tech par account banayein (GitHub se sign-up).
2. Ek database create karein (free tier).
3. Database ke **Connect** section se ye copy karein:
   - **Database URL** → `TURSO_DATABASE_URL`
   - **Auth Token** (generate) → `TURSO_AUTH_TOKEN`
4. App startup par tables khud-ba-khud ban jaati hain (schema auto-init). Koi manual SQL nahi.

---

## 3. Deploy to Render (live link)

1. Code ko ek GitHub repo par push karein.
2. https://render.com par sign-up karein (GitHub se).
3. **New → Web Service** → apna repo select karein. Render `render.yaml` detect kar lega, warna:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. **Environment** tab mein 2 secrets add karein:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
5. **Create Web Service** → build complete hone ke baad Render aapko live link dega:
   `https://chaki-munshi.onrender.com`

Yahi link aapka **fully working deployed project** hai (frontend + API + cloud DB, sab ek hi service par).

---

## Production build (verify locally)

```bash
npm run build   # dist/ banata hai
npm start       # Express server dist/ serve karta hai + API
# open http://localhost:5000
```
