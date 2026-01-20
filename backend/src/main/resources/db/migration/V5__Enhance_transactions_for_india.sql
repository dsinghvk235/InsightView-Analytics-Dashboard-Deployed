-- Migration: Enhance transactions table for India-first payments
-- Description: Adds Indian payment methods, payment providers, failure reasons, and defaults currency to INR
-- All changes are additive - existing data remains intact

-- Step 1: Set default currency to INR for new transactions
-- Existing transactions keep their currency (USD, EUR, GBP)
ALTER TABLE transactions 
ALTER COLUMN currency SET DEFAULT 'INR';

-- Step 2: Add payment_provider column
-- Stores provider name (PhonePe, GooglePay, Paytm, SBI, HDFC, etc.)
ALTER TABLE transactions 
ADD COLUMN payment_provider VARCHAR(100);

-- Step 3: Add failure_reason column
-- Stores Indian-specific failure reasons (nullable, only for FAILED transactions)
ALTER TABLE transactions 
ADD COLUMN failure_reason VARCHAR(100);

-- Step 3.5: Update existing FAILED transactions to have a default failure_reason
-- This is required before adding the CHECK constraint that enforces failure_reason for FAILED status
-- Using 'UNKNOWN_ERROR' as a safe default for existing failed transactions
UPDATE transactions 
SET failure_reason = 'UNKNOWN_ERROR' 
WHERE status = 'FAILED' AND failure_reason IS NULL;

-- Step 4: Update payment_method CHECK constraint to include Indian methods
-- Remove old constraint and add new one with Indian payment methods
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS chk_payment_method;

ALTER TABLE transactions 
ADD CONSTRAINT chk_payment_method CHECK (
    payment_method IN (
        -- Global methods (backward compatible)
        'CREDIT_CARD',
        'DEBIT_CARD',
        'BANK_TRANSFER',
        'DIGITAL_WALLET',
        'OTHER',
        -- Indian payment methods
        'UPI',
        'NET_BANKING',
        'WALLET'
    )
);

-- Step 5: Add CHECK constraint for failure_reason (only for FAILED status)
-- This ensures data integrity: failure_reason should only exist for FAILED transactions
-- If status is FAILED, failure_reason must be NOT NULL
-- If status is NOT FAILED, failure_reason must be NULL
ALTER TABLE transactions 
ADD CONSTRAINT chk_failure_reason_valid CHECK (
    (status = 'FAILED' AND failure_reason IS NOT NULL) OR 
    (status != 'FAILED' AND failure_reason IS NULL)
);

-- Step 6: Add CHECK constraint for Indian failure reasons
-- Validates failure_reason values for Indian payment ecosystem
ALTER TABLE transactions 
ADD CONSTRAINT chk_failure_reason_values CHECK (
    failure_reason IS NULL OR 
    failure_reason IN (
        'INSUFFICIENT_FUNDS',
        'BANK_SERVER_DOWN',
        'NPCI_TIMEOUT',
        'USER_ABORTED',
        'INVALID_UPI_ID',
        'UNKNOWN_ERROR'
    )
);

-- Analytics Indexes for India-first queries

-- Index: idx_transactions_payment_method_created_at (Composite)
-- Purpose: Payment method analytics over time (critical for UPI dominance analysis)
-- Query pattern: WHERE payment_method = 'UPI' AND created_at >= ? AND created_at <= ?
-- Analytics use case: UPI transaction volume trends, payment method adoption over time
-- Why needed: UPI is dominant in India - this index optimizes UPI-specific analytics
CREATE INDEX idx_transactions_payment_method_created_at 
ON transactions(payment_method, created_at DESC);

-- Index: idx_transactions_payment_provider
-- Purpose: Payment provider analytics (PhonePe vs GooglePay vs Paytm)
-- Query pattern: WHERE payment_provider = 'PhonePe'
-- Analytics use case: Provider market share, provider performance comparison
-- Why needed: India has multiple UPI providers - need provider-level analytics
-- Note: H2 doesn't support partial indexes, so creating full index. For PostgreSQL production,
-- consider using: CREATE INDEX ... WHERE payment_provider IS NOT NULL for better performance
CREATE INDEX idx_transactions_payment_provider 
ON transactions(payment_provider);

-- Index: idx_transactions_failure_reason
-- Purpose: Failure reason analytics (identify common failure patterns)
-- Query pattern: WHERE failure_reason = 'NPCI_TIMEOUT'
-- Analytics use case: Failure analysis, identify systemic issues (NPCI downtime, bank issues)
-- Why needed: Indian payment ecosystem has specific failure modes - need to track them
-- Note: H2 doesn't support partial indexes, so creating full index. For PostgreSQL production,
-- consider using: CREATE INDEX ... WHERE failure_reason IS NOT NULL for better performance
CREATE INDEX idx_transactions_failure_reason 
ON transactions(failure_reason);

-- Index: idx_transactions_status_failure_reason (Composite)
-- Purpose: Failed transaction analysis with reasons
-- Query pattern: WHERE status = 'FAILED' AND failure_reason = 'INSUFFICIENT_FUNDS'
-- Analytics use case: Failure reason breakdown, identify top failure causes
-- Why needed: Critical for improving payment success rates in India
-- Note: H2 doesn't support partial indexes, so creating full index. For PostgreSQL production,
-- consider using: CREATE INDEX ... WHERE status = 'FAILED' for better performance
CREATE INDEX idx_transactions_status_failure_reason 
ON transactions(status, failure_reason);

-- Index: idx_transactions_currency_created_at (Composite)
-- Purpose: Multi-currency analytics (INR vs others)
-- Query pattern: WHERE currency = 'INR' AND created_at >= ? AND created_at <= ?
-- Analytics use case: INR transaction trends, currency-based revenue analysis
-- Why needed: While INR is default, existing data has multiple currencies
CREATE INDEX idx_transactions_currency_created_at 
ON transactions(currency, created_at DESC);

COMMENT ON COLUMN transactions.currency IS 'ISO 4217 currency code. Default: INR for new transactions.';
COMMENT ON COLUMN transactions.payment_method IS 'Payment method. Now includes UPI, NET_BANKING, WALLET for India.';
COMMENT ON COLUMN transactions.payment_provider IS 'Payment provider name (e.g., PhonePe, GooglePay, Paytm, SBI, HDFC). Nullable.';
COMMENT ON COLUMN transactions.failure_reason IS 'Failure reason for FAILED transactions. Indian-specific reasons: INSUFFICIENT_FUNDS, BANK_SERVER_DOWN, NPCI_TIMEOUT, USER_ABORTED, INVALID_UPI_ID, UNKNOWN_ERROR.';
