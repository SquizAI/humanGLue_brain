-- Migration: 017_bot_integrations.sql
-- Description: Bot and agent integrations (Discord, Slack, Webhooks, Voice)
-- Created: 2025-11-30

-- =====================================================
-- ENUMS
-- =====================================================

-- Bot/Integration platforms
CREATE TYPE bot_platform AS ENUM (
  'discord',
  'slack',
  'telegram',
  'whatsapp',
  'web',
  'voice'
);

-- Integration status
CREATE TYPE integration_status AS ENUM (
  'inactive',
  'configuring',
  'active',
  'error',
  'suspended'
);

-- Webhook event types
CREATE TYPE webhook_event AS ENUM (
  'assessment.started',
  'assessment.completed',
  'user.created',
  'user.updated',
  'workshop.registered',
  'workshop.completed',
  'lesson.completed',
  'engagement.created',
  'custom'
);

-- =====================================================
-- BOT CONFIGURATIONS
-- =====================================================

-- Discord, Slack, and other bot configurations per organization
CREATE TABLE bot_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform bot_platform NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Status
  status integration_status NOT NULL DEFAULT 'inactive',
  is_default BOOLEAN NOT NULL DEFAULT false,

  -- Credentials (encrypted at rest)
  credentials JSONB DEFAULT '{}'::jsonb,
  -- Discord: { bot_token, application_id, client_id, client_secret, guild_id }
  -- Slack: { bot_token, app_token, signing_secret, client_id, client_secret, workspace_id }
  -- Telegram: { bot_token, webhook_secret }
  -- Voice (Vapi): { api_key, assistant_id, phone_number_id }

  -- Bot settings
  settings JSONB DEFAULT '{}'::jsonb,
  -- Commands enabled, welcome messages, auto-responses, etc.

  -- Agent configuration
  agent_type TEXT DEFAULT 'master' CHECK (agent_type IN ('master', 'user', 'organization')),
  agent_persona TEXT,
  agent_instructions TEXT,
  tools_enabled TEXT[] DEFAULT ARRAY['courses', 'webSearch', 'knowledge'],

  -- Rate limiting
  rate_limit_per_user INTEGER DEFAULT 100, -- requests per hour
  rate_limit_per_org INTEGER DEFAULT 1000, -- requests per hour

  -- Feature flags
  features JSONB DEFAULT '{
    "lessons": true,
    "assessments": true,
    "email": false,
    "calendar": false,
    "notifications": true
  }'::jsonb,

  -- Analytics
  total_messages INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,

  -- Error tracking
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0,

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(organization_id, platform, name)
);

CREATE INDEX idx_bot_config_org ON bot_configurations(organization_id);
CREATE INDEX idx_bot_config_platform ON bot_configurations(platform);
CREATE INDEX idx_bot_config_status ON bot_configurations(status);
CREATE INDEX idx_bot_config_active ON bot_configurations(organization_id, status)
  WHERE status = 'active';

CREATE TRIGGER update_bot_configurations_updated_at
  BEFORE UPDATE ON bot_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- BOT COMMANDS
-- =====================================================

-- Custom commands for each bot
CREATE TABLE bot_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bot_configurations(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Command info
  name TEXT NOT NULL, -- e.g., 'ask', 'learn', 'assess'
  description TEXT NOT NULL,
  usage TEXT, -- e.g., '/ask <question>'

  -- Command type
  command_type TEXT DEFAULT 'slash' CHECK (command_type IN ('slash', 'message', 'reaction', 'event')),

  -- Response configuration
  response_type TEXT DEFAULT 'ai' CHECK (response_type IN ('ai', 'static', 'api', 'workflow')),
  static_response TEXT,
  api_endpoint TEXT,
  workflow_id UUID,

  -- AI configuration
  ai_prompt_template TEXT,
  ai_tools TEXT[],

  -- Permissions
  allowed_roles TEXT[] DEFAULT ARRAY['member'],
  requires_auth BOOLEAN DEFAULT false,
  cooldown_seconds INTEGER DEFAULT 0,

  -- Status
  is_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Usage stats
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(bot_id, name)
);

CREATE INDEX idx_bot_commands_bot ON bot_commands(bot_id);
CREATE INDEX idx_bot_commands_org ON bot_commands(organization_id);
CREATE INDEX idx_bot_commands_enabled ON bot_commands(is_enabled) WHERE is_enabled = true;

