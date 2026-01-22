-- Migration: 025_discord_calendar_connections.sql
-- Description: Store OAuth tokens for Discord users' calendar integrations (Google, Microsoft)
-- Created: 2026-01-22

-- =====================================================
-- DISCORD CALENDAR CONNECTIONS
-- =====================================================

-- Stores OAuth tokens for calendar integrations linked to Discord users
CREATE TABLE discord_calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Discord identification (not tied to HumanGlue user accounts)
  discord_user_id TEXT NOT NULL,
  discord_guild_id TEXT NOT NULL,

  -- Calendar provider
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),

  -- OAuth tokens (encrypted at rest by Supabase)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,

  -- User info from the calendar provider
  email TEXT,
  calendar_id TEXT DEFAULT 'primary',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each user can only have one connection per provider per guild
  UNIQUE(discord_user_id, discord_guild_id, provider)
);

-- Indexes for common queries
CREATE INDEX idx_calendar_conn_user ON discord_calendar_connections(discord_user_id);
CREATE INDEX idx_calendar_conn_guild ON discord_calendar_connections(discord_guild_id);
CREATE INDEX idx_calendar_conn_provider ON discord_calendar_connections(provider);
CREATE INDEX idx_calendar_conn_expires ON discord_calendar_connections(expires_at);

-- Update trigger
CREATE TRIGGER update_discord_calendar_connections_updated_at
  BEFORE UPDATE ON discord_calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Note: This table is accessed by the Netlify function using service role key,
-- so RLS policies are permissive for service role but restrictive for authenticated users

ALTER TABLE discord_calendar_connections ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by Netlify functions and Discord bot)
-- (This is implicit - service role bypasses RLS)

-- Authenticated users cannot directly access this table
-- Calendar operations go through the Discord bot which uses service role
CREATE POLICY "No direct access for authenticated users"
  ON discord_calendar_connections
  FOR ALL
  TO authenticated
  USING (false);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get a user's calendar connection
CREATE OR REPLACE FUNCTION get_calendar_connection(
  p_discord_user_id TEXT,
  p_discord_guild_id TEXT,
  p_provider TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  provider TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  email TEXT,
  calendar_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dcc.id,
    dcc.provider,
    dcc.access_token,
    dcc.refresh_token,
    dcc.expires_at,
    dcc.email,
    dcc.calendar_id
  FROM discord_calendar_connections dcc
  WHERE dcc.discord_user_id = p_discord_user_id
    AND dcc.discord_guild_id = p_discord_guild_id
    AND (p_provider IS NULL OR dcc.provider = p_provider)
  ORDER BY dcc.updated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update tokens after refresh
CREATE OR REPLACE FUNCTION update_calendar_tokens(
  p_discord_user_id TEXT,
  p_discord_guild_id TEXT,
  p_provider TEXT,
  p_access_token TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  UPDATE discord_calendar_connections
  SET
    access_token = p_access_token,
    expires_at = p_expires_at,
    updated_at = now()
  WHERE discord_user_id = p_discord_user_id
    AND discord_guild_id = p_discord_guild_id
    AND provider = p_provider;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has a calendar connected
CREATE OR REPLACE FUNCTION has_calendar_connection(
  p_discord_user_id TEXT,
  p_discord_guild_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM discord_calendar_connections
    WHERE discord_user_id = p_discord_user_id
      AND discord_guild_id = p_discord_guild_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete a calendar connection
CREATE OR REPLACE FUNCTION delete_calendar_connection(
  p_discord_user_id TEXT,
  p_discord_guild_id TEXT,
  p_provider TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  DELETE FROM discord_calendar_connections
  WHERE discord_user_id = p_discord_user_id
    AND discord_guild_id = p_discord_guild_id
    AND (p_provider IS NULL OR provider = p_provider);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE discord_calendar_connections IS 'OAuth tokens for Discord users calendar integrations (Google Calendar, Microsoft Outlook)';
COMMENT ON COLUMN discord_calendar_connections.discord_user_id IS 'Discord user ID (snowflake)';
COMMENT ON COLUMN discord_calendar_connections.discord_guild_id IS 'Discord server/guild ID';
COMMENT ON COLUMN discord_calendar_connections.provider IS 'Calendar provider: google or microsoft';
COMMENT ON COLUMN discord_calendar_connections.access_token IS 'OAuth access token (encrypted at rest)';
COMMENT ON COLUMN discord_calendar_connections.refresh_token IS 'OAuth refresh token for getting new access tokens';
COMMENT ON COLUMN discord_calendar_connections.expires_at IS 'When the access token expires';
COMMENT ON COLUMN discord_calendar_connections.email IS 'Email address associated with the calendar account';
