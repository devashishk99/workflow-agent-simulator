# Neon Database Setup Guide

## Quick Setup (Recommended)

### Via Vercel Marketplace

1. **In Vercel Dashboard:**
   - Go to your project
   - Click **Integrations** tab
   - Click **Browse Marketplace**
   - Search for **Neon**
   - Click **Add Integration**
   - Follow setup wizard

2. **Environment Variable:**
   - Neon integration automatically adds `POSTGRES_URL`
   - You may need to add `DATABASE_URL` pointing to the same value
   - Or update Prisma schema to use `POSTGRES_URL`

3. **Update Prisma Schema (if needed):**
   If Neon sets `POSTGRES_URL` instead of `DATABASE_URL`, you can either:
   
   **Option A**: Add `DATABASE_URL` in Vercel pointing to `POSTGRES_URL` value
   
   **Option B**: Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("POSTGRES_URL")  // Change from DATABASE_URL
   }
   ```

---

## Direct Neon Setup (Alternative)

1. **Go to Neon:**
   - Visit [neon.tech](https://neon.tech)
   - Sign up / Log in
   - Create new project

2. **Get Connection String:**
   - Go to project dashboard
   - Click **Connection Details**
   - Copy connection string (starts with `postgres://`)

3. **Add to Vercel:**
   - Go to Vercel project settings
   - Environment Variables
   - Add `DATABASE_URL` with your Neon connection string

---

## Connection String Format

Neon connection strings look like:
```
postgres://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## Important Notes

- **SSL Required**: Add `?sslmode=require` to connection string
- **Free Tier**: Neon offers generous free tier
- **Auto-scaling**: Neon is serverless, scales automatically
- **Vercel Integration**: Marketplace integration is easiest

---

## Testing Locally

1. **Get connection string** from Neon dashboard
2. **Update `.env.local`:**
   ```env
   DATABASE_URL="postgres://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
3. **Run migration:**
   ```bash
   npm run db:generate
   npm run db:migrate -- --name migrate_to_neon
   ```
4. **Test:**
   ```bash
   npm run dev
   ```

---

## Reference

- [Vercel Postgres Docs](https://vercel.com/docs/postgres) - Notes about migration to Neon
- [Vercel Marketplace - Neon](https://vercel.com/marketplace/neon)
- [Neon Documentation](https://neon.tech/docs)

