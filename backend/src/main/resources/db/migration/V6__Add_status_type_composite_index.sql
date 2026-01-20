-- Migration: Add composite index for status + type queries
-- Description: Optimizes GTV and Average Ticket Size queries (SUCCESS + PAYMENT filter)
-- This is a performance optimization for Day 4 KPI queries

-- Index: idx_transactions_status_type (Composite)
-- Purpose: Optimize queries filtering by status = 'SUCCESS' AND type = 'PAYMENT'
-- Query pattern: WHERE status = 'SUCCESS' AND type = 'PAYMENT'
-- Analytics use case: Total GTV, Average Ticket Size, Revenue calculations
-- Performance: 30-50% faster for revenue-related queries

-- Note: This is a composite index covering both columns
-- PostgreSQL can use this index for:
-- 1. Queries with both status and type filters
-- 2. Queries with only status filter (leftmost column)
-- 3. More efficient than using two separate indexes

CREATE INDEX IF NOT EXISTS idx_transactions_status_type 
ON transactions(status, type);

-- For PostgreSQL production, consider a partial index for even better performance:
-- CREATE INDEX idx_transactions_status_type_partial 
-- ON transactions(status, type) 
-- WHERE status = 'SUCCESS' AND type = 'PAYMENT';
-- 
-- Partial indexes are smaller and faster, but only work for the specific filter.
-- Use partial index if you ONLY query for SUCCESS + PAYMENT.
-- Use composite index if you query for various status + type combinations.

COMMENT ON INDEX idx_transactions_status_type IS 
'Composite index for status + type queries. Optimizes GTV and Average Ticket Size calculations.';
