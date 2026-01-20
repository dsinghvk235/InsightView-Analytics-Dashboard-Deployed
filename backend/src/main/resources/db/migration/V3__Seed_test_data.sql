-- Migration: Seed test data (PostgreSQL compatible)
-- Description: Inserts minimal test data for PostgreSQL
-- Note: Large-scale seeding is handled by DataSeederService with app.data-seeder.enabled=true

-- Insert minimal test users using PostgreSQL date arithmetic
INSERT INTO users (full_name, email, role, status, created_at) VALUES
('John Smith', 'john.smith@example.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '25 days'),
('Sarah Johnson', 'sarah.johnson@example.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '22 days'),
('Michael Brown', 'michael.brown@example.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '20 days'),
('Emily Davis', 'emily.davis@example.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '18 days'),
('David Wilson', 'david.wilson@example.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('Jessica Martinez', 'jessica.martinez@example.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '12 days'),
('Robert Taylor', 'robert.taylor@example.com', 'USER', 'INACTIVE', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('Amanda Anderson', 'amanda.anderson@example.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '8 days'),
('Christopher Lee', 'christopher.lee@example.com', 'ANALYST', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '28 days'),
('Jennifer White', 'jennifer.white@example.com', 'ANALYST', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '26 days'),
('Daniel Harris', 'daniel.harris@example.com', 'USER', 'SUSPENDED', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('Lisa Thompson', 'lisa.thompson@example.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('Matthew Garcia', 'matthew.garcia@example.com', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '30 days'),
('Ashley Rodriguez', 'ashley.rodriguez@example.com', 'USER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('James Lewis', 'james.lewis@example.com', 'USER', 'INACTIVE', CURRENT_TIMESTAMP - INTERVAL '7 days');

-- Insert minimal test transactions using PostgreSQL date arithmetic
INSERT INTO transactions (user_id, amount, currency, type, status, payment_method, created_at) VALUES
(1, 99.99, 'USD', 'PAYMENT', 'SUCCESS', 'CREDIT_CARD', CURRENT_TIMESTAMP - INTERVAL '24 days 2 hours'),
(1, 149.50, 'USD', 'PAYMENT', 'SUCCESS', 'CREDIT_CARD', CURRENT_TIMESTAMP - INTERVAL '20 days 14 hours'),
(1, 75.25, 'USD', 'PAYMENT', 'SUCCESS', 'DEBIT_CARD', CURRENT_TIMESTAMP - INTERVAL '18 days 9 hours'),
(2, 249.99, 'USD', 'PAYMENT', 'SUCCESS', 'CREDIT_CARD', CURRENT_TIMESTAMP - INTERVAL '21 days 10 hours'),
(2, 89.50, 'USD', 'PAYMENT', 'SUCCESS', 'DEBIT_CARD', CURRENT_TIMESTAMP - INTERVAL '19 days 14 hours'),
(3, 79.99, 'USD', 'PAYMENT', 'SUCCESS', 'CREDIT_CARD', CURRENT_TIMESTAMP - INTERVAL '19 days 12 hours'),
(3, 299.50, 'USD', 'PAYMENT', 'SUCCESS', 'CREDIT_CARD', CURRENT_TIMESTAMP - INTERVAL '17 days 8 hours'),
(4, 119.99, 'EUR', 'PAYMENT', 'SUCCESS', 'CREDIT_CARD', CURRENT_TIMESTAMP - INTERVAL '17 days 11 hours'),
(4, 89.50, 'EUR', 'PAYMENT', 'SUCCESS', 'DEBIT_CARD', CURRENT_TIMESTAMP - INTERVAL '15 days 7 hours'),
(5, 159.99, 'USD', 'PAYMENT', 'SUCCESS', 'CREDIT_CARD', CURRENT_TIMESTAMP - INTERVAL '14 days 9 hours'),
(5, 89.50, 'USD', 'PAYMENT', 'SUCCESS', 'DEBIT_CARD', CURRENT_TIMESTAMP - INTERVAL '13 days 13 hours'),
(6, 69.99, 'USD', 'PAYMENT', 'SUCCESS', 'CREDIT_CARD', CURRENT_TIMESTAMP - INTERVAL '11 days 10 hours'),
(7, 199.99, 'USD', 'PAYMENT', 'SUCCESS', 'CREDIT_CARD', CURRENT_TIMESTAMP - INTERVAL '9 days 8 hours'),
(8, 109.99, 'GBP', 'PAYMENT', 'SUCCESS', 'CREDIT_CARD', CURRENT_TIMESTAMP - INTERVAL '7 days 11 hours'),
(8, 79.50, 'GBP', 'PAYMENT', 'SUCCESS', 'DEBIT_CARD', CURRENT_TIMESTAMP - INTERVAL '6 days 13 hours');
