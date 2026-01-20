# Flyway Migrations - Index Strategy

## Migration Files

### V1__Create_users_table.sql
Creates the `users` table with:
- Primary key: `id` (BIGSERIAL)
- Unique constraint: `email`
- Check constraints for enum values
- 5 indexes optimized for analytics queries

### V2__Create_transactions_table.sql
Creates the `transactions` table with:
- Primary key: `id` (BIGSERIAL)
- Foreign key: `user_id` → `users(id)`
- Check constraints for enum values and business rules
- 10 indexes optimized for analytics queries

## Index Strategy Explanation

### Users Table Indexes

#### 1. `idx_users_email`
- **Purpose**: Fast email lookup (authentication, user search)
- **Query Pattern**: `WHERE email = ?`
- **Why**: Email is unique and frequently used for login/user lookup

#### 2. `idx_users_status`
- **Purpose**: Filter users by account status
- **Query Pattern**: `WHERE status = 'ACTIVE'`
- **Why**: Common analytics query to count active users, filter dashboard by status

#### 3. `idx_users_role`
- **Purpose**: Filter users by role (permissions, role-based analytics)
- **Query Pattern**: `WHERE role = 'USER'`
- **Why**: Role-based access control and role-specific analytics

#### 4. `idx_users_created_at`
- **Purpose**: Time-based queries (user registration trends)
- **Query Pattern**: `WHERE created_at BETWEEN ? AND ?`
- **Why**: Critical for user growth analytics, new user registrations over time
- **Note**: DESC order for most recent first (common dashboard pattern)

#### 5. `idx_users_status_created_at` (Composite)
- **Purpose**: Filter by status AND date range (common combined query)
- **Query Pattern**: `WHERE status = 'ACTIVE' AND created_at >= ?`
- **Why**: Very common analytics pattern - active users registered in last N days

### Transactions Table Indexes

#### 1. `idx_transactions_user_id`
- **Purpose**: Fast joins with users table and user-specific queries
- **Query Pattern**: `WHERE user_id = ?` or `JOIN users ON transactions.user_id = users.id`
- **Why**: Most critical for joins, user transaction history queries

#### 2. `idx_transactions_created_at`
- **Purpose**: Time-based queries (MOST CRITICAL for analytics)
- **Query Pattern**: `WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC`
- **Why**: Essential for transaction volume over time, date range filters, time-series analysis
- **Note**: DESC for most recent first (dashboard default)

#### 3. `idx_transactions_status`
- **Purpose**: Filter transactions by status
- **Query Pattern**: `WHERE status = 'SUCCESS'`
- **Why**: Success rate calculations, filter by transaction status in dashboards

#### 4. `idx_transactions_type`
- **Purpose**: Filter transactions by type
- **Query Pattern**: `WHERE type = 'PAYMENT'`
- **Why**: Revenue analysis (exclude refunds), transaction type breakdown

#### 5. `idx_transactions_payment_method`
- **Purpose**: Filter by payment method
- **Query Pattern**: `WHERE payment_method = 'CREDIT_CARD'`
- **Why**: Payment method analytics, payment method performance metrics

#### 6. `idx_transactions_status_created_at` (Composite)
- **Purpose**: Filter by status AND date range (VERY COMMON analytics query)
- **Query Pattern**: `WHERE status = 'SUCCESS' AND created_at >= ? AND created_at <= ?`
- **Why**: Most common analytics pattern - successful transactions in date range, revenue calculations

#### 7. `idx_transactions_type_status` (Composite)
- **Purpose**: Filter by type AND status (e.g., successful payments only)
- **Query Pattern**: `WHERE type = 'PAYMENT' AND status = 'SUCCESS'`
- **Why**: Revenue calculations (only successful payments, exclude refunds and failed transactions)

#### 8. `idx_transactions_user_created_at` (Composite)
- **Purpose**: User-specific time-based queries
- **Query Pattern**: `WHERE user_id = ? AND created_at BETWEEN ? AND ?`
- **Why**: User transaction history with date range, user activity over time

#### 9. `idx_transactions_user_status` (Composite)
- **Purpose**: User-specific status filtering
- **Query Pattern**: `WHERE user_id = ? AND status = 'SUCCESS'`
- **Why**: User success rate, user transaction status breakdown

#### 10. `idx_transactions_created_at_amount` (Composite)
- **Purpose**: Time-based queries with amount calculations
- **Query Pattern**: `WHERE created_at >= ? AND created_at <= ? ORDER BY amount DESC`
- **Why**: Revenue calculations over time, top transactions by period

## Design Decisions

### Why These Indexes?

1. **Time-Based Queries Priority**: `created_at` indexes are critical because analytics dashboards heavily rely on date range filters
2. **Composite Indexes**: Created for common query patterns (status + date, user + date, type + status)
3. **Join Optimization**: `user_id` index ensures fast joins between transactions and users
4. **Filter Optimization**: Single-column indexes on status, type, payment_method for common filters
5. **DESC Ordering**: Most indexes use DESC for `created_at` because dashboards typically show most recent first

### Index Trade-offs

- **Write Performance**: More indexes = slower inserts/updates
- **Storage**: Indexes consume disk space
- **Maintenance**: PostgreSQL automatically maintains indexes
- **For 500k+ transactions**: These indexes are essential for <300ms query performance

### Query Performance Targets

With these indexes:
- **Time-range queries**: <50ms (using `idx_transactions_created_at`)
- **Status + date filters**: <100ms (using composite indexes)
- **User-specific queries**: <50ms (using `idx_transactions_user_id`)
- **Complex analytics**: <200ms (using multiple indexes)

## Migration Execution

Flyway will automatically:
1. Create `flyway_schema_history` table to track migrations
2. Execute migrations in version order (V1, then V2)
3. Validate migration checksums on startup
4. Prevent duplicate migrations

## Next Steps

After migrations:
- Part 2C: Seed/Test data migration
- Part 2D: Repository layer (will leverage these indexes)
