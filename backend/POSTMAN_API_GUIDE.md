# Postman API Testing Guide

## Base URL
```
http://localhost:8080/api/analytics
```

## All Available Endpoints

### 1. Dashboard Overview
**GET** `/overview`

**Description:** Returns comprehensive dashboard overview with key metrics.

**Request:**
- Method: `GET`
- URL: `http://localhost:8080/api/analytics/overview`
- Headers: None required

**Expected Response:**
```json
{
  "totalUsers": 15,
  "activeUsers": 12,
  "totalTransactions": 132,
  "successfulTransactions": 114,
  "failedTransactions": 11,
  "totalRevenue": 13813.89,
  "averageTransactionAmount": 131.79,
  "successRate": 86.36
}
```

---

### 2. Transactions by Date Range
**GET** `/transactions/by-date`

**Description:** Returns daily transaction statistics for the specified date range.

**Request:**
- Method: `GET`
- URL: `http://localhost:8080/api/analytics/transactions/by-date?startDate=2024-12-18&endDate=2025-01-17`
- Query Parameters:
  - `startDate` (required): `2024-12-18` (YYYY-MM-DD format)
  - `endDate` (required): `2025-01-17` (YYYY-MM-DD format)

**Expected Response:**
```json
[
  {
    "date": "2025-01-17",
    "totalTransactions": 12,
    "totalAmount": 1250.50,
    "successfulTransactions": 10,
    "successfulAmount": 1100.00,
    "failedTransactions": 2,
    "successRate": 83.33
  }
]
```

---

### 3. Transactions by Status
**GET** `/transactions/by-status`

**Description:** Returns transaction count breakdown by status.

**Request:**
- Method: `GET`
- URL: `http://localhost:8080/api/analytics/transactions/by-status`
- Headers: None required

**Expected Response:**
```json
[
  {
    "status": "SUCCESS",
    "count": 114,
    "percentage": 86.36
  },
  {
    "status": "FAILED",
    "count": 11,
    "percentage": 8.33
  },
  {
    "status": "PENDING",
    "count": 6,
    "percentage": 4.55
  },
  {
    "status": "CANCELLED",
    "count": 1,
    "percentage": 0.76
  }
]
```

---

### 4. Revenue Over Time
**GET** `/revenue/over-time`

**Description:** Returns daily revenue over time for line charts.

**Request:**
- Method: `GET`
- URL: `http://localhost:8080/api/analytics/revenue/over-time?startDate=2024-12-18&endDate=2025-01-17`
- Query Parameters:
  - `startDate` (required): `2024-12-18`
  - `endDate` (required): `2025-01-17`

**Expected Response:**
```json
[
  {
    "date": "2025-01-17",
    "revenue": 1100.50
  },
  {
    "date": "2025-01-16",
    "revenue": 850.25
  }
]
```

---

### 5. Transactions by Payment Method
**GET** `/transactions/by-payment-method`

**Description:** Returns transaction breakdown by payment method (pie chart data).

**Request:**
- Method: `GET`
- URL: `http://localhost:8080/api/analytics/transactions/by-payment-method?startDate=2024-12-18&endDate=2025-01-17`
- Query Parameters:
  - `startDate` (required): `2024-12-18`
  - `endDate` (required): `2025-01-17`

**Expected Response:**
```json
[
  {
    "paymentMethod": "UPI",
    "totalAmount": 8500.75,
    "transactionCount": 45,
    "averageAmount": 188.91,
    "percentage": 61.5
  },
  {
    "paymentMethod": "CREDIT_CARD",
    "totalAmount": 3200.50,
    "transactionCount": 28,
    "averageAmount": 114.30,
    "percentage": 23.2
  }
]
```

---

### 6. Top Users by Revenue
**GET** `/users/top-by-revenue`

**Description:** Returns top users ranked by revenue.

**Request:**
- Method: `GET`
- URL: `http://localhost:8080/api/analytics/users/top-by-revenue?startDate=2024-12-18&endDate=2025-01-17&limit=10`
- Query Parameters:
  - `startDate` (required): `2024-12-18`
  - `endDate` (required): `2025-01-17`
  - `limit` (optional): `10` (default: 10, max: 100)

**Expected Response:**
```json
[
  {
    "userId": 5,
    "userName": "David Wilson",
    "userEmail": "david.wilson@example.com",
    "transactionCount": 15,
    "totalRevenue": 2500.75
  },
  {
    "userId": 2,
    "userName": "Sarah Johnson",
    "userEmail": "sarah.johnson@example.com",
    "transactionCount": 12,
    "totalRevenue": 2100.50
  }
]
```

---

### 7. Conversion Funnel
**GET** `/conversion-funnel`

**Description:** Returns conversion funnel data showing transaction progression.

**Request:**
- Method: `GET`
- URL: `http://localhost:8080/api/analytics/conversion-funnel?startDate=2024-12-18&endDate=2025-01-17`
- Query Parameters:
  - `startDate` (required): `2024-12-18`
  - `endDate` (required): `2025-01-17`

