# Implementation Plan: Workflow Agent Simulator

## Project Overview

Build a deterministic workflow engine that simulates an AI agent implementation platform without using AI. The system processes customer messages, validates business rules, creates bookings, and integrates with Airtable CRM.

## Tech Stack

- **Frontend + Backend**: Next.js 14+ (TypeScript, App Router)
- **Database**: SQLite + Prisma ORM
- **External Integration**: Airtable REST API
- **Date Parsing**: chrono-node
- **Deployment**: Vercel

## Database Schema (Prisma)

### Core Tables

1. **Business**
   - id (String, @id, @default(uuid))
   - name (String)
   - timezone (String, optional)
   - createdAt (DateTime)
   - updatedAt (DateTime)

2. **OpeningHours**
   - id (String, @id, @default(uuid))
   - businessId (String, Foreign Key)
   - dayOfWeek (Int, 0-6, Mon-Sun)
   - openTime (String, HH:mm format)
   - closeTime (String, HH:mm format)
   - isClosed (Boolean, default false)

3. **Service**
   - id (String, @id, @default(uuid))
   - businessId (String, Foreign Key)
   - name (String)
   - duration (Int, minutes)
   - createdAt (DateTime)
   - updatedAt (DateTime)

4. **Message**
   - id (String, @id, @default(uuid))
   - businessId (String, Foreign Key)
   - channel (String, enum: web/email/sms)
   - rawMessage (String)
   - createdAt (DateTime)

5. **WorkflowRun**
   - id (String, @id, @default(uuid))
   - messageId (String, Foreign Key)
   - businessId (String, Foreign Key)
   - status (String, enum: success/failed/partial)
   - context (Json, stores WorkflowContext)
   - createdAt (DateTime)

6. **LogEvent**
   - id (String, @id, @default(uuid))
   - workflowRunId (String, Foreign Key)
   - timestamp (DateTime)
   - eventType (String)
   - severity (String, enum: info/warning/error)
   - message (String)
   - metadata (Json, optional)

## Application Structure

```
workflow-agent-simulator/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (home/redirect)
│   ├── admin/
│   │   └── page.tsx (Business config UI)
│   ├── inbox/
│   │   └── page.tsx (Message simulator)
│   ├── logs/
│   │   └── page.tsx (Debug dashboard)
│   └── api/
│       ├── workflow/
│       │   └── route.ts (Process message endpoint)
│       ├── business/
│       │   └── route.ts (CRUD for business config)
│       └── runs/
│           └── route.ts (Get workflow runs)
├── lib/
│   ├── db.ts (Prisma client)
│   ├── workflow/
│   │   ├── engine.ts (Workflow executor)
│   │   ├── steps.ts (Step implementations)
│   │   ├── context.ts (Type definitions)
│   │   └── template.ts (Workflow template)
│   └── airtable/
│       └── client.ts (Airtable API client)
├── components/
│   ├── BusinessConfig.tsx
│   ├── InboxSimulator.tsx
│   ├── LogsDashboard.tsx
│   └── ui/ (shadcn/ui components)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── .env.local (Airtable credentials)
```

## Implementation Phases

### Phase 1: Project Setup & Database (Hour 1)

**Tasks:**
1. Initialize Next.js project with TypeScript
2. Install dependencies:
   - `prisma` + `@prisma/client`
   - `chrono-node`
   - `@airtable/api` or `airtable` package
   - UI library (shadcn/ui or Tailwind CSS)
3. Set up Prisma schema
4. Create initial migration
5. Configure environment variables (.env.local)
6. Set up basic app structure (layout, routing)

**Deliverables:**
- Working Next.js app
- Database schema defined and migrated
- Environment configuration ready

---

### Phase 2: Admin Configuration UI (Hour 2)

**Tasks:**
1. Create `/admin` page
2. Build BusinessConfig component:
   - Business name input
   - Timezone selector (optional)
   - Opening hours editor (7 days, open/close times)
   - Services list (add/remove/edit services with duration)
3. Create API route `/api/business`:
   - GET: Fetch current business config
   - POST/PUT: Save business config
4. Implement form validation
5. Store data in database

**Deliverables:**
- Admin page functional
- Business can configure hours and services
- Data persists in database

---

### Phase 3: Inbox Simulator UI (Hour 3)

