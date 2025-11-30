-- Migration: 013_communications_channels.sql
-- Description: White-label communications channels with OAuth integration
-- Created: 2025-01-29
-- Supports: Email, Social Media, Newsletter, Workshops per organization

-- =====================================================
-- ENUMS
-- =====================================================

-- Social media platforms
CREATE TYPE social_platform AS ENUM (
  'linkedin',
  'twitter',
  'instagram',
  'facebook',
  'youtube',
  'tiktok',
  'threads'
);

-- Communication channel types
CREATE TYPE channel_type AS ENUM (
  'email',
  'social',
  'newsletter',
  'workshop'
);

-- OAuth connection status
CREATE TYPE oauth_status AS ENUM (
  'pending',
  'connected',
  'expired',
  'revoked',
  'error'
);

-- Newsletter provider options
CREATE TYPE newsletter_provider AS ENUM (
  'resend',
  'sendgrid',
  'mailchimp',
  'custom_smtp'
);

-- Content approval status
CREATE TYPE approval_status AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'scheduled',
  'published',
  'failed'
);

-- =====================================================
-- ORGANIZATION CHANNEL CONFIGURATION
-- =====================================================

-- Master table for organization's enabled channels
CREATE TABLE organization_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  tier_required TEXT NOT NULL DEFAULT 'starter' CHECK (tier_required IN ('free', 'starter', 'professional', 'enterprise')),
  settings JSONB DEFAULT '{}'::jsonb,
  -- Settings can include: branding, templates, defaults, limits
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, channel_type)
);

CREATE INDEX idx_org_channels_org ON organization_channels(organization_id);
CREATE INDEX idx_org_channels_type ON organization_channels(channel_type);
CREATE INDEX idx_org_channels_enabled ON organization_channels(is_enabled) WHERE is_enabled = true;

CREATE TRIGGER update_organization_channels_updated_at
  BEFORE UPDATE ON organization_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SOCIAL MEDIA OAUTH CONNECTIONS
-- =====================================================

-- OAuth connections for social platforms
CREATE TABLE social_oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  status oauth_status NOT NULL DEFAULT 'pending',
  -- OAuth tokens (encrypted in application layer)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  -- Platform-specific user/account info
  platform_user_id TEXT,
  platform_username TEXT,
  platform_display_name TEXT,
  platform_profile_url TEXT,
  platform_avatar_url TEXT,
  -- OAuth metadata
  scopes TEXT[], -- Granted permission scopes
  oauth_provider TEXT, -- e.g., 'oauth2', 'oauth1'
  last_verified_at TIMESTAMPTZ,
  error_message TEXT,
  -- Audit
  connected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, platform, platform_user_id)
);

CREATE INDEX idx_social_oauth_org ON social_oauth_connections(organization_id);
CREATE INDEX idx_social_oauth_platform ON social_oauth_connections(platform);
CREATE INDEX idx_social_oauth_status ON social_oauth_connections(status);
CREATE INDEX idx_social_oauth_expires ON social_oauth_connections(token_expires_at)
  WHERE status = 'connected';

CREATE TRIGGER update_social_oauth_updated_at
  BEFORE UPDATE ON social_oauth_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SOCIAL MEDIA PAGES/ACCOUNTS
-- =====================================================

-- Specific pages/accounts that can be posted to
CREATE TABLE social_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oauth_connection_id UUID NOT NULL REFERENCES social_oauth_connections(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  -- Page/Account info
  page_id TEXT NOT NULL, -- Platform's page/account ID
  page_name TEXT NOT NULL,
  page_type TEXT, -- e.g., 'business', 'creator', 'personal'
  page_url TEXT,
  page_avatar_url TEXT,
  follower_count INTEGER,
  -- Access
  page_access_token_encrypted TEXT, -- Some platforms need page-specific tokens
  permissions TEXT[], -- Page-specific permissions
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false, -- Default page for this platform
  last_synced_at TIMESTAMPTZ,
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, platform, page_id)
);

CREATE INDEX idx_social_pages_oauth ON social_pages(oauth_connection_id);
CREATE INDEX idx_social_pages_org ON social_pages(organization_id);
CREATE INDEX idx_social_pages_platform ON social_pages(platform);
CREATE INDEX idx_social_pages_active ON social_pages(is_active) WHERE is_active = true;
CREATE INDEX idx_social_pages_default ON social_pages(organization_id, platform, is_default)
  WHERE is_default = true;

CREATE TRIGGER update_social_pages_updated_at
  BEFORE UPDATE ON social_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- EMAIL CONFIGURATION
-- =====================================================

