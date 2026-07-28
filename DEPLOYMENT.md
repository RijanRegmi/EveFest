# EveFest — Deployment Guide 🚀

This document provides clear instructions for deploying **EveFest** (Next.js Frontend + Express TypeScript Backend + MongoDB Atlas + Cloudinary Storage).

---

## 🏗️ Project Architecture

```
EveFest/
├── frontend/    → Next.js 16 Web Application (Deploy on Vercel)
└── backend/     → Express TypeScript REST API (Deploy on Render / Railway / Vercel)
```

---

## ⚡ Step-by-Step Vercel Deployment Guide

### Step 1: Push Code to GitHub
Ensure your latest code is pushed to your GitHub repository (`RijanRegmi/EveFest`).

### Step 2: Configure Vercel Root Directory
1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Select your **`eve-fest`** project.
3. Click **Settings** → **General**.
4. Find **Root Directory**:
   - Click **Edit**.
   - Change `./` to **`frontend`**.
   - Click **Save**.

### Step 3: Configure Environment Variables in Vercel
Go to **Settings** → **Environment Variables** in Vercel and add:

| Key | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api-url.onrender.com/api` | URL of your deployed Express API |

### Step 4: Redeploy on Vercel
Go to **Deployments** tab → Click **Redeploy**.  
Your website `https://eve-fest.vercel.app` will now load your Next.js homepage!

---

## 🖥️ Deploying the Backend (Render / Railway / Vercel)

### Deploying Backend to Render (Free)
1. Go to **[Render.com](https://render.com)** → **New Web Service**.
2. Connect your `RijanRegmi/EveFest` GitHub repository.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://...`
   - `JWT_SECRET`: `your_jwt_secret`
   - `CLOUDINARY_CLOUD_NAME`: `dkmbfnuch`
   - `CLOUDINARY_API_KEY`: `826757367917691`
   - `CLOUDINARY_API_SECRET`: `uu6KmtsVu9VGD9J_UtBVl598K0c`
5. Copy your deployed Render URL (e.g. `https://evefest-api.onrender.com`) and paste it as `NEXT_PUBLIC_API_URL` in your Vercel frontend settings!
