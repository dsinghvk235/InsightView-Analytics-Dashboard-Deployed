# Repository Layer Design - Query Choices Explained

## Overview

The repository layer is designed for **read-only analytics queries** with **performance optimization** as the primary goal. All queries leverage database indexes and use projections to minimize data transfer.

---

## Design Principles

### 1. **Read-Only Focus**
- No `save()`, `delete()`, or `update()` methods exposed
- All queries are SELECT-only
- Stateless operations for analytics

### 2. **Performance Over Generic CRUD**
- Custom queries instead of generic `findAll()`
- Projections instead of full entity loading
- Native queries for complex aggregations
- Index-optimized query patterns

### 3. **Projections for Efficiency**
- Only select needed columns
- Reduce memory footprint
- Faster query execution
- Better for large datasets (500k+ transactions)

---

## Query Choices Explained

### UserRepository Queries

#### 1. `findByEmail(String email)`
- **Why:** Fast user lookup for authentication
- **Index Used:** `idx_users_email`
- **Performance:** O(log n) - index lookup
- **Use Case:** User login, user profile lookup

#### 2. `findByPhoneNumber(String phoneNumber)`
- **Why:** India-first identity (mobile-first)
- **Index Used:** `idx_users_phone_number` (partial index)
- **Performance:** O(log n) - index lookup
- **Use Case:** Phone-based authentication, user lookup

#### 3. `countByStatus(UserStatus status)`
- **Why:** Active user count for dashboard
- **Index Used:** `idx_users_status`
- **Performance:** Index scan, fast count
- **Use Case:** Dashboard overview, user statistics

#### 4. `countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate)`
- **Why:** User growth analytics over time
- **Index Used:** `idx_users_created_at`
- **Performance:** Index range scan
- **Use Case:** User registration trends, growth metrics

#### 5. `findActiveUsersByDateRange(...)`
- **Why:** Active users registered in date range
- **Index Used:** `idx_users_status_created_at` (composite)
- **Performance:** Composite index covers both filters
- **Use Case:** Active user growth, recent registrations

#### 6. `getUserCountByStatus()`
- **Why:** User status breakdown for analytics
- **Index Used:** `idx_users_status`
- **Performance:** Index scan with grouping
- **Use Case:** User status distribution chart

---

### TransactionRepository Queries

#### 1. **Date Range Queries (Most Critical)**

##### `findByCreatedAtBetweenOrderByCreatedAtDesc(...)`
- **Why:** Time-series analysis foundation
- **Index Used:** `idx_transactions_created_at` (DESC)
- **Performance:** Index range scan, already sorted
- **Use Case:** Transaction history, date range filters
- **Query Pattern:** `WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC`

##### `findSuccessfulTransactionsByDateRange(...)`
- **Why:** Revenue calculations (only successful transactions)
- **Index Used:** `idx_transactions_status_created_at` (composite)
- **Performance:** Composite index covers status + date filter
- **Use Case:** Revenue analytics, successful transaction trends
- **Query Pattern:** `WHERE status = 'SUCCESS' AND created_at >= ? AND created_at <= ?`

##### `findByUserIdAndDateRange(...)`
- **Why:** User transaction history with date filters
- **Index Used:** `idx_transactions_user_created_at` (composite)
- **Performance:** Composite index covers user + date filter
- **Use Case:** User activity timeline, user transaction history

**Why Native Queries for Aggregations:**
- Database-level aggregation is faster than Java-level
- SUM, COUNT, AVG are optimized in PostgreSQL
- Reduces data transfer (only aggregated results)
- Better for large datasets

#### 2. **Aggregation Queries (Projections)**

##### `getTotalAmountByDateRange(...)`
- **Why:** Total revenue for date range
- **Index Used:** `idx_transactions_created_at`
- **Performance:** Index scan + aggregation
- **Returns:** Total amount and transaction count
- **Use Case:** Dashboard overview, revenue summary

##### `getTransactionAmountByDateRangeGrouped(...)`
- **Why:** Daily revenue trends (for charts)
- **Index Used:** `idx_transactions_created_at`
- **Performance:** Index scan + GROUP BY DATE()
- **Returns:** Daily breakdown (date, amount, count)
- **Use Case:** Daily revenue chart, time-series visualization
- **Projection:** `TransactionAmountByDateRange` - only 3 columns

##### `getTransactionCountByStatus()`
- **Why:** Success rate calculations
- **Index Used:** `idx_transactions_status`
- **Performance:** Index scan + grouping
- **Returns:** Status and count pairs
- **Use Case:** Success rate metrics, status breakdown chart
- **Projection:** `TransactionCountByStatus` - only 2 columns

##### `getTransactionAmountByPaymentMethod(...)`
- **Why:** Payment method analytics and market share
- **Index Used:** `idx_transactions_payment_method`
- **Performance:** Index scan + aggregation
- **Returns:** Payment method, total amount, count, average
- **Use Case:** Payment method performance, market share analysis
- **Projection:** `TransactionAmountByPaymentMethod` - only 4 columns

##### `getDailyTransactionStats(...)`
- **Why:** Comprehensive daily metrics for dashboard
- **Index Used:** `idx_transactions_created_at` + `idx_transactions_status`
- **Performance:** Index scan + conditional aggregation
- **Returns:** Daily stats (total, successful, failed)
- **Use Case:** Daily analytics dashboard, comprehensive metrics
- **Projection:** `DailyTransactionStats` - only 6 columns