-- Email sending configuration per organization
CREATE TABLE email_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  -- Provider settings
  provider newsletter_provider NOT NULL DEFAULT 'resend',
  api_key_encrypted TEXT,
  -- Sender settings
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to_email TEXT,
  -- SMTP settings (for custom_smtp provider)
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password_encrypted TEXT,
  smtp_use_tls BOOLEAN DEFAULT true,
  -- Domain verification
  sending_domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  dkim_verified BOOLEAN DEFAULT false,
  spf_verified BOOLEAN DEFAULT false,
  -- Branding
  email_header_html TEXT,
  email_footer_html TEXT,
  unsubscribe_url TEXT,
  -- Limits
  daily_send_limit INTEGER DEFAULT 100,
  monthly_send_limit INTEGER DEFAULT 1000,
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  error_message TEXT,
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX idx_email_config_org ON email_configurations(organization_id);
CREATE INDEX idx_email_config_active ON email_configurations(is_active) WHERE is_active = true;

CREATE TRIGGER update_email_configurations_updated_at
  BEFORE UPDATE ON email_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NEWSLETTER CONFIGURATION
-- =====================================================

-- Newsletter-specific settings (extends email config)
CREATE TABLE newsletter_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email_config_id UUID REFERENCES email_configurations(id) ON DELETE SET NULL,
  -- Newsletter branding
  newsletter_name TEXT NOT NULL,
  newsletter_description TEXT,
  newsletter_logo_url TEXT,
  newsletter_color_primary TEXT DEFAULT '#0066FF',
  newsletter_color_secondary TEXT DEFAULT '#F5F5F5',
  -- Templates
  default_template_id UUID,
  welcome_email_template TEXT,
  confirmation_email_template TEXT,
  -- Subscriber settings
  require_double_optin BOOLEAN DEFAULT true,
  allow_unsubscribe BOOLEAN DEFAULT true,
  -- Schedule defaults
  default_send_day TEXT CHECK (default_send_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  default_send_time TIME,
  timezone TEXT DEFAULT 'UTC',
  -- Analytics
  track_opens BOOLEAN DEFAULT true,
  track_clicks BOOLEAN DEFAULT true,
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX idx_newsletter_config_org ON newsletter_configurations(organization_id);
CREATE INDEX idx_newsletter_config_active ON newsletter_configurations(is_active) WHERE is_active = true;

CREATE TRIGGER update_newsletter_configurations_updated_at
  BEFORE UPDATE ON newsletter_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUBSCRIBER LISTS
-- =====================================================

-- Subscriber lists for newsletters
CREATE TABLE subscriber_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  list_type TEXT DEFAULT 'general' CHECK (list_type IN ('general', 'prospects', 'customers', 'workshop_attendees', 'custom')),
  subscriber_count INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_subscriber_lists_org ON subscriber_lists(organization_id);
CREATE INDEX idx_subscriber_lists_type ON subscriber_lists(list_type);
CREATE INDEX idx_subscriber_lists_default ON subscriber_lists(organization_id, is_default)
  WHERE is_default = true;

CREATE TRIGGER update_subscriber_lists_updated_at
  BEFORE UPDATE ON subscriber_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES subscriber_lists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  -- Subscription status
  is_subscribed BOOLEAN DEFAULT true,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  -- Source tracking
  source TEXT, -- e.g., 'website', 'workshop', 'import', 'api'
  source_details JSONB DEFAULT '{}'::jsonb,
  -- Engagement metrics
  emails_received INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  last_email_at TIMESTAMPTZ,
  last_open_at TIMESTAMPTZ,
  last_click_at TIMESTAMPTZ,
  -- Custom fields
  custom_fields JSONB DEFAULT '{}'::jsonb,
  tags TEXT[],
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(list_id, email)
);

CREATE INDEX idx_subscribers_org ON newsletter_subscribers(organization_id);
CREATE INDEX idx_subscribers_list ON newsletter_subscribers(list_id);
CREATE INDEX idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_subscribers_subscribed ON newsletter_subscribers(is_subscribed)
  WHERE is_subscribed = true;
CREATE INDEX idx_subscribers_tags ON newsletter_subscribers USING GIN(tags);

CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CONTENT/POST MANAGEMENT
-- =====================================================

-- Unified content/post table for all channels
CREATE TABLE channel_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  -- Content
  title TEXT,
  body TEXT NOT NULL,
  body_html TEXT, -- Rich text version
  excerpt TEXT, -- Summary/preview
  -- Media
  media_urls TEXT[],
  thumbnail_url TEXT,
  -- Targeting
  target_platforms social_platform[], -- For social posts
  target_page_ids UUID[], -- Specific pages to post to
  target_list_ids UUID[], -- For newsletters
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  -- Status & workflow
  status approval_status NOT NULL DEFAULT 'draft',
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  -- AI generation metadata
  generated_by_ai BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  ai_model TEXT,
  -- Analytics
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[],
  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_channel_content_org ON channel_content(organization_id);
