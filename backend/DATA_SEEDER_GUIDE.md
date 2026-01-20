# Large-Scale Data Seeder Guide

## Overview

The `DataSeederService` generates realistic large-scale test data for performance testing and analytics validation.

**Generated Data:**
- **5,000+ users** with activity distribution
- **500,000+ transactions** with weighted randomness
- Realistic Indian payment patterns (UPI, payment providers)
- Proper date distributions (users: 6 months, transactions: 90 days)

---

## How to Enable

### Step 1: Enable in Configuration

Edit `application-dev.yml` or `application.yml`:

```yaml
app:
  data-seeder:
    enabled: true  # Set to true to enable
    user-count: 5000
    transaction-count: 500000
    batch-size: 1000
```

### Step 2: Start Application

```bash
cd backend
mvn spring-boot:run
```

The seeder will run automatically after Flyway migrations complete.

---

## Configuration Options

| Property | Default | Description |
|----------|---------|-------------|
| `app.data-seeder.enabled` | `false` | Enable/disable data seeding |
| `app.data-seeder.user-count` | `5000` | Number of users to generate |
| `app.data-seeder.transaction-count` | `500000` | Number of transactions to generate |
| `app.data-seeder.batch-size` | `1000` | Batch size for JPA inserts |

---

## Data Distribution

### User Activity Distribution

| Activity Level | Percentage | Description |
|----------------|------------|-------------|
| **High Activity** | 10% | Many transactions (power users) |
| **Normal Activity** | 70% | Average transaction frequency |
| **Low Activity** | 15% | Few transactions |
| **New Users** | 5% | Created in last 30 days, very few transactions |

### User Creation Dates
- Spread over **last 6 months**
- High/Normal/Low users: Distributed across 6 months
- New users: Created in last 30 days only

### Transaction Distribution

#### Status Distribution (Weighted)
- **SUCCESS:** 75%
- **FAILED:** 15%
- **PENDING:** 8%
- **CANCELLED:** 2%

#### Type Distribution (Weighted)
- **PAYMENT:** 85%
- **REFUND:** 10%
- **CHARGEBACK:** 3%
- **FEE:** 2%

#### Payment Method Distribution (India-First)
- **UPI:** 50%
- **CREDIT_CARD:** 20%
- **DEBIT_CARD:** 15%
- **NET_BANKING:** 8%
- **WALLET:** 5%
- **Others:** 2%

#### Transaction Dates
- Spread over **last 90 days**
- Slight bias towards recent dates (realistic pattern)
- Distinct timestamps (no duplicates)

#### Amount Distribution
- **Payments:** 70% between ₹100-₹5,000, 20% between ₹5,000-₹50,000, 10% larger
- **Refunds:** Typically ₹50-₹5,000
- **Fees:** Small amounts ₹5-₹500
- **Chargebacks:** Similar to payment amounts

---

## Features

### ✅ Memory Efficient
- Batch processing (configurable batch size)
- `flush()` and `clear()` after each batch
- Prevents OutOfMemoryError

### ✅ Realistic Data
- Indian names and phone numbers
- Realistic email addresses
- Proper payment provider mapping (PhonePe, GooglePay, etc.)
- Indian failure reasons (NPCI_TIMEOUT, INSUFFICIENT_FUNDS, etc.)

### ✅ Weighted Randomness
- Transaction statuses follow realistic success rates
- Payment methods reflect Indian market (UPI dominance)
- User activity levels affect transaction frequency

### ✅ Performance Optimized
- JPA batch inserts configured
- Progress logging every 10 batches
- Execution time tracking

---

## Usage Examples

### Example 1: Default Configuration (5,000 users, 500,000 transactions)

```yaml
app:
  data-seeder:
    enabled: true
```

### Example 2: Smaller Dataset for Testing

```yaml
app:
  data-seeder:
    enabled: true
    user-count: 1000
    transaction-count: 100000
    batch-size: 500
```

### Example 3: Large Dataset for Performance Testing

```yaml
app:
  data-seeder:
    enabled: true
    user-count: 10000
    transaction-count: 1000000
    batch-size: 2000
```

---

## Execution Time Estimates

