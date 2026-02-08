# Final Testing Checklist

Use this checklist to verify all features work correctly before deployment.

## Prerequisites

- [ ] Database is set up and migrated
- [ ] `.env.local` file exists with `DATABASE_URL`
- [ ] Dev server runs without errors: `npm run dev`
- [ ] No console errors on page load

---

## Phase 1: Admin Configuration

### Test Business Setup
1. [ ] Navigate to `/admin`
2. [ ] Enter business name (e.g., "Marco's Barbershop")
3. [ ] Select timezone (optional)
4. [ ] Set opening hours for all 7 days
   - [ ] Monday-Friday: 09:00 - 18:00
   - [ ] Saturday: 10:00 - 16:00
   - [ ] Sunday: Closed (checkbox)
5. [ ] Add services:
   - [ ] "Haircut" - 30 minutes
   - [ ] "Beard Trim" - 15 minutes
6. [ ] Click "Save Configuration"
7. [ ] Verify success message appears
8. [ ] Refresh page
9. [ ] Verify all data persists (name, hours, services)

### Test Edge Cases
- [ ] Try saving without business name → should show error
- [ ] Try saving without services → should show error
- [ ] Try saving with empty service name → should be filtered out
- [ ] Try removing all services → should show error

---

## Phase 2: Inbox Simulator

### Test Basic Booking Flow
1. [ ] Navigate to `/inbox`
2. [ ] Use "Booking Request" test button
3. [ ] Verify:
   - [ ] Intent detected: `booking`
   - [ ] Name extracted: `Marco`
   - [ ] Service extracted: `Haircut`
   - [ ] DateTime extracted: tomorrow at 3pm
   - [ ] Response message is appropriate
   - [ ] No validation errors
4. [ ] Check execution logs:
   - [ ] `message_received`
   - [ ] `intent_detected`
   - [ ] `name_extracted`
   - [ ] `datetime_parsed`
   - [ ] `service_matched`
   - [ ] `response_generated`

### Test Missing Information
1. [ ] Use "Missing Service" test button
2. [ ] Verify:
   - [ ] Intent: `booking`
   - [ ] Response asks for service
   - [ ] Validation error shown
3. [ ] Use "Missing DateTime" test button
4. [ ] Verify:
   - [ ] Intent: `booking`
   - [ ] Response asks for date/time
   - [ ] Validation error shown

### Test Edge Cases
1. [ ] Use "Outside Hours" test button
2. [ ] Verify:
   - [ ] Intent: `booking`
   - [ ] Validation error about hours
   - [ ] Response suggests alternative
3. [ ] Use "Angry Customer" test button
4. [ ] Verify:
   - [ ] Intent: `info` (escalation)
   - [ ] Escalation response message
   - [ ] `escalation_triggered` in actions
5. [ ] Use "Cancellation" test button
6. [ ] Verify:
   - [ ] Intent: `cancel`
   - [ ] Appropriate cancel response
7. [ ] Use "Info Request" test button
8. [ ] Verify:
   - [ ] Intent: `info`
   - [ ] Opening hours displayed (if configured)

### Test Custom Messages
1. [ ] Try: "I'm John, can I book a beard trim next Monday at 2pm?"
2. [ ] Verify all data extracted correctly
3. [ ] Try: "What time do you close?"
4. [ ] Verify info intent and hours response
5. [ ] Try different channels (web/email/sms)
6. [ ] Verify channel is logged correctly

---

## Phase 3: Airtable Integration

### Prerequisites
- [ ] Airtable base created (see `AIRTABLE_SETUP.md`)
- [ ] `AIRTABLE_TOKEN` in `.env.local`
- [ ] `AIRTABLE_BASE_ID` in `.env.local`

### Test Lead Creation
1. [ ] Process any message in `/inbox`
2. [ ] Check execution logs for `airtable_lead_created`
3. [ ] Check Airtable Leads table
4. [ ] Verify lead record created with:
   - [ ] Name (or "Anonymous")
   - [ ] Channel
   - [ ] Intent
   - [ ] LastMessage
   - [ ] CreatedAt/UpdatedAt