CREATE INDEX idx_channel_content_type ON channel_content(channel_type);
CREATE INDEX idx_channel_content_status ON channel_content(status);
CREATE INDEX idx_channel_content_scheduled ON channel_content(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX idx_channel_content_published ON channel_content(published_at)
  WHERE status = 'published';
CREATE INDEX idx_channel_content_platforms ON channel_content USING GIN(target_platforms);
CREATE INDEX idx_channel_content_tags ON channel_content USING GIN(tags);

CREATE TRIGGER update_channel_content_updated_at
  BEFORE UPDATE ON channel_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POST/PUBLICATION RESULTS
-- =====================================================

-- Track individual publication results per platform/page
CREATE TABLE publication_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES channel_content(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  -- Target
  channel_type channel_type NOT NULL,
  platform social_platform,
  page_id UUID REFERENCES social_pages(id) ON DELETE SET NULL,
  list_id UUID REFERENCES subscriber_lists(id) ON DELETE SET NULL,
  -- Publication details
  external_post_id TEXT, -- Platform's post ID
  external_post_url TEXT,
  published_at TIMESTAMPTZ,
  -- Status
  status approval_status NOT NULL DEFAULT 'scheduled',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  -- Analytics (per-platform)
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  -- For email/newsletter
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_unsubscribed INTEGER DEFAULT 0,
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pub_results_content ON publication_results(content_id);
CREATE INDEX idx_pub_results_org ON publication_results(organization_id);
CREATE INDEX idx_pub_results_platform ON publication_results(platform);
CREATE INDEX idx_pub_results_status ON publication_results(status);
CREATE INDEX idx_pub_results_published ON publication_results(published_at);

CREATE TRIGGER update_publication_results_updated_at
  BEFORE UPDATE ON publication_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- WORKSHOP ANNOUNCEMENTS
-- =====================================================

-- Workshop announcement configuration
CREATE TABLE workshop_announcement_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  -- Auto-announce settings
  auto_announce_new_workshops BOOLEAN DEFAULT false,
  announce_days_before INTEGER DEFAULT 7, -- Days before workshop to announce
  reminder_days_before INTEGER[] DEFAULT '{1, 3}', -- Send reminders
  -- Channel preferences
  announce_on_social BOOLEAN DEFAULT true,
  announce_via_email BOOLEAN DEFAULT true,
  announce_in_newsletter BOOLEAN DEFAULT true,
  -- Templates
  social_template TEXT,
  email_template TEXT,
  -- Branding
  default_image_url TEXT,
  include_instructor_info BOOLEAN DEFAULT true,
  include_pricing BOOLEAN DEFAULT true,
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX idx_workshop_announce_org ON workshop_announcement_settings(organization_id);
CREATE INDEX idx_workshop_announce_active ON workshop_announcement_settings(is_active)
  WHERE is_active = true;

CREATE TRIGGER update_workshop_announcement_settings_updated_at
  BEFORE UPDATE ON workshop_announcement_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CONTENT TEMPLATES
-- =====================================================

-- Reusable content templates
CREATE TABLE content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  -- Template info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., 'workshop', 'newsletter', 'product', 'engagement'
  -- Content
  title_template TEXT,
  body_template TEXT NOT NULL,
  body_html_template TEXT,
  -- Variables
  variables JSONB DEFAULT '[]'::jsonb, -- List of template variables
  -- Targeting
  platforms social_platform[], -- Applicable platforms
  -- Status
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_content_templates_org ON content_templates(organization_id);
CREATE INDEX idx_content_templates_channel ON content_templates(channel_type);
CREATE INDEX idx_content_templates_category ON content_templates(category);
CREATE INDEX idx_content_templates_active ON content_templates(is_active) WHERE is_active = true;

CREATE TRIGGER update_content_templates_updated_at
  BEFORE UPDATE ON content_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organization_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_announcement_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

-- Organization channels policies
CREATE POLICY "Users can view their org channels"
  ON organization_channels FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage channels"
  ON organization_channels FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Social OAuth policies
CREATE POLICY "Users can view their org OAuth connections"
  ON social_oauth_connections FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage OAuth connections"
  ON social_oauth_connections FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Social pages policies
CREATE POLICY "Users can view their org social pages"
  ON social_pages FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage social pages"
  ON social_pages FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Email configuration policies
CREATE POLICY "Users can view their org email config"
  ON email_configurations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage email config"
  ON email_configurations FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Newsletter configuration policies
CREATE POLICY "Users can view their org newsletter config"
  ON newsletter_configurations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage newsletter config"
  ON newsletter_configurations FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Subscriber list policies
CREATE POLICY "Users can view their org subscriber lists"
  ON subscriber_lists FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Team leads can manage subscriber lists"
  ON subscriber_lists FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin', 'team_lead')
  ));

-- Newsletter subscribers policies
CREATE POLICY "Users can view their org subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Team leads can manage subscribers"
  ON newsletter_subscribers FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin', 'team_lead')
  ));