| Users | Transactions | Estimated Time |
|-------|--------------|----------------|
| 1,000 | 100,000 | ~2-3 minutes |
| 5,000 | 500,000 | ~10-15 minutes |
| 10,000 | 1,000,000 | ~20-30 minutes |

*Times vary based on hardware and database performance*

---

## Logging Output

The seeder provides detailed progress logging:

```
================================================================================
Starting large-scale data seeding...
Users: 5000, Transactions: 500000, Batch Size: 1000
================================================================================
Generating 5000 users...
Saved users: 1000/5000 (20%)
Saved users: 2000/5000 (40%)
...
Generated 5000 users in 45 seconds
Generating 500000 transactions...
Generated transactions: 10000/500000 (2%)
Generated transactions: 20000/500000 (4%)
...
Generated 500000 transactions in 720 seconds
================================================================================
Data seeding completed successfully in 765 seconds
Users created: 5000
Transactions created: 500000
================================================================================
```

---

## Verification

After seeding, verify the data:

### Check User Count
```sql
SELECT COUNT(*) FROM users;
-- Expected: 5000 (or configured amount)
```

### Check Transaction Count
```sql
SELECT COUNT(*) FROM transactions;
-- Expected: 500000 (or configured amount)
```

### Check Activity Distribution
```sql
-- Users created in last 30 days (new users)
SELECT COUNT(*) FROM users 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Users created 6 months ago (high activity)
SELECT COUNT(*) FROM users 
WHERE created_at <= CURRENT_DATE - INTERVAL '5 months';
```

### Check Transaction Distribution
```sql
-- Status distribution
SELECT status, COUNT(*) as count, 
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM transactions), 2) as percentage
FROM transactions
GROUP BY status
ORDER BY count DESC;

-- Payment method distribution
SELECT payment_method, COUNT(*) as count,
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM transactions), 2) as percentage
FROM transactions
GROUP BY payment_method
ORDER BY count DESC;
```

---

## Important Notes

### ⚠️ Warnings

1. **Data Overwrite:** The seeder will add data to existing tables. It does NOT delete existing data.
2. **Execution Time:** Large datasets take significant time (10-30 minutes).
3. **Database Size:** 500k transactions will increase database size significantly.
4. **Memory Usage:** Ensure sufficient heap memory for large batches.

### ✅ Best Practices

1. **Test First:** Start with smaller counts (1000 users, 100k transactions) to verify.
2. **Monitor Progress:** Watch logs for progress updates.
3. **Database Backup:** Backup database before running on production-like data.
4. **PostgreSQL Recommended:** For 500k+ transactions, PostgreSQL performs better than H2.

### 🔧 Troubleshooting

#### OutOfMemoryError
- Reduce `batch-size` (try 500 or 250)
- Increase JVM heap: `-Xmx2g`

#### Slow Performance
- Increase `batch-size` (try 2000)
- Use PostgreSQL instead of H2
- Check database indexes are created

#### Seeder Not Running
- Verify `app.data-seeder.enabled=true`
- Check logs for error messages
- Ensure Flyway migrations completed successfully

---

## Technical Details

### Batch Processing Strategy

1. **Users:** Generated in memory, then batch inserted
2. **Transactions:** Generated and inserted in batches of `batch-size`
3. **Memory Management:** `entityManager.flush()` and `clear()` after each batch
4. **Transaction Management:** Uses `@Transactional` for data integrity

### Reflection-Based Field Setting

Due to Lombok processing issues, the seeder uses reflection to set entity fields:
- Works with or without Lombok processing
- Handles private fields
- Falls back to setter methods if available

### Date Generation

- **Users:** Random dates within 6-month window
- **Transactions:** Exponential distribution (bias towards recent dates)
- **Distinct Timestamps:** Ensures no duplicate `created_at` values

---

## Next Steps

After seeding:

1. **Verify Data:** Run verification queries above
2. **Test APIs:** Test all 10 analytics endpoints with real data
3. **Performance Testing:** Measure API response times with 500k+ transactions
4. **Day 4:** Proceed with optimized SQL queries for performance validation

---

## Files Created

- ✅ `DataSeederService.java` - Main seeder implementation
- ✅ `DataSeederProperties.java` - Configuration properties
- ✅ `DATA_SEEDER_GUIDE.md` - This documentation

---

**Status:** ✅ Ready to use  
**Last Updated:** January 18, 2025
