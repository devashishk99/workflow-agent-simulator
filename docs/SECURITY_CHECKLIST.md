# Security Checklist Before Pushing to Git

## ✅ Safe to Push

### Code Files (All Safe)
- ✅ All `.ts`, `.tsx`, `.js`, `.jsx` files
- ✅ All component files
- ✅ All API routes
- ✅ Configuration files (`package.json`, `tsconfig.json`, etc.)
- ✅ **Prisma migrations** - MUST be committed (they're just SQL, no secrets)
- ✅ Prisma schema - safe (no secrets)

### Why Migrations are Safe
- Migrations are just SQL CREATE TABLE statements
- They don't contain connection strings or credentials
- They're essential for deployment (Vercel needs them)
- **You MUST commit migrations!**

## ❌ Never Push (Already in .gitignore)

- ❌ `.env` - Contains DATABASE_URL and API keys
- ❌ `.env.local` - Contains DATABASE_URL and API keys
- ❌ `.env.*.local` - All local env files
- ❌ `node_modules/` - Dependencies
- ❌ `.next/` - Build files
- ❌ `prisma/dev.db` - SQLite database (if any)
- ❌ `.vercel/` - Vercel config

## 🔍 Security Verification

### Check for Hardcoded Secrets
Run these checks before pushing:

```bash
# Check for hardcoded API keys/tokens
grep -r "pat_" --include="*.ts" --include="*.tsx" --include="*.js" .
grep -r "sk_" --include="*.ts" --include="*.tsx" --include="*.js" .
grep -r "postgres://" --include="*.ts" --include="*.tsx" --include="*.js" .

# Should return nothing (or only comments/examples)
```

### Current Code Status
✅ **All secrets use `process.env`** - Safe!
- `AIRTABLE_TOKEN` - from env
- `AIRTABLE_BASE_ID` - from env  
- `DATABASE_URL` - from env

## 📋 Pre-Push Checklist

- [ ] `.env` and `.env.local` are in `.gitignore` ✅
- [ ] No hardcoded API keys in code ✅
- [ ] All secrets use `process.env` ✅
- [ ] Prisma migrations are NOT ignored ✅
- [ ] `node_modules` is ignored ✅
- [ ] `.next` build folder is ignored ✅

## 🚀 What to Commit

### Must Commit:
- ✅ Source code (app/, components/, lib/)
- ✅ Configuration files (package.json, tsconfig.json, etc.)
- ✅ **Prisma migrations** (`prisma/migrations/`)
- ✅ Prisma schema (`prisma/schema.prisma`)
- ✅ README.md
- ✅ .gitignore

### Should NOT Commit:
- ❌ .env files
- ❌ node_modules
- ❌ .next build folder
- ❌ SQLite database files

## 🔐 For Production (Vercel)

When deploying to Vercel, set these as **Environment Variables** in Vercel dashboard:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `AIRTABLE_TOKEN` - Your Airtable token
- `AIRTABLE_BASE_ID` - Your Airtable base ID

**Never commit these!** They're already in `.gitignore`.

## ✅ Final Check

Before pushing, verify:

```bash
# Check what will be committed
git status

# Make sure .env is NOT listed
git status | grep -i env

# Should return nothing (or "Untracked files" if .env exists but isn't committed)
```

---

## Summary

**Your code is secure!** ✅
- No hardcoded secrets
- All use environment variables
- .gitignore properly configured
- **Prisma migrations are safe to commit** (they're just SQL)

**Ready to push!** 🚀