### Test Booking Creation
1. [ ] Process a successful booking message
2. [ ] Check execution logs for `airtable_booking_created`
3. [ ] Check Airtable Bookings table
4. [ ] Verify booking record created with:
   - [ ] Name
   - [ ] Service
   - [ ] DateTime
   - [ ] Status: `confirmed`
   - [ ] SourceMessage
   - [ ] Channel

### Test Airtable Errors (Optional)
1. [ ] Temporarily remove `AIRTABLE_TOKEN` from `.env.local`
2. [ ] Restart dev server
3. [ ] Process a message
4. [ ] Verify:
   - [ ] Workflow continues (doesn't crash)
   - [ ] Warning logged about Airtable
   - [ ] Response still generated

---

## Phase 4: Logs Dashboard

### Test Run List
1. [ ] Navigate to `/logs`
2. [ ] Verify metrics displayed:
   - [ ] Total Runs
   - [ ] Success count
   - [ ] Failed count
   - [ ] Partial count
   - [ ] Booking Success count
3. [ ] Verify runs list shows:
   - [ ] All processed messages
   - [ ] Status badges (success/partial/failed)
   - [ ] Channel indicators
   - [ ] Intent labels
   - [ ] Message previews
   - [ ] Timestamps

### Test Run Details
1. [ ] Click on a run in the list
2. [ ] Verify details panel shows:
   - [ ] Message information
   - [ ] Extracted data (intent, name, service, datetime)
   - [ ] Response message
   - [ ] Execution logs timeline
3. [ ] Verify log events show:
   - [ ] Event types
   - [ ] Severity (color-coded)
   - [ ] Messages
   - [ ] Timestamps
   - [ ] Expandable metadata

### Test Different Run Types
1. [ ] Click on a "success" run
2. [ ] Verify all steps completed
3. [ ] Click on a "partial" run (with validation errors)
4. [ ] Verify validation errors shown
5. [ ] If you have a "failed" run, click it
6. [ ] Verify error details shown

---

## Phase 5: End-to-End Flow

### Complete Customer Journey
1. [ ] **Setup**: Configure business in `/admin`
2. [ ] **Inquiry**: Process "What are your hours?" in `/inbox`
3. [ ] **Booking**: Process "Hi, I'm Sarah. Can I book a haircut tomorrow at 3pm?"
4. [ ] **Verification**: 
   - [ ] Check `/logs` for both runs
   - [ ] Check Airtable for lead and booking
   - [ ] Verify response messages are appropriate

### Test Error Recovery
1. [ ] Process message with missing info
2. [ ] Verify partial status
3. [ ] Process follow-up message with missing info
4. [ ] Verify workflow handles gracefully

---

## Phase 6: UI/UX Testing

### Navigation
- [ ] Home page links work (Admin, Inbox, Logs)
- [ ] Back buttons work on all pages
- [ ] Pages load without errors

### Responsive Design
- [ ] Test on desktop (wide screen)
- [ ] Test on tablet (medium screen)
- [ ] Test on mobile (narrow screen)
- [ ] Verify layouts adapt correctly

### Loading States
- [ ] Admin page shows loading while fetching config
- [ ] Inbox shows "Processing..." while working
- [ ] Logs shows loading while fetching runs

### Error Messages
- [ ] Form validation errors display
- [ ] API errors display appropriately
- [ ] Network errors handled gracefully

---

## Phase 7: Data Integrity

### Database
- [ ] All tables have data after testing
- [ ] Relationships work (business → services, messages → runs)
- [ ] No orphaned records

### Airtable
- [ ] Leads table has correct structure
- [ ] Bookings table has correct structure
- [ ] Data matches what's in database

---

## Known Issues to Check

- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] All API routes return proper status codes
- [ ] Environment variables loaded correctly

---

## Final Verification

- [ ] All core features work
- [ ] Edge cases handled
- [ ] Error handling works
- [ ] UI is polished and consistent
- [ ] No critical bugs
- [ ] Ready for deployment

---

## Issues Found

Document any issues you find here:

1. 
2. 
3. 

---

## Notes

- Test with real data (not just test buttons)
- Try edge cases and error scenarios
- Verify data persists after page refresh
- Check both success and failure paths

