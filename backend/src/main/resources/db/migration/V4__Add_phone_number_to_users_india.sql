-- Migration: Add phone_number column to users table (India-first enhancement)
-- Description: Adds phone_number column to support mobile-first identity for Indian customers
-- This is an additive change - no existing data is affected

-- Add phone_number column
-- NULLABLE: Supports existing global users without phone numbers
-- UNIQUE: Prevents duplicate phone numbers (critical for India mobile-first identity)
-- VARCHAR(15): Supports international format (+91XXXXXXXXXX) and Indian format (10 digits)
ALTER TABLE users 
ADD COLUMN phone_number VARCHAR(15) UNIQUE;

-- Index: idx_users_phone_number
-- Purpose: Fast lookup by phone number (authentication, user search)
-- Query pattern: WHERE phone_number = ?
-- Analytics use case: Phone-based user identification, mobile-first analytics
-- Why needed: In India, phone number is primary identity (UPI, OTP-based auth)
-- Note: H2 doesn't support partial indexes, so creating full index. For PostgreSQL production, 
-- consider using: CREATE INDEX ... WHERE phone_number IS NOT NULL for better performance
CREATE INDEX idx_users_phone_number ON users(phone_number);

COMMENT ON COLUMN users.phone_number IS 'Mobile phone number (India-first). Unique when provided. Supports +91XXXXXXXXXX format.';
