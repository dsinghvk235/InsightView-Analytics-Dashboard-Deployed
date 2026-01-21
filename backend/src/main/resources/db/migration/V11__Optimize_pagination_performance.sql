-- Migration: Optimize pagination performance
-- Description: Adds covering index for paginated transaction table queries
-- Target: Reduce large offset pagination from 486ms to <300ms
-- Note: Using regular CREATE INDEX (not CONCURRENTLY) for Flyway compatibility

-- ============================================================
-- Covering Index for Paginated Transaction Table
-- This index covers the most common pagination query pattern:
-- SELECT t.*, u.email, u.full_name FROM transactions t 
-- INNER JOIN users u ON t.user_id = u.id 
-- ORDER BY t.created_at DESC
--
-- A covering index includes commonly selected columns so PostgreSQL
-- can retrieve data directly from the index without visiting the table.
-- This significantly speeds up pagination with large OFFSET values.
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_txn_pagination_covering 
ON transactions(created_at DESC, user_id, status, payment_method, amount, type);

-- ============================================================
-- Optimize the JOIN performance
-- Add index on users table for the JOIN condition if not exists
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_id_email_name 
ON users(id, email, full_name);

-- ============================================================
-- Analyze tables to update statistics
-- ============================================================
ANALYZE transactions;
ANALYZE users;

-- Add comments for documentation
COMMENT ON INDEX idx_txn_pagination_covering IS 'Covering index for paginated transaction table - includes common filter/display columns';
COMMENT ON INDEX idx_users_id_email_name IS 'Covering index for user data in transaction table joins';
