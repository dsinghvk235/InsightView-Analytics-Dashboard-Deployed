# Postman Quick Start Guide

## Step 1: Start the Backend

Open terminal in the `backend` folder and run:
```bash
cd backend
mvn spring-boot:run
```

Wait for this message:
```
Started AnalyticsDashboardApplication in X.XXX seconds
```

---

## Step 2: Copy URLs to Postman

### Base URL
```
http://localhost:8080/api/analytics
```

---

## Step 3: All API URLs (Copy & Paste into Postman)

### ✅ 1. Dashboard Overview
**Method:** `GET`  
**URL:**
```
http://localhost:8080/api/analytics/overview
```
**No parameters needed** - Just copy and send!

---

### ✅ 2. Transactions by Status
**Method:** `GET`  
**URL:**
```
http://localhost:8080/api/analytics/transactions/by-status
```
**No parameters needed**

---

### ✅ 3. Daily Transactions by Date Range
**Method:** `GET`  
**URL:**
```
http://localhost:8080/api/analytics/transactions/by-date?startDate=2024-12-18&endDate=2025-01-17
```
**Parameters:** `startDate` and `endDate` (YYYY-MM-DD format)

---

### ✅ 4. Revenue Over Time (Line Chart)
**Method:** `GET`  
**URL:**
```
http://localhost:8080/api/analytics/revenue/over-time?startDate=2024-12-18&endDate=2025-01-17
```
**Parameters:** `startDate` and `endDate`

---

### ✅ 5. Transactions by Payment Method (Pie Chart)
**Method:** `GET`  
**URL:**
```
http://localhost:8080/api/analytics/transactions/by-payment-method?startDate=2024-12-18&endDate=2025-01-17
```
**Parameters:** `startDate` and `endDate`

---

### ✅ 6. Top Users by Revenue
**Method:** `GET`  
**URL:**
```
http://localhost:8080/api/analytics/users/top-by-revenue?startDate=2024-12-18&endDate=2025-01-17&limit=10
```
**Parameters:** `startDate`, `endDate`, and `limit` (optional, default: 10)

---

### ✅ 7. Conversion Funnel
**Method:** `GET`  
**URL:**
```
http://localhost:8080/api/analytics/conversion-funnel?startDate=2024-12-18&endDate=2025-01-17
```
**Parameters:** `startDate` and `endDate`

---

### ✅ 8. Refund & Chargeback Analysis
**Method:** `GET`  
**URL:**
```
http://localhost:8080/api/analytics/transactions/refund-chargeback?startDate=2024-12-18&endDate=2025-01-17
```
**Parameters:** `startDate` and `endDate`

---

### ✅ 9. User Activity Over Time
**Method:** `GET`  
**URL:**
```
http://localhost:8080/api/analytics/users/activity-over-time?startDate=2024-12-18&endDate=2025-01-17
```
**Parameters:** `startDate` and `endDate`

---

### ✅ 10. Hourly Transaction Stats (Heatmap)
**Method:** `GET`  
**URL:**
```
http://localhost:8080/api/analytics/transactions/by-hour?startDate=2024-12-18&endDate=2025-01-17
```
**Parameters:** `startDate` and `endDate`

---

## Step 4: How to Test in Postman

### Method 1: Quick Test (One Request at a Time)

1. **Open Postman**
2. **Click "New" → "HTTP Request"**
3. **Select Method:** `GET` (from dropdown)
4. **Paste URL:** Copy any URL from above and paste in the URL field
5. **Click "Send"**
6. **View Response:** You'll see JSON response below

### Method 2: Create Collection (Recommended)

1. **Create Collection:**
   - Click "New" → "Collection"
   - Name it: `Analytics Dashboard APIs`

2. **Add Requests:**
   - Right-click collection → "Add Request"
   - Name: `1. Overview`
   - Method: `GET`
   - URL: `http://localhost:8080/api/analytics/overview`
   - Click "Save"

