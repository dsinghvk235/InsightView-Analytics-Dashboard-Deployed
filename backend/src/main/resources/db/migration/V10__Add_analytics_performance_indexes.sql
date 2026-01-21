-- Migration: Add analytics performance indexes
-- Description: Optimizes slow analytics queries for <300ms latency
-- Target APIs: kpis/comparison, revenue/over-time, transactions/by-status, transactions/by-date, transactions/by-hour

-- ============================================================
-- Index 1: Composite index for KPI comparison queries
-- Covers: status + type + created_at (most common KPI pattern)
-- Query: WHERE status = 'SUCCESS' AND type = 'PAYMENT' AND created_at >= ?
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_txn_status_type_created 
ON transactions(status, type, created_at DESC);

-- ============================================================
-- Index 2: Covering index for daily transaction stats
-- Query: GROUP BY CAST(created_at AS DATE) with status checks
-- PostgreSQL needs this for efficient date-based grouping
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_txn_created_date_status_amount 
ON transactions(created_at, status, amount);

-- ============================================================
-- Index 3: Partial index for SUCCESS PAYMENT transactions only
-- This is smaller and faster than full composite index
-- Used by: getTotalGTV, getAverageTicketSize, getRevenueOverTime
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_txn_success_payment 
ON transactions(created_at DESC, amount) 
WHERE status = 'SUCCESS' AND type = 'PAYMENT';

-- ============================================================
-- Index 4: Partial index for FAILED transactions
-- Used by: getFailedVolume, KPI failed transaction metrics
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_txn_failed 
ON transactions(created_at DESC, amount) 
WHERE status = 'FAILED';

-- ============================================================
-- Index 5: Partial index for PENDING transactions
-- Used by: getPendingTransactionCount
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_txn_pending 
ON transactions(created_at DESC) 
WHERE status = 'PENDING';

-- ============================================================
-- Index 6: Expression index for date-only queries (hourly/daily stats)
-- PostgreSQL can use this for CAST(created_at AS DATE) queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_txn_date_only 
ON transactions(DATE(created_at));

-- ============================================================
-- Index 7: Composite index for paginated transaction table
-- Covers: user JOIN + status filter + date ordering
-- Query: JOIN users ON t.user_id = u.id WHERE status = ? ORDER BY created_at
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_txn_user_status_created 
ON transactions(user_id, status, created_at DESC);

-- ============================================================
-- Analyze tables to update statistics for query planner
-- ============================================================
ANALYZE transactions;
ANALYZE users;

-- Add comments for documentation
COMMENT ON INDEX idx_txn_status_type_created IS 'Composite index for KPI queries: status + type + created_at';
COMMENT ON INDEX idx_txn_created_date_status_amount IS 'Covering index for daily transaction stats aggregation';
COMMENT ON INDEX idx_txn_success_payment IS 'Partial index for SUCCESS PAYMENT transactions (GTV/revenue)';
COMMENT ON INDEX idx_txn_failed IS 'Partial index for FAILED transactions';
COMMENT ON INDEX idx_txn_pending IS 'Partial index for PENDING transactions';
COMMENT ON INDEX idx_txn_date_only IS 'Expression index for date-based grouping queries';
COMMENT ON INDEX idx_txn_user_status_created IS 'Composite index for paginated transaction table with filters';
