# 🚀 Deployment Guide

This guide provides step-by-step instructions for deploying the PlugNG E-Commerce application.

## 🏗️ Architecture Overview

- **Frontend**: Next.js (App Router) deployed on **Vercel**.
- **Backend**: Express.js (Node.js) deployed on **Render** (as a Docker Service).
- **Database**: MongoDB Atlas (Free Tier).
- **Caching**: Upstash Redis (Free Tier).
- **Storage**: Cloudflare R2 (Free Tier).
- **Payments**: Paystack.

---

## 📦 Backend Deployment (Render)

We use **Docker** for the backend to ensure environment consistency.

### Steps:
1.  **Create a New Web Service** on Render.
2.  **Connect your GitHub Repository**.
3.  **Service Type**: Select `Docker`.
4.  **Root Directory**: (Leave this **EMPTY** / Repo Root)
5.  **Dockerfile Path**: `backend/Dockerfile`
6.  **Docker Build Context**: `backend` 👈 **(This is the key to fixing the path error)**
7.  **Auto-Deploy**: `Yes` (recommended).
7.  **Environment Variables**: Add all variables from `backend/.env.example`.
    - `PORT`: 10000 (Render's default)
    - `NODE_ENV`: production
    - `MONGODB_URI`: (Your Atlas string)
    - `REDIS_URL`: (Your Upstash string)
    - `JWT_ACCESS_SECRET`: (Generate a long random string)
    - `JWT_REFRESH_SECRET`: (Generate another long random string)
    - ... (Paystack, R2, etc.)
6.  **CORS Setup**: Set `FRONTEND_URL` to your Vercel URL (e.g., `https://plugng.vercel.app`).

### Health Check:
The backend provides a health check endpoint at `/health`.

---

## 🎨 Frontend Deployment (Vercel)

Vercel is optimized for Next.js and is the recommended platform.

### Steps:
1.  **Import Project** into Vercel.
2.  **Framework Preset**: Next.js.
3.  **Root Directory**: `frontend`.
4.  **Install Command**: `pnpm install`
5.  **Build Command**: `pnpm run build` 👈 **(CRITICAL: Ensure this is NOT set to 'pnpm install')**
6.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: `https://your-backend-url.onrender.com/api/v1`
7.  **Build Settings**: The project is configured for `output: standalone` in `next.config.ts`, which Vercel handles natively.

---

## 🛠️ Infrastructure Setup

### 1. MongoDB Atlas
- Create a Cluster (M0 Free Tier).
- Database Access: Add a user with `Read and Write` permissions.
- Network Access: Allow access from `0.0.0.0/0` (required for Render/Vercel).

### 2. Upstash Redis
- Create a Global Data Store.
- Copy the `REDIS_URL` (starts with `rediss://`).

### 3. Cloudflare R2
- Create a Bucket named `plugng-products`.
- Set the bucket to **Public** to allow external images accessing.
- Generate `Access Key ID` and `Secret Access Key` with `Edit` permissions.

### 4. Paystack
- Set the Webhook URL in your Paystack dashboard to: `https://your-backend-url.onrender.com/api/v1/webhooks/paystack`.

---

## 💡 Pro-Tips for Free Tiers
- **Wake Up Server**: Render's free tier spins down after 15 min of inactivity. Use [Uptime Robot](https://uptimerobot.com/) to ping `https://your-backend.onrender.com/health` every 10-14 minutes to keep it awake.
- **Environment Parity**: Always use `.env.example` as a template when adding new features that require secrets.