3. **Repeat for all 10 endpoints** using the URLs above

4. **Test All:**
   - Select collection → Click "Run" button
   - Click "Run Analytics Dashboard APIs"
   - All requests will execute automatically

---

## Step 5: Verify Backend is Running

### Check if backend is running:
Open browser and visit:
```
http://localhost:8080/api/analytics/overview
```

You should see JSON response like:
```json
{
  "totalUsers": 15,
  "activeUsers": 12,
  "totalTransactions": 132,
  ...
}
```

If you see this, backend is running! ✅

---

## Step 6: Common Issues & Solutions

### ❌ "Could not get any response"
**Problem:** Backend not running  
**Solution:** 
```bash
cd backend
mvn spring-boot:run
```

### ❌ "Connection refused"
**Problem:** Port 8080 not available  
**Solution:** 
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
# Then restart backend
mvn spring-boot:run
```

### ❌ Empty array `[]` in response
**Problem:** Date range doesn't match seed data  
**Solution:** Use broader date range:
```
startDate=2024-01-01&endDate=2025-12-31
```

### ❌ "Port 8080 already in use"
**Problem:** Another instance running  
**Solution:** Stop the other instance or change port in `application-dev.yml`

---

## Quick Reference: All URLs in One Place

Copy these URLs directly into Postman:

```
1. http://localhost:8080/api/analytics/overview

2. http://localhost:8080/api/analytics/transactions/by-status

3. http://localhost:8080/api/analytics/transactions/by-date?startDate=2024-12-18&endDate=2025-01-17

4. http://localhost:8080/api/analytics/revenue/over-time?startDate=2024-12-18&endDate=2025-01-17

5. http://localhost:8080/api/analytics/transactions/by-payment-method?startDate=2024-12-18&endDate=2025-01-17

6. http://localhost:8080/api/analytics/users/top-by-revenue?startDate=2024-12-18&endDate=2025-01-17&limit=10

7. http://localhost:8080/api/analytics/conversion-funnel?startDate=2024-12-18&endDate=2025-01-17

8. http://localhost:8080/api/analytics/transactions/refund-chargeback?startDate=2024-12-18&endDate=2025-01-17

9. http://localhost:8080/api/analytics/users/activity-over-time?startDate=2024-12-18&endDate=2025-01-17

10. http://localhost:8080/api/analytics/transactions/by-hour?startDate=2024-12-18&endDate=2025-01-17
```

---

## Visual Guide: Postman Setup

### Step-by-Step Screenshots Guide:

1. **Open Postman** → Click "New" → "HTTP Request"

2. **Set Method:** Select `GET` from dropdown

3. **Enter URL:** Paste `http://localhost:8080/api/analytics/overview`

4. **Click "Send"**

5. **View Response:** JSON appears in bottom panel

---

## Tips for Better Testing

### ✅ Use Postman Environment Variables

1. Click "Environments" → "Create Environment"
2. Name: `Local Dev`
3. Add variable:
   - Key: `base_url`
   - Value: `http://localhost:8080/api/analytics`
4. Save and select environment
5. Use in requests: `{{base_url}}/overview`

### ✅ Format JSON Response

- Click "Pretty" tab in response section
- JSON will be formatted and colored

### ✅ Save Responses

- Click "Save Response" → "Save as Example"
- Useful for documentation

### ✅ Test Different Date Ranges

Change dates in URL:
- Last 7 days: `startDate=2025-01-11&endDate=2025-01-17`
- Last 30 days: `startDate=2024-12-18&endDate=2025-01-17`
- All time: `startDate=2024-01-01&endDate=2025-12-31`

---

## That's It! 🎉

You're ready to test all APIs in Postman!

**Remember:**
- ✅ Backend must be running (`mvn spring-boot:run`)
- ✅ Use `GET` method for all endpoints
- ✅ Copy URLs exactly as shown above
- ✅ Check response status: Should be `200 OK`
