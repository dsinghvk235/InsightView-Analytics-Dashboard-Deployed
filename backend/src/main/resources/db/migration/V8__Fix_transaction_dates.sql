-- V8: Fix transaction dates to spread over 1 year
-- The data seeder used @CreatedDate which overwrote historical dates
-- This migration spreads transaction dates over the past year for realistic analytics

-- Update transaction dates to be spread over the past year
-- Using a deterministic formula based on transaction ID for reproducible results
UPDATE transactions
SET created_at = CURRENT_TIMESTAMP - (
    -- Spread transactions over 365 days based on ID
    -- Use modulo to create variation and spread
    (id % 365) * INTERVAL '1 day' +
    (id % 24) * INTERVAL '1 hour' +
    (id % 60) * INTERVAL '1 minute'
),
updated_at = CURRENT_TIMESTAMP - (
    (id % 365) * INTERVAL '1 day' +
    (id % 24) * INTERVAL '1 hour' +
    (id % 60) * INTERVAL '1 minute'
);

-- Also spread user creation dates over the past year
UPDATE users
SET created_at = CURRENT_TIMESTAMP - (
    (id % 365) * INTERVAL '1 day' +
    (id % 24) * INTERVAL '1 hour'
),
updated_at = CURRENT_TIMESTAMP - (
    (id % 365) * INTERVAL '1 day' +
    (id % 24) * INTERVAL '1 hour'
)
WHERE id > 15; -- Keep original V3 seed users as-is

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'V8 Migration Complete: Fixed transaction and user dates to span 1 year';
END $$;
