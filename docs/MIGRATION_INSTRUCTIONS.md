# Database Migration Instructions

## Current Status
✅ Prisma schema updated to PostgreSQL

## Next Steps

### Step 1: Set Up PostgreSQL Database

Choose one option:

#### Option A: Neon (Recommended - Vercel Marketplace)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project (or select existing)
3. Go to **Integrations** tab
4. Click **Browse Marketplace**
5. Search for **Neon** (or go to [Neon integration](https://vercel.com/marketplace/neon))
6. Click **Add Integration**
7. Follow setup wizard to create database
8. **Connection string will be automatically added** as environment variable
9. Or copy from Neon dashboard if needed

#### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string from Variables tab

#### Option C: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (under Connection string → URI)

#### Option D: Direct Neon Setup (Alternative)
1. Go to [neon.tech](https://neon.tech)
2. Sign up / Log in
3. Create new project
4. Copy connection string from dashboard

---

### Step 2: Update Environment Variables

Once you have your PostgreSQL connection string:

1. **For Local Testing:**
   Update `.env.local`:
   ```env
   DATABASE_URL="postgres://user:password@host:5432/database?sslmode=require"
   AIRTABLE_TOKEN=pat...
   AIRTABLE_BASE_ID=app...
   ```

2. **For Production (Vercel):**
   - Will set in Vercel dashboard later
   - Same connection string format

---

### Step 3: Create New Migration

After updating `.env.local` with PostgreSQL connection string:

```bash
# Generate Prisma client for PostgreSQL
npm run db:generate

# Create new migration
npm run db:migrate -- --name migrate_to_postgres

# Or if you want to start fresh:
npx prisma migrate reset
npx prisma migrate dev --name init_postgres
```

---

### Step 4: Test Locally

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Test all features:
   - Go to `/admin` - configure business
   - Go to `/inbox` - process messages
   - Go to `/logs` - view runs
   - Verify data persists

3. Check database:
   ```bash
   npm run db:studio
   ```
   - Should connect to PostgreSQL
   - Verify tables created

---

### Step 5: Verify Migration

Check that:
- ✅ App runs without errors
- ✅ Database connection works
- ✅ All tables created
- ✅ Data can be saved/retrieved
- ✅ All features work

---

## Important Notes

### Connection String Format

For Neon (via Vercel Marketplace or direct):
```
postgres://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

For Railway:
```
postgresql://postgres:password@host.railway.app:5432/railway
```

For Supabase:
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

### SSL Mode

Most hosted PostgreSQL requires SSL:
- Add `?sslmode=require` to connection string
- Or use `?sslmode=prefer` (tries SSL, falls back if not available)

---

## Troubleshooting

### "Connection refused"
- Check connection string is correct
- Verify database is running
- Check firewall/network settings

### "SSL required"
- Add `?sslmode=require` to connection string
- Or use `?sslmode=prefer`

### "Database does not exist"
- Create database first
- Or use default database name (usually `postgres` or `verceldb`)

### Migration fails
- Check Prisma client is generated: `npm run db:generate`
- Verify connection string format
- Check database permissions

---

## Ready?

1. **Set up PostgreSQL database** (choose one option above)
2. **Copy connection string**
3. **Update `.env.local`**
4. **Run migration commands**
5. **Test locally**

Let me know when you have your PostgreSQL connection string and we'll proceed! 🚀

