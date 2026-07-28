# EveFest — Vercel Deployment Guide 🚀

This document details how to deploy **EveFest** (Next.js Frontend + Express TypeScript Backend + MongoDB) to **Vercel**.

---

## 🛠️ Prerequisites

1. A **[Vercel Account](https://vercel.com)**
2. A **[MongoDB Atlas Database](https://www.mongodb.com/cloud/atlas)** (Free tier works great!)
   - Create a MongoDB cluster.
   - Obtain your MongoDB Connection String (`mongodb+srv://<username>:<password>@cluster.mongodb.net/evefest`).

---

## ⚡ Option 1: All-in-One Single Click Vercel Deployment (Recommended)

In this repository, an `api/index.ts` serverless wrapper and `vercel.json` are pre-configured. Vercel will automatically deploy the **Next.js Frontend** and the **Express Serverless Backend** as a unified project under a single domain.

### Step 1: Push Code to GitHub / GitLab / Bitbucket
Ensure all project files (including root `vercel.json`, `api/index.ts`, `frontend`, and `backend`) are committed and pushed to your repository.

### Step 2: Import into Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Select your `EveFest` repository.
3. Keep the **Root Directory** as `./` (Default).

### Step 3: Add Environment Variables in Vercel
In the Vercel project configuration, expand **Environment Variables** and add:

| Key | Example Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/evefest` | Your MongoDB connection string |
| `JWT_SECRET` | `your_super_secret_jwt_key_here` | Secret key for signing auth tokens |

### Step 4: Click Deploy! 🎉
Vercel will compile Next.js and the Express API serverless functions.
Once complete, your site will be live at `https://your-project-name.vercel.app`.

---

## 🌐 Option 2: Deploy Frontend on Vercel + Backend on Render/Railway

If you prefer hosting the Express backend separately (e.g. on Render or Railway):

### Step 1: Deploy Backend to Render / Railway
- Build command: `npm run build`
- Start command: `npm start` (runs `node dist/server.js`)
- Set environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT=5000`.

### Step 2: Deploy Frontend to Vercel
1. Import repository to Vercel.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-service.onrender.com/api`
4. Click **Deploy**.

---

## 🔍 Verification & Troubleshooting

- **Database Connection**: Ensure `0.0.0.0/0` is added to your MongoDB Atlas Network Access IP Access List so Vercel serverless functions can connect.
- **Admin Login**: Initial database seeding automatically creates an admin account:
  - **Email**: `admin.host@university.edu`
  - **Password**: `password123`
- **Offline / Local Fallback**: If MongoDB connection is unavailable, EveFest automatically falls back to offline localStorage mode gracefully.
