# Analytics API - cURL Commands

All endpoints are available at `http://localhost:8080/api/analytics`

## 1. Dashboard Overview
Returns key metrics: total users, active users, transactions, revenue, success rate.

```bash
curl -X GET "http://localhost:8080/api/analytics/overview" \
  -H "Accept: application/json"
```

**Pretty print with jq:**
```bash
curl -s -X GET "http://localhost:8080/api/analytics/overview" \
  -H "Accept: application/json" | jq .
```

---

## 2. Daily Transaction Statistics
Returns daily transaction breakdown for a date range.

```bash
curl -X GET "http://localhost:8080/api/analytics/transactions/by-date?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Accept: application/json"
```

**Example (Last 30 days):**
```bash
curl -X GET "http://localhost:8080/api/analytics/transactions/by-date?startDate=2024-12-18&endDate=2025-01-17" \
  -H "Accept: application/json"
```

**Pretty print:**
```bash
curl -s -X GET "http://localhost:8080/api/analytics/transactions/by-date?startDate=2024-12-18&endDate=2025-01-17" \
  -H "Accept: application/json" | jq .
```

---

## 3. Transactions by Status
Returns transaction count breakdown by status (PENDING, SUCCESS, FAILED, CANCELLED).

```bash
curl -X GET "http://localhost:8080/api/analytics/transactions/by-status" \
  -H "Accept: application/json"
```

**Pretty print:**
```bash
curl -s -X GET "http://localhost:8080/api/analytics/transactions/by-status" \
  -H "Accept: application/json" | jq .
```

---

## 4. Revenue Over Time (Line Chart) ⭐ NEW
Returns daily revenue data for line charts (successful payments only).

```bash
curl -X GET "http://localhost:8080/api/analytics/revenue/over-time?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Accept: application/json"
```

**Example (Last 30 days):**
```bash
curl -X GET "http://localhost:8080/api/analytics/revenue/over-time?startDate=2024-12-18&endDate=2025-01-17" \
  -H "Accept: application/json"
```

**Pretty print:**
```bash
curl -s -X GET "http://localhost:8080/api/analytics/revenue/over-time?startDate=2024-12-18&endDate=2025-01-17" \
  -H "Accept: application/json" | jq .
```

---

## 5. Transactions by Payment Method (Pie Chart) ⭐ NEW
Returns payment method breakdown with percentages for pie charts.

```bash
curl -X GET "http://localhost:8080/api/analytics/transactions/by-payment-method?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Accept: application/json"
```

**Example (Last 30 days):**
```bash
curl -X GET "http://localhost:8080/api/analytics/transactions/by-payment-method?startDate=2024-12-18&endDate=2025-01-17" \
  -H "Accept: application/json"
```

**Pretty print:**
```bash
curl -s -X GET "http://localhost:8080/api/analytics/transactions/by-payment-method?startDate=2024-12-18&endDate=2025-01-17" \
  -H "Accept: application/json" | jq .
```

---

## 6. Top Users by Revenue ⭐ NEW
Returns top users ranked by revenue (successful payments only).

```bash
curl -X GET "http://localhost:8080/api/analytics/users/top-by-revenue?startDate=2025-01-01&endDate=2025-01-31&limit=10" \
  -H "Accept: application/json"
```

**Example (Last 30 days, top 10):**
```bash
curl -X GET "http://localhost:8080/api/analytics/users/top-by-revenue?startDate=2024-12-18&endDate=2025-01-17&limit=10" \
  -H "Accept: application/json"
```

**Top 5 users:**
```bash
curl -X GET "http://localhost:8080/api/analytics/users/top-by-revenue?startDate=2024-12-18&endDate=2025-01-17&limit=5" \
  -H "Accept: application/json"
```

**Pretty print:**
```bash
curl -s -X GET "http://localhost:8080/api/analytics/users/top-by-revenue?startDate=2024-12-18&endDate=2025-01-17&limit=10" \
  -H "Accept: application/json" | jq .
```

---

## 7. Conversion Funnel ⭐ NEW
Returns conversion funnel showing transaction progression (PENDING → SUCCESS/FAILED).

```bash
curl -X GET "http://localhost:8080/api/analytics/conversion-funnel?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Accept: application/json"
```

**Example (Last 30 days):**
```bash
curl -X GET "http://localhost:8080/api/analytics/conversion-funnel?startDate=2024-12-18&endDate=2025-01-17" \
  -H "Accept: application/json"
```

**Pretty print:**
```bash
curl -s -X GET "http://localhost:8080/api/analytics/conversion-funnel?startDate=2024-12-18&endDate=2025-01-17" \
  -H "Accept: application/json" | jq .
```

---

## Quick Test Script

Save this as `test-all-endpoints.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api/analytics"
START_DATE="2024-12-18"
END_DATE="2025-01-17"

echo "=== 1. Dashboard Overview ==="
curl -s "$BASE_URL/overview" | jq .

echo -e "\n=== 2. Transactions by Status ==="
curl -s "$BASE_URL/transactions/by-status" | jq .

echo -e "\n=== 3. Daily Transactions (Last 30 days) ==="
curl -s "$BASE_URL/transactions/by-date?startDate=$START_DATE&endDate=$END_DATE" | jq .

echo -e "\n=== 4. Revenue Over Time (Last 30 days) ==="
curl -s "$BASE_URL/revenue/over-time?startDate=$START_DATE&endDate=$END_DATE" | jq .

echo -e "\n=== 5. Transactions by Payment Method (Last 30 days) ==="
curl -s "$BASE_URL/transactions/by-payment-method?startDate=$START_DATE&endDate=$END_DATE" | jq .

echo -e "\n=== 6. Top 10 Users by Revenue (Last 30 days) ==="
curl -s "$BASE_URL/users/top-by-revenue?startDate=$START_DATE&endDate=$END_DATE&limit=10" | jq .

echo -e "\n=== 7. Conversion Funnel (Last 30 days) ==="
curl -s "$BASE_URL/conversion-funnel?startDate=$START_DATE&endDate=$END_DATE" | jq .
```

Make it executable:
```bash
chmod +x test-all-endpoints.sh
./test-all-endpoints.sh
```

---

## Notes

- **Date Format**: All dates must be in `YYYY-MM-DD` format
- **Default Port**: `8080` (change if your application runs on a different port)
- **jq**: Install with `brew install jq` (macOS) or `apt-get install jq` (Linux) for pretty JSON output
- **Date Ranges**: Use dates that match your seed data (check `V3__Seed_test_data.sql` for actual dates)
