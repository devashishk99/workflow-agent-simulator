# Airtable Integration Setup

## Prerequisites

1. An Airtable account (free tier works)
2. A base named "Customer Agent Demo" (or update the code to use your base name)

## Step 1: Create Airtable Base

1. Log in to Airtable
2. Create a new base named **"Customer Agent Demo"**

## Step 2: Create Leads Table

Create a table named **"Leads"** with the following fields:

| Field Name | Field Type | Options |
|------------|------------|---------|
| Name | Single line text | - |
| Channel | Single select | Options: `web`, `email`, `sms` |
| Intent | Single select | Options: `booking`, `cancel`, `reschedule`, `info`, `unknown` |
| LastMessage | Long text | - |
| CreatedAt | Date | Format: YYYY-MM-DD |
| UpdatedAt | Date | Format: YYYY-MM-DD |

## Step 3: Create Bookings Table

Create a table named **"Bookings"** with the following fields:

| Field Name | Field Type | Options |
|------------|------------|---------|
| Name | Single line text | - |
| Service | Single line text | - |
| DateTime | Date | Format: Date & time |
| Status | Single select | Options: `pending`, `confirmed`, `cancelled` |
| SourceMessage | Long text | - |
| Channel | Single select | Options: `web`, `email`, `sms` |

## Step 4: Get Airtable Credentials

### Get Personal Access Token

1. Go to https://airtable.com/create/tokens
2. Click "Create new token"
3. Name it (e.g., "Workflow Agent Simulator")
4. Grant access to your base "Customer Agent Demo"
5. Give it these scopes:
   - `data.records:write` (to create records)
   - `schema.bases:read` (to read base structure)
6. Copy the token (starts with `pat...`)

### Get Base ID

1. Go to https://airtable.com/api
2. Select your base "Customer Agent Demo"
3. Find the "Base ID" in the API documentation
4. Copy the Base ID (starts with `app...`)

## Step 5: Configure Environment Variables

Update your `.env.local` file:

```env
DATABASE_URL="file:./dev.db"
AIRTABLE_TOKEN=pat_your_token_here
AIRTABLE_BASE_ID=app_your_base_id_here
```

## Step 6: Test the Integration

1. Make sure your business is configured in `/admin`
2. Go to `/inbox`
3. Process a booking message (e.g., "Hi, I'm Marco. Can I book a haircut tomorrow at 3pm?")
4. Check your Airtable base:
   - A new Lead should appear in the Leads table
   - A new Booking should appear in the Bookings table (if booking was successful)

## Troubleshooting

### "Airtable credentials not configured"
- Check that `.env.local` has both `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID`
- Restart your dev server after updating `.env.local`

### "Airtable API error: 401"
- Your token might be invalid or expired
- Regenerate the token and update `.env.local`

### "Airtable API error: 404"
- Check that your Base ID is correct
- Make sure the base name matches exactly

### "Airtable API error: 422"
- Check that your table names are exactly "Leads" and "Bookings" (case-sensitive)
- Verify all field names match exactly (case-sensitive)
- Check that single select options match exactly

### Records not appearing
- Check the execution logs in the Inbox Simulator
- Look for `airtable_lead_created` or `airtable_booking_created` events
- Check for error messages in the logs

## Field Name Reference

Make sure your Airtable fields match these **exact** names (case-sensitive):

**Leads Table:**
- Name
- Channel
- Intent
- LastMessage
- CreatedAt
- UpdatedAt

**Bookings Table:**
- Name
- Service
- DateTime
- Status
- SourceMessage
- Channel

## Notes

- The integration will gracefully handle errors - if Airtable fails, the workflow will continue
- Check the execution logs to see Airtable operation results
- Leads are created for all messages
- Bookings are only created for successful booking intents (no validation errors)

