# Quick Test Guide

Run through these quick tests to verify everything works.

## 1. Admin Setup (2 minutes)

```
1. Go to /admin
2. Enter: "Marco's Barbershop"
3. Set hours: Mon-Fri 09:00-18:00, Sat 10:00-16:00, Sun Closed
4. Add services: "Haircut" (30 min), "Beard Trim" (15 min)
5. Save
6. Refresh page → verify data persists
```

✅ **Expected**: Success message, data saved

---

## 2. Basic Booking (1 minute)

```
1. Go to /inbox
2. Click "Booking Request" test button
3. Click "Process Message"
```

✅ **Expected**: 
- Intent: booking
- Name: Marco
- Service: Haircut
- DateTime: tomorrow 3pm
- Success response

---

## 3. Edge Cases (2 minutes)

```
1. Click "Missing Service" → should ask for service
2. Click "Outside Hours" → should show hours error
3. Click "Angry Customer" → should escalate
4. Click "Info Request" → should show hours
```

✅ **Expected**: Appropriate responses for each

---

## 4. Logs Dashboard (1 minute)

```
1. Go to /logs
2. Verify metrics show numbers
3. Click a run
4. Verify details show
```

✅ **Expected**: Metrics, run list, details panel

---

## 5. Airtable (if configured) (1 minute)

```
1. Process a booking message
2. Check Airtable:
   - Leads table has new record
   - Bookings table has new record (if successful)
```

✅ **Expected**: Records created in Airtable

---

## Total Time: ~7 minutes

If all tests pass, you're ready to deploy! 🚀

