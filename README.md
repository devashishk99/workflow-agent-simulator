# Workflow Agent Simulator

A deterministic workflow engine that simulates an AI agent implementation platform without using AI. The system processes customer messages, validates business rules, creates bookings, and integrates with Airtable CRM.

**Live Demo:** [Add your Vercel URL here]

## 🎯 Project Overview

This project demonstrates the core competencies of a **Founding Solutions Engineer**:
- **Customer Onboarding**: Admin interface for business configuration
- **Workflow Configuration**: Deterministic step-by-step message processing
- **Integration**: Real-time Airtable CRM integration
- **Debugging & Observability**: Comprehensive logging and execution timeline
- **Edge Case Handling**: Graceful error handling and validation

## ✨ Features

- **Admin Configuration**: Set business hours, services, and timezone
- **Message Processing**: Natural language intent detection and data extraction
- **Workflow Engine**: Deterministic step execution with validation
- **Airtable Integration**: Automatic lead and booking creation
- **Logs Dashboard**: Full execution timeline with metrics
- **Edge Cases**: Handles missing data, outside hours, escalations

## 🛠️ Tech Stack

- **Frontend + Backend**: Next.js 14+ (TypeScript, App Router)
- **Database**: PostgreSQL + Prisma ORM (SQLite for local dev)
- **External Integration**: Airtable REST API
- **Date Parsing**: chrono-node
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Airtable account (optional, for full functionality)

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd workflow-agent-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file:
```env
DATABASE_URL="file:./dev.db"
AIRTABLE_TOKEN=pat...
AIRTABLE_BASE_ID=app...
```

4. Set up the database:
```bash
npm run db:generate
npm run db:migrate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
workflow-agent-simulator/
├── app/
│   ├── admin/          # Business configuration UI
│   ├── inbox/          # Message simulator
│   ├── logs/           # Debug dashboard
│   └── api/            # API routes
├── lib/
│   ├── db.ts           # Prisma client
│   ├── workflow/       # Workflow engine
│   └── airtable/       # Airtable client
├── components/         # React components
└── prisma/
    └── schema.prisma   # Database schema
```

## 🎬 Demo Flow

1. **Configure Business** (`/admin`)
   - Set business name, hours, and services
   
2. **Process Messages** (`/inbox`)
   - Simulate customer messages
   - See intent detection and data extraction
   - View workflow responses

3. **View Logs** (`/logs`)
   - See execution timeline
   - Debug workflow steps
   - View metrics

4. **Check Airtable** (if configured)
   - Leads automatically created
   - Bookings created for successful bookings

## 🔧 Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deploy to Vercel
- [Airtable Setup](./AIRTABLE_SETUP.md) - Configure Airtable integration
- [Testing Checklist](./TESTING_CHECKLIST.md) - Comprehensive testing guide

## 🎯 Key Highlights

- **No AI Required**: Deterministic rule-based workflow engine
- **Production Ready**: Error handling, validation, logging
- **Real Integration**: Live Airtable CRM integration
- **Full Observability**: Complete execution timeline
- **Edge Cases**: Handles escalations, missing data, validation errors

## 📝 License

MIT

---

**Built for**: Solutions Engineer role demonstration  
**Time to Build**: 1 day  
**Status**: ✅ Complete and deployed