-- Channel content policies
CREATE POLICY "Users can view their org content"
  ON channel_content FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create content"
  ON channel_content FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own content"
  ON channel_content FOR UPDATE
  USING (created_by = auth.uid() OR organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin', 'team_lead')
  ));

CREATE POLICY "Org admins can delete content"
  ON channel_content FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Publication results policies
CREATE POLICY "Users can view their org publication results"
  ON publication_results FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "System can manage publication results"
  ON publication_results FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Workshop announcement policies
CREATE POLICY "Users can view their org workshop settings"
  ON workshop_announcement_settings FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage workshop settings"
  ON workshop_announcement_settings FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Content templates policies
CREATE POLICY "Users can view their org templates"
  ON content_templates FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Team leads can manage templates"
  ON content_templates FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin', 'team_lead')
  ));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if organization has channel enabled
CREATE OR REPLACE FUNCTION check_channel_enabled(
  p_organization_id UUID,
  p_channel_type channel_type
)
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
  v_tier_required TEXT;
  v_org_tier TEXT;
BEGIN
  -- Get channel configuration
  SELECT is_enabled, tier_required INTO v_enabled, v_tier_required
  FROM organization_channels
  WHERE organization_id = p_organization_id AND channel_type = p_channel_type;

  IF NOT FOUND OR NOT v_enabled THEN
    RETURN FALSE;
  END IF;

  -- Get organization tier
  SELECT subscription_tier INTO v_org_tier
  FROM organizations
  WHERE id = p_organization_id;

  -- Check tier requirement
  RETURN CASE
    WHEN v_tier_required = 'free' THEN TRUE
    WHEN v_tier_required = 'starter' THEN v_org_tier IN ('starter', 'professional', 'enterprise')
    WHEN v_tier_required = 'professional' THEN v_org_tier IN ('professional', 'enterprise')
    WHEN v_tier_required = 'enterprise' THEN v_org_tier = 'enterprise'
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active social connections for organization
CREATE OR REPLACE FUNCTION get_active_social_connections(p_organization_id UUID)
RETURNS TABLE (
  connection_id UUID,
  platform social_platform,
  platform_username TEXT,
  pages_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    soc.id,
    soc.platform,
    soc.platform_username,
    COALESCE((
      SELECT COUNT(*)::INTEGER FROM social_pages sp
      WHERE sp.oauth_connection_id = soc.id AND sp.is_active = true
    ), 0)
  FROM social_oauth_connections soc
  WHERE soc.organization_id = p_organization_id
    AND soc.status = 'connected'
    AND (soc.token_expires_at IS NULL OR soc.token_expires_at > now())
  ORDER BY soc.platform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh subscriber count
CREATE OR REPLACE FUNCTION refresh_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE subscriber_lists
    SET subscriber_count = (
      SELECT COUNT(*) FROM newsletter_subscribers
      WHERE list_id = NEW.list_id AND is_subscribed = true
    )
    WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE subscriber_lists
    SET subscriber_count = (
      SELECT COUNT(*) FROM newsletter_subscribers
      WHERE list_id = OLD.list_id AND is_subscribed = true
    )
    WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_subscriber_count
  AFTER INSERT OR UPDATE OR DELETE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION refresh_subscriber_count();

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default channel types for new organizations (via trigger)
CREATE OR REPLACE FUNCTION initialize_organization_channels()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default channel configurations
  INSERT INTO organization_channels (organization_id, channel_type, is_enabled, tier_required)
  VALUES
    (NEW.id, 'email', true, 'free'),
    (NEW.id, 'social', false, 'starter'),
    (NEW.id, 'newsletter', false, 'professional'),
    (NEW.id, 'workshop', false, 'starter');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_org_channels
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION initialize_organization_channels();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE organization_channels IS 'Master configuration for enabled communication channels per organization';
COMMENT ON TABLE social_oauth_connections IS 'OAuth connections to social media platforms';
COMMENT ON TABLE social_pages IS 'Specific pages/accounts that can be posted to on social platforms';
COMMENT ON TABLE email_configurations IS 'Email sending configuration including provider settings';
COMMENT ON TABLE newsletter_configurations IS 'Newsletter-specific settings and branding';
COMMENT ON TABLE subscriber_lists IS 'Subscriber lists for organizing newsletter recipients';
COMMENT ON TABLE newsletter_subscribers IS 'Individual subscribers with engagement tracking';
COMMENT ON TABLE channel_content IS 'Unified content/posts for all communication channels';
COMMENT ON TABLE publication_results IS 'Track results of publishing content to each platform';
COMMENT ON TABLE workshop_announcement_settings IS 'Auto-announcement configuration for workshops';
COMMENT ON TABLE content_templates IS 'Reusable content templates with variable support';