#### 3. **Advanced Analytics Queries**

##### `getTotalRevenue(...)`
- **Why:** Revenue calculation (successful payments only)
- **Index Used:** `idx_transactions_status_created_at`
- **Performance:** Composite index + SUM aggregation
- **Filters:** `status = 'SUCCESS' AND type = 'PAYMENT'`
- **Use Case:** Revenue metrics, excludes refunds and fees

##### `getSuccessRate(...)`
- **Why:** Payment success rate percentage
- **Index Used:** `idx_transactions_status`
- **Performance:** Index scan + conditional count
- **Returns:** Success rate as percentage
- **Use Case:** Payment health metrics, success rate monitoring

##### `getAverageTransactionAmount(...)`
- **Why:** Average order value (AOV) analytics
- **Index Used:** `idx_transactions_created_at`
- **Performance:** Index scan + AVG aggregation
- **Filters:** Only successful transactions
- **Use Case:** AOV trends, transaction value analysis

##### `getTransactionCountByPaymentMethodAndStatus(...)`
- **Why:** Detailed payment method performance
- **Index Used:** `idx_transactions_payment_method` + `idx_transactions_status`
- **Performance:** Index scans + multi-column grouping
- **Returns:** Breakdown by payment method and status
- **Use Case:** Payment method success rates, detailed analytics

---

## Why Projections?

### Performance Benefits

1. **Reduced Data Transfer:**
   - Full entity: ~500 bytes per transaction
   - Projection: ~50 bytes per result
   - **10x reduction** in data transfer

2. **Faster Query Execution:**
   - Database only selects needed columns
   - Less I/O from disk
   - Faster network transfer

3. **Lower Memory Usage:**
   - No entity hydration overhead
   - No lazy loading issues
   - Better for large result sets

### Example Comparison

**Without Projection (Full Entity):**
```java
List<Transaction> transactions = repository.findByCreatedAtBetween(...);
// Loads: id, user (with join), amount, currency, type, status, 
//        paymentMethod, createdAt, updatedAt
// Memory: ~500 bytes × 1000 transactions = 500KB
```

**With Projection:**
```java
List<TransactionAmountByDateRange> stats = repository.getTransactionAmountByDateRangeGrouped(...);
// Loads: date, totalAmount, transactionCount
// Memory: ~50 bytes × 30 days = 1.5KB
// **333x less memory!**
```

---

## Why Native Queries?

### When to Use Native Queries

1. **Complex Aggregations:**
   - SUM, COUNT, AVG with GROUP BY
   - Conditional aggregations (CASE WHEN)
   - Date functions (DATE(), EXTRACT())

2. **Performance Critical:**
   - Database-level aggregation is faster
   - PostgreSQL query optimizer handles it
   - Better for large datasets

3. **Index Optimization:**
   - Can explicitly use specific indexes
   - Better query plan control
   - Optimized for analytics patterns

### When NOT to Use Native Queries

1. **Simple Filters:**
   - Use method name queries (`findByStatus`)
   - Spring Data JPA handles it efficiently
   - More maintainable

2. **Entity Loading:**
   - Use JPQL for entity queries
   - Better type safety
   - Easier to maintain

---

## Index Usage Strategy

### Composite Indexes

**Why Composite Indexes:**
- Cover multiple WHERE clauses
- Avoid index merge operations
- Faster query execution

**Example:**
```sql
-- Query: WHERE status = 'SUCCESS' AND created_at >= ?
-- Index: idx_transactions_status_created_at (composite)
-- Performance: Single index scan (fast)
```

**Without Composite Index:**
```sql
-- Would need: idx_transactions_status + idx_transactions_created_at
-- Performance: Index merge (slower)
```

### Index Selection

1. **Time-Based Queries:** `idx_transactions_created_at`
2. **Status Filters:** `idx_transactions_status`
3. **Status + Date:** `idx_transactions_status_created_at` (composite)
4. **User + Date:** `idx_transactions_user_created_at` (composite)
5. **Payment Method:** `idx_transactions_payment_method`

---

## Query Performance Targets

With 500k+ transactions:

| Query Type | Target | Index Used |
|------------|--------|------------|
| Date range (simple) | <50ms | `idx_transactions_created_at` |
| Status + date filter | <100ms | `idx_transactions_status_created_at` |
| Aggregation (SUM/COUNT) | <200ms | Multiple indexes |
| User + date filter | <50ms | `idx_transactions_user_created_at` |
| Payment method analytics | <150ms | `idx_transactions_payment_method` |

---

## Best Practices Applied

1. ✅ **Read-Only:** No write operations
2. ✅ **Index-Optimized:** All queries use indexes
3. ✅ **Projections:** Only select needed columns
4. ✅ **Native Queries:** For complex aggregations
5. ✅ **Method Names:** For simple filters
6. ✅ **Performance First:** Optimized for analytics
7. ✅ **Scalable:** Works with 500k+ transactions

---

## Summary

The repository layer is designed for **analytics performance** with:
- **Projections** for efficiency (10x less data transfer)
- **Native queries** for complex aggregations
- **Index-optimized** query patterns
- **Read-only** operations
- **Scalable** design (500k+ transactions)

All queries are optimized to meet the **<300ms KPI latency** requirement.
