-- Migration: Create users table
-- Description: Creates the users table with all required columns, constraints, and analytics-friendly indexes

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_user_role CHECK (role IN ('ADMIN', 'USER', 'ANALYST')),
    CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

-- Index: idx_users_email
-- Purpose: Fast lookup by email (authentication, user search)
-- Query pattern: WHERE email = ?
CREATE INDEX idx_users_email ON users(email);

-- Index: idx_users_status
-- Purpose: Filter users by status (active/inactive/suspended)
-- Query pattern: WHERE status = 'ACTIVE'
-- Analytics use case: Count active users, filter dashboard by user status
CREATE INDEX idx_users_status ON users(status);

-- Index: idx_users_role
-- Purpose: Filter users by role (admin/user/analyst)
-- Query pattern: WHERE role = 'USER'
-- Analytics use case: Role-based analytics, permission checks
CREATE INDEX idx_users_role ON users(role);

-- Index: idx_users_created_at
-- Purpose: Time-based queries (user registration trends, date range filters)
-- Query pattern: WHERE created_at BETWEEN ? AND ?
-- Analytics use case: User growth over time, new user registrations by period
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Index: idx_users_status_created_at (Composite)
-- Purpose: Filter by status AND date range (common analytics query)
-- Query pattern: WHERE status = 'ACTIVE' AND created_at >= ?
-- Analytics use case: Active users registered in last N days
CREATE INDEX idx_users_status_created_at ON users(status, created_at DESC);

COMMENT ON TABLE users IS 'Stores user account information for the analytics dashboard';
COMMENT ON COLUMN users.id IS 'Primary key, auto-generated';
COMMENT ON COLUMN users.email IS 'Unique email address for authentication';
COMMENT ON COLUMN users.role IS 'User role: ADMIN, USER, or ANALYST';
COMMENT ON COLUMN users.status IS 'Account status: ACTIVE, INACTIVE, or SUSPENDED';
COMMENT ON COLUMN users.created_at IS 'Timestamp when user account was created';