**Expected Response:**
```json
[
  {
    "stage": "PENDING",
    "count": 6,
    "percentage": 4.55
  },
  {
    "stage": "SUCCESS",
    "count": 114,
    "percentage": 86.36
  },
  {
    "stage": "FAILED",
    "count": 11,
    "percentage": 8.33
  },
  {
    "stage": "CANCELLED",
    "count": 1,
    "percentage": 0.76
  }
]
```

---

### 8. Refund & Chargeback Analysis
**GET** `/transactions/refund-chargeback`

**Description:** Returns refund and chargeback analysis.

**Request:**
- Method: `GET`
- URL: `http://localhost:8080/api/analytics/transactions/refund-chargeback?startDate=2024-12-18&endDate=2025-01-17`
- Query Parameters:
  - `startDate` (required): `2024-12-18`
  - `endDate` (required): `2025-01-17`

**Expected Response:**
```json
[
  {
    "transactionType": "CHARGEBACK",
    "transactionCount": 5,
    "totalAmount": 450.00,
    "averageAmount": 90.00,
    "percentageOfTotal": 3.79
  },
  {
    "transactionType": "REFUND",
    "transactionCount": 12,
    "totalAmount": 1200.50,
    "averageAmount": 100.04,
    "percentageOfTotal": 9.09
  }
]
```

---

### 9. User Activity Over Time
**GET** `/users/activity-over-time`

**Description:** Returns user activity statistics over time.

**Request:**
- Method: `GET`
- URL: `http://localhost:8080/api/analytics/users/activity-over-time?startDate=2024-12-18&endDate=2025-01-17`
- Query Parameters:
  - `startDate` (required): `2024-12-18`
  - `endDate` (required): `2025-01-17`

**Expected Response:**
```json
[
  {
    "date": "2025-01-01",
    "newUsers": 3,
    "activeUsers": 2,
    "totalUsers": 15
  },
  {
    "date": "2025-01-02",
    "newUsers": 5,
    "activeUsers": 4,
    "totalUsers": 20
  }
]
```

---

### 10. Hourly Transaction Statistics
**GET** `/transactions/by-hour`

**Description:** Returns hourly transaction statistics (heatmap data).

**Request:**
- Method: `GET`
- URL: `http://localhost:8080/api/analytics/transactions/by-hour?startDate=2024-12-18&endDate=2025-01-17`
- Query Parameters:
  - `startDate` (required): `2024-12-18`
  - `endDate` (required): `2025-01-17`

**Expected Response:**
```json
[
  {
    "hour": 0,
    "transactionCount": 5,
    "totalAmount": 450.00,
    "successfulTransactions": 4,
    "successfulAmount": 400.00,
    "successRate": 80.0
  },
  {
    "hour": 1,
    "transactionCount": 3,
    "totalAmount": 250.50,
    "successfulTransactions": 3,
    "successfulAmount": 250.50,
    "successRate": 100.0
  },
  {
    "hour": 14,
    "transactionCount": 45,
    "totalAmount": 5500.75,
    "successfulTransactions": 42,
    "successfulAmount": 5200.00,
    "successRate": 93.33
  }
]
```

---

## Postman Setup Instructions

### Step 1: Import Collection (Optional)
1. Open Postman
2. Click "Import" button
3. Create a new collection named "Analytics Dashboard APIs"
4. Add all endpoints manually using the URLs above

### Step 2: Set Environment Variables (Recommended)
Create a Postman Environment with:
- Variable: `base_url`
- Value: `http://localhost:8080/api/analytics`

Then use `{{base_url}}/overview` in your requests.

### Step 3: Test Endpoints
1. Start with `/overview` (no parameters needed)
2. Then test endpoints with date ranges
3. Use date range: `2024-12-18` to `2025-01-17` (or adjust based on your seed data)

### Step 4: Verify Application is Running
Before testing, ensure:
- Spring Boot application is running on port 8080
- Check logs for: "Started AnalyticsDashboardApplication"
- Test health: `GET http://localhost:8080/actuator/health` (if actuator is enabled)

---

## Common Issues

### Empty Arrays Returned
- **Cause:** Date range doesn't match seed data dates
- **Solution:** Use broader date range like `2024-01-01` to `2025-12-31`

### Connection Refused
- **Cause:** Application not running
- **Solution:** Run `mvn spring-boot:run` in the backend directory

### Port Already in Use
- **Cause:** Another process using port 8080
- **Solution:** Kill the process or change port in `application-dev.yml`

---

## Quick Test Scripts

### Test Overview (No Parameters)
```
GET http://localhost:8080/api/analytics/overview
```

### Test All Date-Based Endpoints
Use this date range for all endpoints:
```
startDate=2024-12-18
endDate=2025-01-17
```

### Test Top Users (With Limit)
```
GET http://localhost:8080/api/analytics/users/top-by-revenue?startDate=2024-12-18&endDate=2025-01-17&limit=5
```
