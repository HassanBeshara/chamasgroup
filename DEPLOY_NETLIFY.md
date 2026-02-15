# Deploy Mhmd Chamas to Netlify with Free Database

Netlify doesn't run Node servers or SQLite. Two options:

---

## Option A: Easiest — Render (Full Stack, No Code Change)

Deploy your **entire app** (Express + SQLite) to Render. One service, no changes.

### Steps

1. Push your code to GitHub (see Step 4 below)
2. Go to [render.com](https://render.com) → Sign up (free)
3. **New** → **Web Service**
4. Connect your GitHub repo
5. Settings:
   - **Name:** `mhmd-chamas`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
6. Click **Create Web Service**
7. Wait for deploy. You'll get a URL like `https://mhmd-chamas.onrender.com`

**Done.** Your site is live.

⚠️ **Note:** Render's free tier has ephemeral storage. SQLite data resets when the app restarts or redeploys. For persistent data, use Option C (Supabase) or add Render PostgreSQL.

---

## Option B: Netlify (Frontend) + Render (API)

Frontend on Netlify, backend on Render. Slightly more setup.

### 1. Deploy backend to Render

Follow Option A steps 1–7 above. Note your Render URL.

### 2. Point frontend to Render API

Edit `config.js` in your project:

```js
window.API_BASE = 'https://YOUR-APP.onrender.com';
```

Replace `YOUR-APP` with your actual Render service name.

### 3. Deploy frontend to Netlify

1. Push to GitHub (with updated config.js)
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
3. Select your repo
4. **Build command:** leave empty
5. **Publish directory:** `.`
6. **Deploy**

Your Netlify site will call the Render API. CORS is already enabled on the server.

---

## Option C: Netlify + Supabase (PostgreSQL)

Use Supabase instead of SQLite. Requires code changes.

---

## Step 1: Create Supabase Project (Free)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project**
3. Name it (e.g. `mhmd-chamas`)
4. Set a database password (save it!)
5. Choose a region close to you
6. Click **Create project** (wait ~2 min)

---

## Step 2: Create Tables in Supabase

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Paste and run this SQL:

```sql
-- Categories
CREATE TABLE IF NOT EXISTS categories (
  name TEXT PRIMARY KEY
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT DEFAULT '',
  emoji TEXT DEFAULT '📦',
  image_url TEXT,
  FOREIGN KEY (category) REFERENCES categories(name)
);

-- Enable RLS but allow all for now (you can tighten later)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Seed default categories
INSERT INTO categories (name) VALUES 
  ('electronics'), ('clothing'), ('accessories'), ('home')
ON CONFLICT (name) DO NOTHING;

-- Seed default products (optional)
INSERT INTO products (name, category, price, description, emoji) VALUES
  ('Wireless Headphones', 'electronics', 99.99, 'Premium wireless headphones with noise cancellation.', '🎧'),
  ('Smart Watch', 'electronics', 249.99, 'Feature-rich smartwatch with fitness tracking.', '⌚'),
  ('Cotton T-Shirt', 'clothing', 29.99, 'Comfortable 100% cotton t-shirt.', '👕'),
  ('Denim Jacket', 'clothing', 79.99, 'Classic denim jacket with modern fit.', '🧥'),
  ('Leather Wallet', 'accessories', 49.99, 'Genuine leather wallet with RFID blocking.', '👛'),
  ('Sunglasses', 'accessories', 89.99, 'UV protection polarized lenses.', '🕶️'),
  ('Coffee Maker', 'home', 129.99, 'Programmable coffee maker.', '☕'),
  ('Throw Pillow Set', 'home', 39.99, 'Set of 4 decorative throw pillows.', '🛋️')
ON CONFLICT DO NOTHING;
```

4. Click **Run**

---

## Step 3: Get Supabase Keys

1. In Supabase: **Project Settings** (gear icon) → **API**
2. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

---

## Step 4: Push to GitHub

1. Create a repo on [github.com](https://github.com)
2. In your project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 5: Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) and sign in (use GitHub)
2. Click **Add new site** → **Import an existing project**
3. Connect GitHub and select your repo
4. Build settings:
   - **Build command:** leave empty (static site)
   - **Publish directory:** `.` (root)
5. Click **Add environment variables**:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click **Deploy site**

---

## Step 6: Update Your Code for Supabase

You need to switch from the Express API to Supabase. Two options:

### Option A: Use the Supabase adapter (recommended)

I can create a `supabase-api.js` that mirrors your current API using Supabase client. Your `script.js` would use it when `VITE_SUPABASE_URL` is set.

### Option B: Deploy backend elsewhere

- Deploy the Express + SQLite app to **Render** or **Railway** (both have free tiers)
- Deploy only the frontend to Netlify
- Set `API_BASE` in script.js to your Render/Railway URL

---

## Quick Option: Render (keeps your current code)

If you want to keep SQLite and not change code:

1. Push to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect repo, set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Render gives you a URL like `https://your-app.onrender.com`
5. Deploy frontend to Netlify, set `API_BASE` to that URL in your build

---

## Summary

| Option | Database | Effort | Free? |
|--------|----------|--------|-------|
| **Netlify + Supabase** | PostgreSQL | Medium (code changes) | Yes |
| **Render (full stack)** | SQLite | Low (no code change) | Yes |
| **Netlify + Render API** | SQLite | Low | Yes |

**Easiest:** Deploy the whole app (Express + SQLite) to **Render** — no code changes, free tier available.

**Best long-term:** Netlify (frontend) + Supabase (database) — more scalable, need to adapt the API layer.
