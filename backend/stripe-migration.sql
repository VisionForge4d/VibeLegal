-- Stripe Integration Database Migration
-- Run this to add Stripe-related tables and update existing schema

-- Update users table to support pro and enterprise tiers
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE users 
ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('basic', 'pro', 'enterprise'));

-- Add name field to users table for Stripe customer creation
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Add Stripe customer ID to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Create user_subscriptions table for detailed subscription management
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('pro', 'enterprise')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    next_billing_date TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create payment_history table for tracking payments
CREATE TABLE IF NOT EXISTS payment_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    amount_paid INTEGER, -- Amount in cents
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(50) CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_usage table for tracking feature usage
CREATE TABLE IF NOT EXISTS subscription_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    feature VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, feature, period_start)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to reset monthly contract usage
CREATE OR REPLACE FUNCTION reset_monthly_contracts()
RETURNS void AS $$
BEGIN
    UPDATE users SET contracts_used_this_month = 0;
    RAISE NOTICE 'Monthly contract usage reset for all users';
END;
$$ LANGUAGE plpgsql;

-- Function to get subscription limits
CREATE OR REPLACE FUNCTION get_user_subscription_info(user_id_param INTEGER)
RETURNS TABLE (
    user_id INTEGER,
    email VARCHAR,
    subscription_tier VARCHAR,
    contracts_used INTEGER,
    contract_limit INTEGER,
    status VARCHAR,
    next_billing_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.subscription_tier,
        u.contracts_used_this_month,
        CASE 
            WHEN u.subscription_tier = 'basic' THEN 5
            ELSE -1 -- unlimited for pro/enterprise
        END as contract_limit,
        COALESCE(us.status, 'active') as status,
        us.next_billing_date
    FROM users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id
    WHERE u.id = user_id_param;
END;
$$ LANGUAGE plpgsql;