CREATE TRIGGER update_bot_commands_updated_at
  BEFORE UPDATE ON bot_commands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- WEBHOOK ENDPOINTS
-- =====================================================

-- Outgoing webhooks for event notifications
CREATE TABLE webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Webhook info
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,

  -- Security
  secret TEXT, -- For signature verification
  auth_type TEXT DEFAULT 'none' CHECK (auth_type IN ('none', 'bearer', 'basic', 'hmac')),
  auth_credentials JSONB DEFAULT '{}'::jsonb,

  -- Events
  events webhook_event[] NOT NULL DEFAULT ARRAY['custom']::webhook_event[],
  event_filters JSONB DEFAULT '{}'::jsonb, -- Additional filters per event

  -- Configuration
  headers JSONB DEFAULT '{}'::jsonb,
  payload_format TEXT DEFAULT 'json' CHECK (payload_format IN ('json', 'form')),
  include_metadata BOOLEAN DEFAULT true,

  -- Retry configuration
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,

  -- Status
  status integration_status NOT NULL DEFAULT 'active',
  is_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Stats
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  last_delivery_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_failure_reason TEXT,

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhooks_org ON webhook_endpoints(organization_id);
CREATE INDEX idx_webhooks_status ON webhook_endpoints(status);
CREATE INDEX idx_webhooks_events ON webhook_endpoints USING GIN(events);
CREATE INDEX idx_webhooks_enabled ON webhook_endpoints(is_enabled) WHERE is_enabled = true;

CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- WEBHOOK DELIVERY LOGS
-- =====================================================

CREATE TABLE webhook_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Event info
  event_type webhook_event NOT NULL,
  event_id TEXT, -- External event ID if applicable

  -- Request
  request_url TEXT NOT NULL,
  request_headers JSONB,
  request_body JSONB,

  -- Response
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,

  -- Timing
  duration_ms INTEGER,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Status
  success BOOLEAN NOT NULL,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ
);

CREATE INDEX idx_webhook_logs_webhook ON webhook_delivery_logs(webhook_id);
CREATE INDEX idx_webhook_logs_org ON webhook_delivery_logs(organization_id);
CREATE INDEX idx_webhook_logs_event ON webhook_delivery_logs(event_type);
CREATE INDEX idx_webhook_logs_attempted ON webhook_delivery_logs(attempted_at);
CREATE INDEX idx_webhook_logs_retry ON webhook_delivery_logs(next_retry_at)
  WHERE next_retry_at IS NOT NULL;

-- Partition by month for performance (optional)
-- CREATE INDEX idx_webhook_logs_month ON webhook_delivery_logs(date_trunc('month', attempted_at));

-- =====================================================
-- VOICE/VAPI CONFIGURATIONS
-- =====================================================

CREATE TABLE voice_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Provider info
  provider TEXT DEFAULT 'vapi' CHECK (provider IN ('vapi', 'twilio', 'custom')),
  name TEXT NOT NULL,
  description TEXT,

  -- Credentials
  api_key_encrypted TEXT,

  -- Vapi-specific
  assistant_id TEXT,
  phone_number_id TEXT,
  phone_number TEXT,

  -- Voice settings
  voice_id TEXT,
  voice_provider TEXT DEFAULT 'elevenlabs',
  language TEXT DEFAULT 'en',

  -- Agent configuration
  agent_persona TEXT,
  first_message TEXT,
  system_prompt TEXT,

  -- Call settings
  max_call_duration_seconds INTEGER DEFAULT 600,
  silence_timeout_seconds INTEGER DEFAULT 30,
  end_call_phrases TEXT[],

  -- Features
  recording_enabled BOOLEAN DEFAULT false,
  transcription_enabled BOOLEAN DEFAULT true,

  -- Status
  status integration_status NOT NULL DEFAULT 'inactive',
  is_default BOOLEAN DEFAULT false,

  -- Stats
  total_calls INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  last_call_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(organization_id, name)
);

CREATE INDEX idx_voice_config_org ON voice_configurations(organization_id);
CREATE INDEX idx_voice_config_status ON voice_configurations(status);
CREATE INDEX idx_voice_config_phone ON voice_configurations(phone_number);

CREATE TRIGGER update_voice_configurations_updated_at
  BEFORE UPDATE ON voice_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CRM INTEGRATIONS
-- =====================================================

