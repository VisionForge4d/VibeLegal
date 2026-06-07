-- Admin Dashboard Migration
-- Adds admin functionality to VibeLegal platform
-- Created: 2025-10-09

-- =============================================================================
-- 1. Add is_admin Column to Users Table
-- =============================================================================

-- Add is_admin column with default false
ALTER TABLE users
ADD COLUMN is_admin BOOLEAN DEFAULT false NOT NULL;

-- Create partial index for faster admin checks (only indexes admin users)
CREATE INDEX idx_users_is_admin ON users(is_admin)
WHERE is_admin = true;

COMMENT ON COLUMN users.is_admin IS 'Flag indicating if user has admin privileges';

-- =============================================================================
-- 2. Create Admin Actions Audit Log Table
-- =============================================================================

-- Ensure pgcrypto is available for UUID generation (id column)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create admin_actions table for comprehensive audit trail
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE admin_actions IS 'Audit log for all admin actions performed on the platform';
COMMENT ON COLUMN admin_actions.admin_user_id IS 'Admin who performed the action (CASCADE delete if admin deleted)';
COMMENT ON COLUMN admin_actions.action_type IS 'Type of action (e.g., subscription_change, password_reset, impersonation)';
COMMENT ON COLUMN admin_actions.target_user_id IS 'User affected by action (SET NULL if user deleted to preserve audit history)';
COMMENT ON COLUMN admin_actions.metadata IS 'JSON field for action-specific data (old/new values, reason, etc.)';

-- =============================================================================
-- 3. Create Indexes for Admin Actions Table
-- =============================================================================

-- Index for querying actions by admin user, sorted by most recent
CREATE INDEX idx_admin_actions_admin_user ON admin_actions(admin_user_id, created_at DESC);

-- Index for querying actions affecting a specific user
CREATE INDEX idx_admin_actions_target_user ON admin_actions(target_user_id, created_at DESC);

-- Index for general time-based queries (audit log viewer)
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- Index for filtering by action type
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);

-- GIN index for metadata JSON queries (enables fast JSON searches)
CREATE INDEX idx_admin_actions_metadata ON admin_actions USING gin(metadata);

-- =============================================================================
-- 4. Add Search Indexes to Users Table
-- =============================================================================

-- Improve user search performance for admin dashboard
CREATE INDEX idx_users_email_search ON users(email varchar_pattern_ops);

-- Index for subscription tier filtering
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

-- Index for sorting by creation date (newest first)
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Composite index for filtering by tier and sorting by date (optimizes common query)
CREATE INDEX idx_users_tier_created ON users(subscription_tier, created_at DESC);

-- =============================================================================
-- 5. Set Test User as Admin
-- =============================================================================

-- Update test user to have admin privileges for testing
UPDATE users
SET is_admin = true
WHERE email = 'test2@vibelegal.com';

-- Verify the update
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM users WHERE is_admin = true;
    RAISE NOTICE 'Migration complete: % admin user(s) configured', admin_count;
END $$;

-- =============================================================================
-- Migration Verification Queries
-- =============================================================================

-- Uncomment to verify migration results:

-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name = 'is_admin';

-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_name = 'admin_actions';

-- SELECT indexname
-- FROM pg_indexes
-- WHERE tablename IN ('users', 'admin_actions')
-- ORDER BY tablename, indexname;

-- SELECT email, is_admin
-- FROM users
-- WHERE is_admin = true;
