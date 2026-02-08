# Database Migration Steps

## Step 1: Choose Your PostgreSQL Provider

### Option A: Vercel Postgres (Recommended - Easiest)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project (or use existing)
3. Go to **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Choose a name (e.g., `workflow-agent-db`)
6. Select region
7. Click **Create**
8. **Copy the connection string** - you'll need this!

### Option B: Railway (Alternative)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string from Variables tab

### Option C: Supabase (Alternative)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string

---

## Step 2: Update Prisma Schema

We'll update the schema to use PostgreSQL instead of SQLite.

---

## Step 3: Create New Migration

After updating the schema, we'll create a fresh migration for PostgreSQL.

---

## Step 4: Test Locally

We'll test the migration locally before deploying.

---

**Ready?** Let's start with Step 2 - updating the Prisma schema!

