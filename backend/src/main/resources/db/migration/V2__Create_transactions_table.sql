-- Migration: Create transactions table
-- Description: Creates the transactions table with foreign key to users, constraints, and analytics-optimized indexes

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Check constraints for enum values
    CONSTRAINT chk_transaction_type CHECK (type IN ('PAYMENT', 'REFUND', 'CHARGEBACK', 'FEE')),
    CONSTRAINT chk_transaction_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET', 'OTHER')),
    
    -- Business constraints
    CONSTRAINT chk_amount_positive CHECK (amount > 0)
);

-- Index: idx_transactions_user_id
-- Purpose: Fast joins with users table and user-specific queries
-- Query pattern: WHERE user_id = ? (JOIN users ON transactions.user_id = users.id)
-- Analytics use case: Get all transactions for a specific user, user transaction history
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Index: idx_transactions_created_at
-- Purpose: Time-based queries (most critical for analytics)
-- Query pattern: WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC
-- Analytics use case: Transaction volume over time, date range filters, time-series analysis
-- Note: DESC for most recent first (common dashboard pattern)
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Index: idx_transactions_status
-- Purpose: Filter transactions by status (success/failed/pending)
-- Query pattern: WHERE status = 'SUCCESS'
-- Analytics use case: Success rate calculations, filter by transaction status
CREATE INDEX idx_transactions_status ON transactions(status);

-- Index: idx_transactions_type
-- Purpose: Filter transactions by type (payment/refund/chargeback/fee)
-- Query pattern: WHERE type = 'PAYMENT'
-- Analytics use case: Revenue analysis (exclude refunds), transaction type breakdown
CREATE INDEX idx_transactions_type ON transactions(type);

-- Index: idx_transactions_payment_method
-- Purpose: Filter by payment method
-- Query pattern: WHERE payment_method = 'CREDIT_CARD'
-- Analytics use case: Payment method analytics, payment method performance
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);

-- Index: idx_transactions_status_created_at (Composite)
-- Purpose: Filter by status AND date range (very common analytics query)
-- Query pattern: WHERE status = 'SUCCESS' AND created_at >= ? AND created_at <= ?
-- Analytics use case: Successful transactions in date range, revenue calculations with date filters
CREATE INDEX idx_transactions_status_created_at ON transactions(status, created_at DESC);


-- Index: idx_transactions_user_created_at (Composite)
-- Purpose: User-specific time-based queries
-- Query pattern: WHERE user_id = ? AND created_at BETWEEN ? AND ?
-- Analytics use case: User transaction history with date range, user activity over time
CREATE INDEX idx_transactions_user_created_at ON transactions(user_id, created_at DESC);

COMMENT ON TABLE transactions IS 'Stores payment transactions for analytics and reporting';
COMMENT ON COLUMN transactions.id IS 'Primary key, auto-generated';
COMMENT ON COLUMN transactions.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount, precision 15 digits with 2 decimal places';
COMMENT ON COLUMN transactions.currency IS 'ISO 4217 currency code (3 characters)';
COMMENT ON COLUMN transactions.type IS 'Transaction type: PAYMENT, REFUND, CHARGEBACK, or FEE';
COMMENT ON COLUMN transactions.status IS 'Transaction status: PENDING, SUCCESS, FAILED, or CANCELLED';
COMMENT ON COLUMN transactions.payment_method IS 'Payment method used for the transaction';
COMMENT ON COLUMN transactions.created_at IS 'Timestamp when transaction was created';