**Tasks:**
1. Create `/inbox` page
2. Build InboxSimulator component:
   - Channel dropdown (web/email/sms)
   - Message textarea
   - "Process Message" button
   - Output panel showing:
     - Detected intent
     - Extracted datetime
     - Extracted service
     - Final response message
3. Create API route `/api/workflow`:
   - POST: Accept message, trigger workflow
   - Return workflow result
4. Add pre-built test message buttons (edge cases)

**Deliverables:**
- Inbox page functional
- Can submit messages and see responses
- Test buttons for edge cases

---

### Phase 4: Workflow Engine Core (Hours 4-5)

**Tasks:**
1. Define WorkflowContext type
2. Create workflow template (JSON structure)
3. Implement workflow engine:
   - Step executor that runs steps sequentially
   - Shared context object passed between steps
   - Early termination on validation errors
4. Implement workflow steps:
   - **detect_intent**: Keyword matching (booking/cancel/reschedule/info/unknown)
   - **extract_name**: Pattern matching ("I'm X", "My name is X")
   - **extract_datetime**: Use chrono-node for natural language parsing
   - **extract_service**: Match against business services list
   - **validate_required_fields**: Check required fields for booking intent
   - **validate_opening_hours**: Check if datetime is within business hours
   - **build_response**: Construct user-facing response message
5. Each step logs events to context
6. Store WorkflowRun in database

**Deliverables:**
- Workflow engine processes messages
- Intent detection works
- Datetime parsing works
- Validation rules enforced
- Responses generated

---

### Phase 5: Airtable Integration (Hour 6)

**Tasks:**
1. Set up Airtable client:
   - Configure API token and base ID
   - Create helper functions for API calls
2. Implement Airtable steps:
   - **create_airtable_lead**:
     - Create Lead record with Name, Channel, Intent, LastMessage, CreatedAt
     - Handle errors gracefully
   - **create_airtable_booking**:
     - Only if intent == booking
     - Create Booking record with Name, Service, DateTime, Status, SourceMessage, Channel
3. Add error handling and logging
4. Test integration with real Airtable base

**Deliverables:**
- Airtable integration functional
- Leads created/updated
- Bookings created for booking intents
- Error handling in place

---

### Phase 6: Logs & Observability (Hour 7)

**Tasks:**
1. Create `/logs` page
2. Build LogsDashboard component:
   - List of workflow runs (newest first)
   - Click run → show detailed log events
   - Event display: timestamp, type, severity, message, metadata
3. Store LogEvents in database during workflow execution
4. Create API route `/api/runs`:
   - GET: Fetch workflow runs with pagination
   - GET /api/runs/[id]: Fetch single run with events
5. Add metrics summary (optional):
   - Total runs
   - Success/failure rate
   - Booking success rate

**Deliverables:**
- Logs dashboard functional
- Can view workflow execution timeline
- Events stored and displayed

---

### Phase 7: Edge Cases & Polish (Hour 8)

**Tasks:**
1. Implement edge case handling:
   - Missing datetime → ask for date/time
   - Missing service → ask for service
   - Outside hours → suggest alternative
   - Angry customer → escalation response
   - Cancellation flow → ask for booking details
2. Add escalation rule:
   - Detect angry keywords
   - Set intent to info
   - Return handoff message
3. UI polish:
   - Clean styling
   - Loading states
   - Error messages
   - Responsive design
4. Test all flows end-to-end
5. Prepare for deployment

**Deliverables:**
- All edge cases handled
- UI polished
- Ready for deployment

---

### Phase 8: Deployment (Post-Hour 8)

**Tasks:**
1. Set up Vercel project
2. Configure environment variables in Vercel
3. Set up Prisma for production (migrations)
4. Deploy application
5. Test deployed version
6. Verify Airtable integration works in production

**Deliverables:**
- Application deployed to Vercel
- All features working in production

---

## Workflow Step Details

### Step 1: detect_intent
- **Input**: rawMessage
- **Logic**: Keyword matching
  - booking: "book", "appointment", "reserve", "schedule"
  - cancel: "cancel", "can't make it"
  - reschedule: "change", "move", "reschedule"
  - info: "open", "hours", "price", "where"
- **Output**: context.intent
- **Log**: intent_detected

