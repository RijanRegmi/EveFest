# EveFest — Vercel Deployment Guide 🚀

This document details how to deploy **EveFest** (Next.js Frontend + Express TypeScript Backend + MongoDB + Cloudinary Storage) to **Vercel**.

---

## 🛠️ Prerequisites

1. A **[Vercel Account](https://vercel.com)**
2. A **[MongoDB Atlas Database](https://www.mongodb.com/cloud/atlas)**
3. A **[Cloudinary Account](https://cloudinary.com)** (Pre-configured for project `dkmbfnuch`).

---

## ⚡ Option 1: All-in-One Single Click Vercel Deployment (Recommended)

In this repository, an `api/index.ts` serverless wrapper, Cloudinary integration, and `vercel.json` are pre-configured. Vercel will automatically deploy the **Next.js Frontend** and the **Express Serverless Backend** as a unified project under a single domain.

### Step 1: Push Code to GitHub / GitLab / Bitbucket
Ensure all project files (including root `vercel.json`, `api/index.ts`, `frontend`, and `backend`) are committed and pushed to your repository.

### Step 2: Import into Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Select your `EveFest` repository.
3. Keep the **Root Directory** as `./` (Default).

### Step 3: Add Environment Variables in Vercel
In the Vercel project configuration, expand **Environment Variables** and add:

| Key | Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/evefest` | Your MongoDB connection string |
| `JWT_SECRET` | `your_super_secret_jwt_key_here` | Secret key for signing auth tokens |
| `CLOUDINARY_CLOUD_NAME` | `dkmbfnuch` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | `826757367917691` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `uu6KmtsVu9VGD9J_UtBVl598K0c` | Cloudinary API Secret |

### Step 4: Click Deploy! 🎉
Vercel will compile Next.js and the Express API serverless functions.
Once complete, your site will be live at `https://your-project-name.vercel.app`. All user-uploaded event banners and logos will automatically upload to Cloudinary CDN!

---

## 🌐 Option 2: Deploy Frontend on Vercel + Backend on Render/Railway

If you prefer hosting the Express backend separately (e.g. on Render or Railway):

### Step 1: Deploy Backend to Render / Railway
- Build command: `npm run build`
- Start command: `npm start` (runs `node dist/server.js`)
- Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Step 2: Deploy Frontend to Vercel
1. Import repository to Vercel.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-service.onrender.com/api`
4. Click **Deploy**.
