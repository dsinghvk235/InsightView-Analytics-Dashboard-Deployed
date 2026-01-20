# API Verification Guide - Without UI

This guide explains how to verify the analytics APIs are working correctly without using any UI.

---

## Prerequisites

1. **Start the Application:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Application will start on `http://localhost:8080`

2. **Verify Application is Running:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```
   Expected: `{"status":"UP"}`

---

## API Endpoints

### 1. GET /api/analytics/overview

**Purpose:** Dashboard overview with key metrics

**Request:**
```bash
curl -X GET "http://localhost:8080/api/analytics/overview" \
  -H "Accept: application/json"
```

**Expected Response (200 OK):**
```json
{
  "totalUsers": 15,
  "activeUsers": 12,
  "totalTransactions": 150,
  "successfulTransactions": 110,
  "failedTransactions": 15,
  "totalRevenue": 15000.00,
  "averageTransactionAmount": 136.36,
  "successRate": 73.33
}
```

**Verification Checklist:**
- ✅ Status code: 200
- ✅ Response contains all fields
- ✅ Numbers are positive (or zero)
- ✅ successRate is between 0-100
- ✅ Check logs for execution time

**Empty Dataset Test:**
If no data exists, should return:
```json
{
  "totalUsers": 0,
  "activeUsers": 0,
  "totalTransactions": 0,
  "successfulTransactions": 0,
  "failedTransactions": 0,
  "totalRevenue": 0.00,
  "averageTransactionAmount": 0.00,
  "successRate": 0.0
}
```

---

### 2. GET /api/analytics/transactions/by-date

**Purpose:** Daily transaction statistics for date range

**Request:**
```bash
curl -X GET "http://localhost:8080/api/analytics/transactions/by-date?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Accept: application/json"
```

**Expected Response (200 OK):**
```json
[
  {
    "date": "2025-01-15",
    "totalTransactions": 10,
    "totalAmount": 1500.00,
    "successfulTransactions": 8,
    "successfulAmount": 1200.00,
    "failedTransactions": 2,
    "successRate": 80.0
  },
  {
    "date": "2025-01-14",
    "totalTransactions": 12,
    "totalAmount": 1800.00,
    "successfulTransactions": 10,
    "successfulAmount": 1500.00,
    "failedTransactions": 2,
    "successRate": 83.33
  }
]
```

**Verification Checklist:**
- ✅ Status code: 200
- ✅ Returns array of daily statistics
- ✅ Dates are in YYYY-MM-DD format
- ✅ Amounts are positive (or zero)
- ✅ successRate calculated correctly
- ✅ Dates are in descending order (most recent first)

**Edge Cases to Test:**

1. **Invalid Date Range (endDate before startDate):**
   ```bash
   curl -X GET "http://localhost:8080/api/analytics/transactions/by-date?startDate=2025-01-31&endDate=2025-01-01"
   ```
   Expected: 400 Bad Request

2. **Missing Parameters:**
   ```bash
   curl -X GET "http://localhost:8080/api/analytics/transactions/by-date?startDate=2025-01-01"
   ```
   Expected: 400 Bad Request

3. **No Data in Date Range:**
   ```bash
   curl -X GET "http://localhost:8080/api/analytics/transactions/by-date?startDate=2020-01-01&endDate=2020-01-31"
   ```
   Expected: 200 OK with empty array `[]`

4. **Invalid Date Format:**
   ```bash
   curl -X GET "http://localhost:8080/api/analytics/transactions/by-date?startDate=invalid&endDate=2025-01-31"
   ```
   Expected: 400 Bad Request

---

### 3. GET /api/analytics/transactions/by-status

**Purpose:** Transaction count breakdown by status

**Request:**
```bash
curl -X GET "http://localhost:8080/api/analytics/transactions/by-status" \
  -H "Accept: application/json"
```

**Expected Response (200 OK):**
```json
[
  {
    "status": "SUCCESS",
    "count": 110,
    "percentage": 73.33
  },
  {
    "status": "FAILED",
    "count": 15,
    "percentage": 10.0
  },
  {
    "status": "PENDING",
    "count": 8,
    "percentage": 5.33
  },
  {
    "status": "CANCELLED",
    "count": 2,
    "percentage": 1.33
  }
]
```

**Verification Checklist:**
- ✅ Status code: 200
- ✅ Returns array of status statistics
- ✅ All statuses present (SUCCESS, FAILED, PENDING, CANCELLED)
- ✅ Percentages sum to ~100% (allowing for rounding)
- ✅ Counts are non-negative integers
- ✅ Percentages are between 0-100

**Empty Dataset Test:**
If no transactions exist, should return:
```json
[]
```

---

## Using curl with Pretty Print (jq)

For better readability, use `jq` to format JSON:

```bash
# Install jq (macOS)
brew install jq

# Use with curl
curl -X GET "http://localhost:8080/api/analytics/overview" | jq
```

---

## Using HTTPie (Alternative to curl)

**Install HTTPie:**
```bash
# macOS
brew install httpie

# Or pip
pip install httpie
```

**Examples:**
```bash
# Overview
http GET http://localhost:8080/api/analytics/overview

# Transactions by date
http GET http://localhost:8080/api/analytics/transactions/by-date \
  startDate==2025-01-01 \
  endDate==2025-01-31

# Transactions by status
http GET http://localhost:8080/api/analytics/transactions/by-status
```

---

## Using Postman

1. **Create Collection:**
   - New Collection: "Analytics Dashboard APIs"

2. **Add Requests:**

   **Request 1: Overview**
   - Method: GET
   - URL: `http://localhost:8080/api/analytics/overview`
   - Headers: `Accept: application/json`

   **Request 2: Transactions by Date**
   - Method: GET
   - URL: `http://localhost:8080/api/analytics/transactions/by-date`
   - Params:
     - `startDate`: 2025-01-01
     - `endDate`: 2025-01-31

   **Request 3: Transactions by Status**
   - Method: GET
   - URL: `http://localhost:8080/api/analytics/transactions/by-status`
   - Headers: `Accept: application/json`

