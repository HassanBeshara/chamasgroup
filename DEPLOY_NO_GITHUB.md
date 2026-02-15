# Deploy Without GitHub — Free Hosting + Database

You can deploy your Mhmd Chamas ecommerce app **without GitHub**. Here are the best free options:

---

## Option 1: Railway CLI (No Git at All — Deploy from Your PC)

Deploy directly from your folder. **No GitHub, no GitLab, no push** — just run a command.

### Steps

1. **Install Railway CLI**
   ```powershell
   npm install -g @railway/cli
   ```

2. **Login** (opens browser)
   ```powershell
   railway login
   ```

3. **Deploy**
   ```powershell
   cd c:\Users\HP\Desktop\Mhmd_chamas_ecommerce
   railway init
   railway up
   ```

4. **Get your URL** — e.g. `https://your-app.up.railway.app`

**Database:** SQLite works. Free trial: **$5 credits** (no card needed). After trial, small monthly cost.

---

## Option 2: Glitch (Free — Use GitLab Instead of GitHub)

**Glitch** supports Node + Express + SQLite. Use **GitLab** (free) instead of GitHub.

### Steps

1. **Create GitLab repo** (free, no GitHub)
   - Go to [gitlab.com](https://gitlab.com) and sign up
   - Click **New project** → **Create blank project**
   - Name it `mhmd-chamas`, set visibility to **Private** or **Public**

2. **Push your code to GitLab**
   ```powershell
   cd c:\Users\HP\Desktop\Mhmd_chamas_ecommerce
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://gitlab.com/YOUR_USERNAME/mhmd-chamas.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitLab username)

3. **Import to Glitch**
   - Go to [glitch.com](https://glitch.com) and sign up (free)
   - Click **New Project** → **Import from GitHub**
   - In the import dialog, choose **Clone from repo** and paste your GitLab URL:
     ```
     https://gitlab.com/YOUR_USERNAME/mhmd-chamas.git
     ```
   - Glitch will clone your project

4. **Your app is live**
   - You get a URL like `https://your-project.glitch.me`

**Database:** Glitch keeps SQLite in `.data/` — it persists. Your `data.db` will work.

---

## Option 3: Render + GitLab (Free Git, Not GitHub)

If you're okay using **GitLab** instead of GitHub (both free):

1. Create account at [gitlab.com](https://gitlab.com)
2. Create a new project
3. Push your code:
   ```powershell
   cd c:\Users\HP\Desktop\Mhmd_chamas_ecommerce
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://gitlab.com/YOUR_USERNAME/mhmd-chamas.git
   git push -u origin main
   ```
4. Go to [render.com](https://render.com) → **New** → **Web Service**
5. Connect **GitLab** (not GitHub)
6. Select your repo
7. Build: `npm install` | Start: `npm start`
8. Deploy — free tier available

---

## Option 4: Koyeb (CLI Deploy — No GitHub)

1. Install Koyeb CLI: [koyeb.com/docs](https://www.koyeb.com/docs/build-and-deploy/cli/install)
2. Login: `koyeb auth login`
3. Deploy: `koyeb app init` then deploy your directory

---

## Summary

| Option   | No GitHub? | No Git at all? | Free?      | Database        |
|----------|------------|----------------|------------|-----------------|
| **Railway CLI** | Yes | Yes (deploy from PC) | $5 trial   | SQLite          |
| **Glitch** | Yes (use GitLab) | No (needs GitLab) | Yes        | SQLite (persists) |
| **Render + GitLab** | Yes (use GitLab) | No | Yes | SQLite (ephemeral) |
| **Koyeb** | Yes        | Yes (CLI)      | Free tier  | Depends on setup |

**No Git at all:** Use **Railway CLI** — run `railway up` from your folder.  
**Free + DB:** Use **Glitch** or **Render** with **GitLab** (free, not GitHub).
