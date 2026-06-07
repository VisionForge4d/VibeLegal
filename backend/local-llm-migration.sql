-- Local LLM configuration columns for users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS local_llm_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS local_llm_endpoint VARCHAR(500),
  ADD COLUMN IF NOT EXISTS local_llm_model VARCHAR(100),
  ADD COLUMN IF NOT EXISTS local_llm_api_key VARCHAR(255);

-- Ensure updated_at exists to track changes
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
