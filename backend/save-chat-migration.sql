-- Saved chat metadata for chat_sessions table
ALTER TABLE chat_sessions
  ADD COLUMN IF NOT EXISTS name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_saved
  ON chat_sessions(user_id, is_saved);