3. **Run Collection:**
   - Click "Run" on collection
   - All requests execute sequentially
   - View responses and status codes

---

## Verification Script (Bash)

Create a verification script:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api/analytics"

echo "=== Testing Analytics APIs ==="
echo ""

echo "1. Testing /overview..."
curl -s -X GET "$BASE_URL/overview" | jq .
echo ""

echo "2. Testing /transactions/by-date..."
curl -s -X GET "$BASE_URL/transactions/by-date?startDate=2025-01-01&endDate=2025-01-31" | jq .
echo ""

echo "3. Testing /transactions/by-status..."
curl -s -X GET "$BASE_URL/transactions/by-status" | jq .
echo ""

echo "=== Tests Complete ==="
```

Save as `verify-apis.sh`, make executable:
```bash
chmod +x verify-apis.sh
./verify-apis.sh
```

---

## Logging Verification

### Check Application Logs

**Location:** `backend/logs/analytics-dashboard.log`

**What to Look For:**

1. **Request Logging:**
   ```
   INFO  - GET /api/analytics/overview - Request received
   ```

2. **Query Execution Logging:**
   ```
   INFO  - GET /api/analytics/overview - Query executed successfully in 45ms. 
           Users: 15, Transactions: 150, Revenue: 15000.00
   ```

3. **Empty Dataset Logging:**
   ```
   INFO  - GET /api/analytics/transactions/by-date - Query executed in 12ms. 
           No transactions found for date range: 2020-01-01 to 2020-01-31
   ```

4. **Error Logging:**
   ```
   ERROR - GET /api/analytics/overview - Error after 50ms: Database connection failed
   ```

### Real-time Log Monitoring

**Tail logs while testing:**
```bash
tail -f backend/logs/analytics-dashboard.log
```

**Filter for API requests:**
```bash
tail -f backend/logs/analytics-dashboard.log | grep "GET /api/analytics"
```

---

## Performance Verification

### Check Response Times

All APIs should respond in <300ms (KPI requirement).

**Using curl with timing:**
```bash
curl -w "\nTime: %{time_total}s\n" -X GET "http://localhost:8080/api/analytics/overview"
```

**Expected:**
- Overview: <100ms
- Transactions by date: <200ms
- Transactions by status: <100ms

---

## Data Validation

### Verify Data Consistency

1. **Overview Metrics:**
   - `totalTransactions` should match sum of all status counts
   - `successRate` should be: `(successfulTransactions / totalTransactions) * 100`

2. **Date Range:**
   - All dates in response should be within requested range
   - Dates should be in descending order

3. **Status Percentages:**
   - Sum of all percentages should be ~100% (allowing for rounding)

**Validation Script:**
```bash
# Get overview
OVERVIEW=$(curl -s "http://localhost:8080/api/analytics/overview")

# Extract values
TOTAL=$(echo $OVERVIEW | jq '.totalTransactions')
SUCCESS=$(echo $OVERVIEW | jq '.successfulTransactions')
RATE=$(echo $OVERVIEW | jq '.successRate')

# Calculate expected rate
EXPECTED_RATE=$(echo "scale=2; ($SUCCESS / $TOTAL) * 100" | bc)

echo "Total Transactions: $TOTAL"
echo "Successful: $SUCCESS"
echo "Success Rate (API): $RATE"
echo "Success Rate (Calculated): $EXPECTED_RATE"
```

---

## Error Handling Verification

### Test Error Scenarios

1. **Invalid Date Format:**
   ```bash
   curl -X GET "http://localhost:8080/api/analytics/transactions/by-date?startDate=invalid"
   ```
   Expected: 400 Bad Request

2. **Database Connection Error:**
   - Stop database
   - Make API call
   - Expected: 500 Internal Server Error
   - Check logs for error details

3. **Missing Required Parameters:**
   ```bash
   curl -X GET "http://localhost:8080/api/analytics/transactions/by-date"
   ```
   Expected: 400 Bad Request

---

## Summary

### Quick Verification Checklist

- [ ] Application starts successfully
- [ ] Health endpoint returns UP
- [ ] All 3 API endpoints return 200 OK
- [ ] Response JSON is valid
- [ ] Empty datasets return empty arrays or zero values
- [ ] Logs show request and execution times
- [ ] Response times are <300ms
- [ ] Error handling works (400 for bad requests, 500 for server errors)
- [ ] Data is consistent (percentages sum correctly, etc.)

### Success Criteria

✅ **All APIs return valid JSON**  
✅ **Empty datasets handled gracefully**  
✅ **Logging shows request and execution times**  
✅ **Response times meet <300ms KPI**  
✅ **Error handling works correctly**  
✅ **Data is consistent and accurate**

---

## Troubleshooting

### Common Issues

1. **Connection Refused:**
   - Check if application is running: `curl http://localhost:8080/actuator/health`
   - Check port 8080 is not in use

2. **404 Not Found:**
   - Verify endpoint path: `/api/analytics/overview`
   - Check `@RequestMapping` in controller

3. **500 Internal Server Error:**
   - Check application logs
   - Verify database is running
   - Check Flyway migrations completed

4. **Empty Responses:**
   - Verify seed data migration (V3) ran successfully
   - Check database has data: `SELECT COUNT(*) FROM transactions;`

---

**All APIs are now ready for testing without UI!**
