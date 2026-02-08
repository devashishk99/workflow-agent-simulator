# Phase 1 Setup Instructions

## Completed Setup

✅ Next.js project structure created
✅ TypeScript configuration
✅ Prisma schema defined
✅ Basic app structure (pages and API routes)
✅ Environment variable template
✅ Database client setup

## Next Steps (Manual)

Due to npm permission issues in the sandbox, please run these commands manually:

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js and React
- Prisma and @prisma/client
- chrono-node (for date parsing)
- airtable (for Airtable API)
- TypeScript and other dev dependencies

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
AIRTABLE_TOKEN=pat_your_token_here
AIRTABLE_BASE_ID=app_your_base_id_here
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Create Database Migration

```bash
npm run db:migrate
```

This will:
- Create the SQLite database file (`dev.db`)
- Create all tables defined in the Prisma schema
- Set up the database structure

### 5. Verify Setup

```bash
npm run dev
```

Visit http://localhost:3000 to see the home page with links to Admin, Inbox, and Logs pages.

## Project Structure Created

```
workflow-agent-simulator/
├── app/
│   ├── admin/page.tsx          ✅ Created
│   ├── inbox/page.tsx           ✅ Created
│   ├── logs/page.tsx            ✅ Created
│   ├── api/
│   │   ├── business/route.ts    ✅ Created
│   │   ├── workflow/route.ts    ✅ Created
│   │   └── runs/route.ts        ✅ Created
│   ├── layout.tsx               ✅ Created
│   ├── page.tsx                 ✅ Created
│   └── globals.css              ✅ Created
├── lib/
│   ├── db.ts                    ✅ Created
│   ├── workflow/
│   │   ├── context.ts           ✅ Created
│   │   ├── template.ts          ✅ Created
│   │   ├── steps.ts             ✅ Placeholder
│   │   └── engine.ts            ✅ Placeholder
│   └── airtable/
│       └── client.ts             ✅ Placeholder
├── prisma/
│   └── schema.prisma            ✅ Created
├── package.json                 ✅ Created
├── tsconfig.json                ✅ Created
├── next.config.js               ✅ Created
├── tailwind.config.ts           ✅ Created
└── README.md                    ✅ Created
```

## Database Schema

The following tables are defined in `prisma/schema.prisma`:

1. **Business** - Business configuration
2. **OpeningHours** - Business hours per day of week
3. **Service** - Services offered by the business
4. **Message** - Incoming customer messages
5. **WorkflowRun** - Workflow execution records
6. **LogEvent** - Individual log events for each workflow run

## Ready for Phase 2

Once you've completed the manual steps above, Phase 1 is complete and you can proceed to Phase 2: Admin Configuration UI.

