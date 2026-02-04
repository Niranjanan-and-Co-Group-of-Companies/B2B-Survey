# Deployment Guide: B2B Survey Platform

This guide will walk you through deploying your application so it's accessible on the internet.

**Prerequisites:**
- GitHub account (where your code is pushed)
- Accounts on [Render.com](https://render.com) (for Backend) and [Vercel.com](https://vercel.com) (for Frontend) - both have free tiers.

---

## Phase 1: Prepare Your Code (Do this locally first)

Before deploying, we need to stop using "localhost" and use environment variables.

1.  **Frontend URL Updates**:
    - In your code (local VS Code), search for `http://localhost:5001` and `http://localhost:3000`.
    - Ensure they are using `process.env.NEXT_PUBLIC_API_URL` instead of hardcoded strings.
    - *Note: You already have this logic in `api.ts` and some files, but double-check `server-supabase.js` for any CORS "localhost" settings.*

2.  **Push Changes**:
    - If you make any changes, run:
      ```bash
      git add .
      git commit -m "Prepare for deployment"
      git push origin main
      ```

---

## Phase 2: Deploy Backend (Render)

We host the backend first because the frontend needs the backend's URL.

1.  **Create Service**:
    - Log in to [Render Dashboard](https://dashboard.render.com).
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository (`B2B-Survey`).
    - Select the repository.

2.  **Configure Service**:
    - **Name**: `b2b-survey-backend` (or similar)
    - **Root Directory**: `backend` (Important! Your server code is in this subfolder)
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server-supabase.js`
    - **Plan**: Free

3.  **Environment Variables** (Scroll down to "Environment Variables" section):
    Add the following keys from your `.env` file:
    - `SUPABASE_URL`: (Your Supabase URL)
    - `SUPABASE_ANON_KEY`: (Your Supabase Key)
    - `SUPABASE_SERVICE_ROLE_KEY`: (Your Service Role Key - if used)
    - `PORT`: `10000` (Render expects this or looks for process.env.PORT)

4.  **Deploy**:
    - Click **Create Web Service**.
    - Wait for the logs to say "Server running...".
    - **Copy the URL** provided by Render (e.g., `https://b2b-survey-backend.onrender.com`).

---

## Phase 3: Deploy Frontend (Vercel)

1.  **Create Project**:
    - Log in to [Vercel Dashboard](https://vercel.com/dashboard).
    - Click **Add New...** -> **Project**.
    - Import your `B2B-Survey` repository.

2.  **Configure Project**:
    - **Project Name**: `b2b-survey-web`
    - **Framework Preset**: Next.js (Should auto-detect)
    - **Root Directory**: Click "Edit" and select `web` (Important!).

3.  **Environment Variables**:
    - Click **Environment Variables**.
    - Add `NEXT_PUBLIC_API_URL`.
    - **Value**: The Backend URL you copied from Phase 2 (e.g., `https://b2b-survey-backend.onrender.com`).
      *(Note: Do not add a trailing slash `/` at the end unless your code expects it)*

4.  **Deploy**:
    - Click **Deploy**.
    - Vercel will build your site. This takes about 1-2 minutes.
    - Once done, you will get a domain like `https://b2b-survey-web.vercel.app`. **Copy this URL.**

---

## Phase 4: Final Connection (CORS)

Now that the frontend is live, we need to tell the backend to allow requests from it.

1.  **Update Backend Environment**:
    - Go back to your **Render Dashboard** -> **b2b-survey-backend**.
    - Go to **Environment**.
    - Add a new variable: `FRONTEND_URL`.
    - **Value**: Your Vercel Frontend URL (e.g., `https://b2b-survey-web.vercel.app`).

2.  **Update Backend Code (One last time)**:
    - In your local `server-supabase.js`, ensure your CORS configuration allows the generic `FRONTEND_URL` environment variable.
    - *Example Change:*
      ```javascript
      // In server-supabase.js
      const allowedOrigins = [
          'http://localhost:3000', 
          process.env.FRONTEND_URL // Add this!
      ];
      ```
    - Git add, commit, and push this change.
    - Render will automatically redeploy your backend with the new code.

---

## ✅ Done!

You can now visit your Vercel URL. The frontend will load, and it will talk to your Render backend, which talks to Supabase.
