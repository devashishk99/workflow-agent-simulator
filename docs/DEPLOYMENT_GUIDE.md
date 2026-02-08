# Deployment Guide for Portfolio

## Overview

This guide will help you deploy the Workflow Agent Simulator to Vercel for your portfolio.

## Important: Database Migration

**SQLite won't work on Vercel** (read-only filesystem). We need to switch to a hosted database.

### Recommended: Neon via Vercel Marketplace (Easiest)

1. **Free tier available**
2. **Integrated with Vercel**
3. **Easy setup via Marketplace**
4. **Note**: Vercel Postgres was discontinued in December 2024, migrated to Neon

---

## Step 1: Set Up Neon Database

### Option A: Neon via Vercel Marketplace (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project (or use existing)
3. Go to **Integrations** tab
4. Click **Browse Marketplace**
5. Search for **Neon** or go to [Neon integration](https://vercel.com/marketplace/neon)
6. Click **Add Integration**
7. Follow the setup wizard:
   - Create Neon account (if needed)
   - Create new database
   - Select region
8. **Connection string will be automatically added** as `POSTGRES_URL` environment variable
9. You can also find it in Neon dashboard if needed

### Option B: Direct Neon Setup

1. Go to [neon.tech](https://neon.tech)
2. Sign up / Log in
3. Create new project
4. Copy connection string from dashboard
5. Add to Vercel environment variables manually

### Option C: Alternative Databases

- **Railway** (railway.app) - Easy PostgreSQL setup
- **Supabase** (supabase.com) - Free PostgreSQL

---

## Step 2: Update Prisma Schema

We need to change from SQLite to PostgreSQL.

### Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Update Connection String Format:

For Vercel Postgres, the connection string will look like:
```
postgres://user:password@host:5432/database?sslmode=require
```

---

## Step 3: Create New Migration

```bash
# Generate new migration for PostgreSQL
npm run db:migrate -- --name migrate_to_postgres

# Or reset and create fresh migration
npx prisma migrate reset
npx prisma migrate dev --name init_postgres
```

---

## Step 4: Test Locally with PostgreSQL

1. Get your PostgreSQL connection string
2. Update `.env.local`:
   ```env
   DATABASE_URL="postgres://user:password@host:5432/database?sslmode=require"
   AIRTABLE_TOKEN=pat...
   AIRTABLE_BASE_ID=app...
   ```
3. Run migrations:
   ```bash
   npm run db:migrate
   ```
4. Test the app:
   ```bash
   npm run dev
   ```
5. Verify everything works

---

## Step 5: Prepare for Vercel Deployment

### 5.1 Update `.gitignore`

Make sure these are ignored:
```
.env.local
.env
node_modules
.next
```

### 5.2 Create `vercel.json` (Optional)

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install && npx prisma generate"
}
```

### 5.3 Update `package.json` Scripts

Add postinstall script:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

## Step 6: Deploy to Vercel

### 6.1 Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 6.2 Deploy via Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure:

   **Environment Variables:**
   ```
   DATABASE_URL=postgres://... (from Neon - may be POSTGRES_URL if using Marketplace)
   AIRTABLE_TOKEN=pat...
   AIRTABLE_BASE_ID=app...
   ```
   
   **Note**: If using Neon via Vercel Marketplace, the connection string might be set as `POSTGRES_URL` instead of `DATABASE_URL`. You can either:
   - Use `POSTGRES_URL` in your Prisma schema, or
   - Add `DATABASE_URL` environment variable pointing to the same value

   **Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install`

5. Click **Deploy**

### 6.3 Run Migrations in Production

After deployment, run migrations:

**Option A: Via Vercel CLI**
```bash
npm i -g vercel
vercel env pull .env.local
npx prisma migrate deploy
```

**Option B: Via Vercel Dashboard**
- Use Vercel's built-in database migration tool
- Or connect via database client and run migrations

---

## Step 7: Post-Deployment

### 7.1 Verify Deployment

1. Visit your Vercel URL
2. Test all features:
   - Admin configuration
   - Inbox simulator
   - Logs dashboard
   - Airtable integration

### 7.2 Set Up Custom Domain (Optional)

1. Go to Vercel project settings
2. Add your custom domain
3. Update DNS records

---

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly
- Check SSL mode (should be `require` for Vercel Postgres)
- Ensure database is accessible

### Migration Issues

- Run `prisma generate` before build
- Check Prisma client is generated
- Verify migration files are committed

### Build Failures

- Check build logs in Vercel
- Verify all dependencies are in `package.json`
- Check for TypeScript errors

---

## Alternative: Keep SQLite for Demo

If you want to avoid database migration complexity:

1. **Use Railway** - Supports SQLite better
2. **Use Fly.io** - Better for SQLite apps
3. **Use a VPS** - Full control, can use SQLite

---

## Quick Checklist

- [ ] Set up PostgreSQL database
- [ ] Update Prisma schema to PostgreSQL
- [ ] Create new migration
- [ ] Test locally with PostgreSQL
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Run migrations in production
- [ ] Test deployed app
- [ ] Add to portfolio

---

## Next Steps

1. Choose your database option (Vercel Postgres recommended)
2. Update Prisma schema
3. Test locally
4. Deploy to Vercel
5. Add to your portfolio!

