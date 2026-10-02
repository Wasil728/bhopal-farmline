# Project: Bhopal Farmline

## What this product does
Bhopal Farmline is a free, community-driven directory connecting people directly with farmhouse owners in and around Bhopal. It solves the problem of hidden broker fees and scattered information by allowing users to filter, compare, and contact owners directly via WhatsApp or Phone.

## Stack (do not change without asking)
- **Frontend:** Vanilla HTML, CSS, and JavaScript. No frontend frameworks (No React, No Vue).
- **Backend/Database:** Supabase (PostgreSQL, REST API, Storage).
- **Hosting:** Netlify (Continuous Deployment from `main` branch).
- **Dependencies:** Loaded via CDN (e.g., `@supabase/supabase-js`, `browser-image-compression`).

## Architecture & Data Flow
- **Modular Monolith (Static + BaaS):** The site is entirely static files served via Netlify CDN, communicating directly with Supabase via its REST API.
- **Data Caching:** We use `sessionStorage` in the browser (`bhopal_farmhouses_live_v5`) with a 2-minute TTL to prevent spamming Supabase on every page load.
- **Tenancy/Auth:** This is a public directory. There is currently no user login. Farmhouse owners submit listings via the public `add-farmhouse.html` form.
- **Admin Flow:** Listings default to `status = 'pending'`. An admin must manually change this to `status = 'approved'` in the Supabase Dashboard before they appear on the live site.

## Rules
- **No Build Step:** Do not introduce Webpack, Vite, or npm build scripts unless explicitly approved.
- **CSS Design System:** All styles must use the existing CSS variables in `style.css` (e.g., `--primary: #1B8F7A`). Do not introduce new color hex codes; use the established 'Midnight Forest' palette.
- **Security & Secrets:** Never commit Supabase Service Role keys. The `SUPABASE_ANON_KEY` is public and safe to expose in `main.js`, provided Supabase RLS (Row Level Security) is properly configured.
- **Always verify dependencies:** If adding a CDN script, ALWAYS use an exact version number and provide an SRI (Subresource Integrity) hash to prevent supply chain attacks (e.g., `@2.117.1` not just `@2`).
- **Never modify pricing logic:** The `pricing_slots` JSONB display logic in `main.js` is critical. Never alter how prices are displayed without explicit permission.

## Database Schema Highlights
- Table `farmhouses`: Uses UUIDs, soft deletes are not currently implemented (deletions are hard).
- Security: RLS is enabled. Public can `SELECT` where `status = 'approved'`. Public can `INSERT` (with constraints). Public CANNOT `DELETE` or `UPDATE`.

## Commands / Workflow
- **Dev:** Open `index.html` in a browser or use a simple local server (e.g., VS Code Live Server).
- **Deploy:** Commit and push to the `main` branch. Netlify auto-deploys.