### Step 2: extract_name
- **Input**: rawMessage
- **Logic**: Pattern matching
  - "I'm [Name]"
  - "My name is [Name]"
- **Output**: context.customerName
- **Log**: name_extracted
- **Fallback**: Continue if missing (anonymous lead)

### Step 3: extract_datetime
- **Input**: rawMessage
- **Logic**: Use chrono-node
  - "tomorrow at 3pm"
  - "monday 10:30"
  - "today at 14"
- **Output**: context.requestedDateTime
- **Log**: datetime_parsed
- **Fallback**: Add validation error if missing

### Step 4: extract_service
- **Input**: rawMessage, business.services
- **Logic**: Case-insensitive string matching
- **Output**: context.requestedService
- **Log**: service_matched
- **Fallback**: Add validation error if missing

### Step 5: validate_required_fields
- **Input**: context
- **Logic**: 
  - If intent == booking: service and datetime required
  - If missing: stop execution, return asking message
- **Output**: validationErrors array
- **Log**: validation_failed_missing_fields (if failed)

### Step 6: validate_opening_hours
- **Input**: context.requestedDateTime, business.openingHours
- **Logic**: 
  - Check day of week
  - Verify time is within open/close
- **Output**: validationErrors array
- **Log**: validation_failed_outside_hours (if failed)
- **Response**: Suggest alternative time

### Step 7: create_airtable_lead
- **Input**: context
- **Logic**: 
  - Create/update Lead in Airtable
  - Fields: Name, Channel, Intent, LastMessage, CreatedAt, UpdatedAt
- **Output**: leadId (optional)
- **Log**: airtable_lead_created / airtable_lead_failed

### Step 8: create_airtable_booking
- **Input**: context
- **Logic**: 
  - Only if intent == booking
  - Create Booking in Airtable
  - Fields: Name, Service, DateTime, Status="confirmed", SourceMessage, Channel
- **Output**: bookingId (optional)
- **Log**: airtable_booking_created / airtable_booking_failed

### Step 9: build_response
- **Input**: context
- **Logic**: Construct response based on:
  - Intent type
  - Validation errors
  - Actions taken
- **Output**: context.responseMessage
- **Log**: response_generated

---

## Airtable Base Structure

### Base Name: Customer Agent Demo

#### Table 1: Leads
- **Name** (Single line text)
- **Channel** (Single select: web/email/sms)
- **Intent** (Single select: booking/cancel/reschedule/info/unknown)
- **LastMessage** (Long text)
- **CreatedAt** (Date)
- **UpdatedAt** (Date)

#### Table 2: Bookings
- **Name** (Single line text)
- **Service** (Single line text)
- **DateTime** (Date)
- **Status** (Single select: pending/confirmed/cancelled)
- **SourceMessage** (Long text)
- **Channel** (Single select: web/email/sms)

---

## Environment Variables

```env
# Airtable
AIRTABLE_TOKEN=pat...
AIRTABLE_BASE_ID=app...

# Database (for local development)
DATABASE_URL="file:./dev.db"
```

---

## Testing Checklist

### Core Flows
- [ ] Admin can configure business hours
- [ ] Admin can add/edit services
- [ ] Inbox can process booking request
- [ ] Booking creates lead in Airtable
- [ ] Booking creates booking in Airtable
- [ ] Logs show workflow execution

### Edge Cases
- [ ] Missing datetime → asks for date/time
- [ ] Missing service → asks for service
- [ ] Outside hours → suggests alternative
- [ ] Angry customer → escalation response
- [ ] Cancellation → handles gracefully

### UI/UX
- [ ] All pages load correctly
- [ ] Forms validate input
- [ ] Loading states shown
- [ ] Error messages displayed
- [ ] Responsive design works

---

## Success Criteria

### Must Have
- ✅ Admin setup works
- ✅ Inbox simulation works
- ✅ Workflow engine processes booking request end-to-end
- ✅ Airtable receives booking + lead
- ✅ Logs show step execution

### Nice to Have
- ⭐ Cancellation flow
- ⭐ Conflict detection
- ⭐ Metrics summary
- ⭐ Better UI/UX polish

---

## Next Steps

1. Start with Phase 1: Project Setup
2. Follow phases sequentially
3. Test each phase before moving to next
4. Deploy when all phases complete