CREATE TABLE crm_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Provider
  provider TEXT NOT NULL CHECK (provider IN ('hubspot', 'salesforce', 'pipedrive', 'zoho', 'custom')),
  name TEXT NOT NULL,

  -- OAuth/Credentials
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  api_key_encrypted TEXT,
  instance_url TEXT, -- For Salesforce

  -- Sync settings
  sync_contacts BOOLEAN DEFAULT true,
  sync_companies BOOLEAN DEFAULT true,
  sync_deals BOOLEAN DEFAULT false,
  sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('import', 'export', 'bidirectional')),

  -- Field mappings
  field_mappings JSONB DEFAULT '{}'::jsonb,

  -- Status
  status integration_status NOT NULL DEFAULT 'inactive',
  last_sync_at TIMESTAMPTZ,
  last_sync_error TEXT,

  -- Stats
  contacts_synced INTEGER DEFAULT 0,
  companies_synced INTEGER DEFAULT 0,

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(organization_id, provider)
);

CREATE INDEX idx_crm_org ON crm_integrations(organization_id);
CREATE INDEX idx_crm_provider ON crm_integrations(provider);
CREATE INDEX idx_crm_status ON crm_integrations(status);

CREATE TRIGGER update_crm_integrations_updated_at
  BEFORE UPDATE ON crm_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- API KEYS
-- =====================================================

-- API keys for external access to HumanGlue APIs
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Key info
  name TEXT NOT NULL,
  description TEXT,
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  key_hash TEXT NOT NULL, -- bcrypt hash of full key

  -- Permissions
  scopes TEXT[] DEFAULT ARRAY['read'],
  -- Possible scopes: read, write, admin, assessments, users, webhooks, etc.

  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 10000,

  -- Restrictions
  allowed_ips TEXT[],
  allowed_origins TEXT[],

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,

  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE bot_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Bot configurations policies
CREATE POLICY "Users can view their org bots"
  ON bot_configurations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage bots"
  ON bot_configurations FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Bot commands policies
CREATE POLICY "Users can view their org bot commands"
  ON bot_commands FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage bot commands"
  ON bot_commands FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Webhook endpoints policies
CREATE POLICY "Users can view their org webhooks"
  ON webhook_endpoints FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage webhooks"
  ON webhook_endpoints FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Webhook delivery logs policies
CREATE POLICY "Users can view their org webhook logs"
  ON webhook_delivery_logs FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Voice configurations policies
CREATE POLICY "Users can view their org voice config"
  ON voice_configurations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage voice config"
  ON voice_configurations FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- CRM integrations policies
CREATE POLICY "Users can view their org CRM integrations"
  ON crm_integrations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage CRM integrations"
  ON crm_integrations FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- API keys policies
CREATE POLICY "Users can view their org API keys"
  ON api_keys FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage API keys"
  ON api_keys FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get active bot for platform
CREATE OR REPLACE FUNCTION get_active_bot(
  p_organization_id UUID,
  p_platform bot_platform
)
RETURNS UUID AS $$
DECLARE
  v_bot_id UUID;
BEGIN
  SELECT id INTO v_bot_id
  FROM bot_configurations
  WHERE organization_id = p_organization_id
    AND platform = p_platform
    AND status = 'active'
    AND (is_default = true OR NOT EXISTS (
      SELECT 1 FROM bot_configurations
      WHERE organization_id = p_organization_id
        AND platform = p_platform
        AND status = 'active'
        AND is_default = true
    ))
  LIMIT 1;

  RETURN v_bot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment bot message count
CREATE OR REPLACE FUNCTION increment_bot_stats(
  p_bot_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE bot_configurations
  SET
    total_messages = total_messages + 1,
    last_active_at = now()
  WHERE id = p_bot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE bot_configurations IS 'Discord, Slack, Telegram, and other bot configurations per organization';
COMMENT ON TABLE bot_commands IS 'Custom commands for each bot instance';
COMMENT ON TABLE webhook_endpoints IS 'Outgoing webhook configurations for event notifications';
COMMENT ON TABLE webhook_delivery_logs IS 'Log of webhook delivery attempts';
COMMENT ON TABLE voice_configurations IS 'Voice AI configurations (Vapi, Twilio, etc.)';
COMMENT ON TABLE crm_integrations IS 'CRM integrations (HubSpot, Salesforce, etc.)';
COMMENT ON TABLE api_keys IS 'API keys for external access to HumanGlue APIs';
