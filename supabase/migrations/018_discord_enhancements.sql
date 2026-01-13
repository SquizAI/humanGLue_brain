-- Migration: 018_discord_enhancements.sql
-- Description: Enhanced Discord bot features (Thread Intelligence, Task Management, Analytics)
-- Created: 2026-01-07

-- =====================================================
-- THREAD SUMMARIES
-- =====================================================

CREATE TABLE thread_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  discord_guild_id TEXT NOT NULL,
  discord_channel_id TEXT NOT NULL,
  discord_thread_id TEXT NOT NULL,

  -- Summary content
  title TEXT,
  summary TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  decisions JSONB DEFAULT '[]'::jsonb,

  -- Participants
  participants JSONB DEFAULT '[]'::jsonb,
  participant_count INTEGER DEFAULT 0,

  -- Stats
  message_count INTEGER DEFAULT 0,
  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,

  -- Metadata
  generated_by TEXT DEFAULT 'ai',
  model_used TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(discord_thread_id)
);

CREATE INDEX idx_thread_summaries_org ON thread_summaries(organization_id);
CREATE INDEX idx_thread_summaries_guild ON thread_summaries(discord_guild_id);
CREATE INDEX idx_thread_summaries_channel ON thread_summaries(discord_channel_id);
CREATE INDEX idx_thread_summaries_created ON thread_summaries(created_at DESC);

CREATE TRIGGER update_thread_summaries_updated_at
  BEFORE UPDATE ON thread_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MEETING TRANSCRIPTS
-- =====================================================

CREATE TABLE meeting_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  discord_guild_id TEXT NOT NULL,
  discord_voice_channel_id TEXT NOT NULL,
  discord_voice_channel_name TEXT,

  -- Transcript content
  title TEXT,
  transcript TEXT,
  summary TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,

  -- Participants
  participants JSONB DEFAULT '[]'::jsonb,
  participant_count INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Transcription metadata
  transcription_provider TEXT DEFAULT 'deepgram',
  audio_file_url TEXT,
  confidence_score DECIMAL(3,2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meeting_transcripts_org ON meeting_transcripts(organization_id);
CREATE INDEX idx_meeting_transcripts_guild ON meeting_transcripts(discord_guild_id);
CREATE INDEX idx_meeting_transcripts_started ON meeting_transcripts(started_at DESC);

CREATE TRIGGER update_meeting_transcripts_updated_at
  BEFORE UPDATE ON meeting_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- USER EXPERTISE PROFILES
-- =====================================================

CREATE TABLE user_expertise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  discord_user_id TEXT NOT NULL,

  -- Expertise info
  topic TEXT NOT NULL,
  topic_category TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.50 CHECK (confidence >= 0 AND confidence <= 1),

  -- Evidence
  message_count INTEGER DEFAULT 0,
  helpful_responses INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,

  -- Tracking
  first_demonstrated_at TIMESTAMPTZ DEFAULT now(),
  last_demonstrated_at TIMESTAMPTZ DEFAULT now(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(organization_id, discord_user_id, topic)
);

CREATE INDEX idx_user_expertise_org ON user_expertise(organization_id);
CREATE INDEX idx_user_expertise_user ON user_expertise(user_id);
CREATE INDEX idx_user_expertise_discord ON user_expertise(discord_user_id);
CREATE INDEX idx_user_expertise_topic ON user_expertise(topic);
CREATE INDEX idx_user_expertise_confidence ON user_expertise(confidence DESC);

CREATE TRIGGER update_user_expertise_updated_at
  BEFORE UPDATE ON user_expertise
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SENTIMENT TRACKING
-- =====================================================

CREATE TABLE sentiment_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  discord_guild_id TEXT NOT NULL,
  discord_channel_id TEXT,

  -- Sentiment data
  sentiment_score DECIMAL(4,3) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label TEXT CHECK (sentiment_label IN ('very_negative', 'negative', 'neutral', 'positive', 'very_positive')),

  -- Breakdown
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,

  -- Context
  message_count INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  snapshot_period TEXT DEFAULT 'daily' CHECK (snapshot_period IN ('hourly', 'daily', 'weekly', 'monthly')),
  snapshot_date DATE NOT NULL,

  -- Additional metrics
  engagement_score DECIMAL(3,2),
  topics JSONB DEFAULT '[]'::jsonb,
  concerns JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(organization_id, discord_guild_id, discord_channel_id, snapshot_date, snapshot_period)
);

CREATE INDEX idx_sentiment_org ON sentiment_snapshots(organization_id);
CREATE INDEX idx_sentiment_guild ON sentiment_snapshots(discord_guild_id);
CREATE INDEX idx_sentiment_date ON sentiment_snapshots(snapshot_date DESC);
CREATE INDEX idx_sentiment_score ON sentiment_snapshots(sentiment_score);

-- =====================================================
-- DISCORD TASKS (from conversations)
-- =====================================================

CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE discord_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Task info
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',

  -- Assignment
  assignee_discord_id TEXT,
  assignee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_by_discord_id TEXT,

  -- Source
  source_message_id TEXT,
  source_channel_id TEXT,
  source_guild_id TEXT,
  source_thread_id TEXT,
  extracted_from_text TEXT,

  -- Scheduling
  due_date TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,

  -- Tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- AI metadata
  ai_suggested BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2),
  suggested_assignee_reason TEXT
);

CREATE INDEX idx_tasks_org ON discord_tasks(organization_id);
CREATE INDEX idx_tasks_assignee ON discord_tasks(assignee_discord_id);
CREATE INDEX idx_tasks_status ON discord_tasks(status);
CREATE INDEX idx_tasks_priority ON discord_tasks(priority);
CREATE INDEX idx_tasks_due ON discord_tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_guild ON discord_tasks(source_guild_id);

CREATE TRIGGER update_discord_tasks_updated_at
  BEFORE UPDATE ON discord_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- KNOWLEDGE GAPS (repeated questions)
-- =====================================================

CREATE TABLE knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  discord_guild_id TEXT NOT NULL,

  -- Gap info
  topic TEXT NOT NULL,
  question_pattern TEXT,
  occurrence_count INTEGER DEFAULT 1,

  -- Context
  sample_questions JSONB DEFAULT '[]'::jsonb,
  asked_by_users JSONB DEFAULT '[]'::jsonb,
  channels JSONB DEFAULT '[]'::jsonb,

  -- Resolution
  is_resolved BOOLEAN DEFAULT false,
  resolution_type TEXT CHECK (resolution_type IN ('documentation', 'training', 'faq', 'expert_assigned', 'other')),
  resolution_link TEXT,
  resolved_at TIMESTAMPTZ,

  -- Suggested resources
  suggested_resources JSONB DEFAULT '[]'::jsonb,

  first_asked_at TIMESTAMPTZ DEFAULT now(),
  last_asked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_gaps_org ON knowledge_gaps(organization_id);
CREATE INDEX idx_knowledge_gaps_guild ON knowledge_gaps(discord_guild_id);
CREATE INDEX idx_knowledge_gaps_topic ON knowledge_gaps(topic);
CREATE INDEX idx_knowledge_gaps_count ON knowledge_gaps(occurrence_count DESC);
CREATE INDEX idx_knowledge_gaps_unresolved ON knowledge_gaps(is_resolved) WHERE is_resolved = false;

CREATE TRIGGER update_knowledge_gaps_updated_at
  BEFORE UPDATE ON knowledge_gaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- USER LEARNING PATHS
-- =====================================================

CREATE TABLE user_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  discord_user_id TEXT NOT NULL,

  -- Path info
  path_name TEXT NOT NULL,
  path_description TEXT,
  topics JSONB DEFAULT '[]'::jsonb,

  -- Progress
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  current_lesson_index INTEGER DEFAULT 0,

  -- Engagement
  total_time_spent_minutes INTEGER DEFAULT 0,
  quiz_scores JSONB DEFAULT '[]'::jsonb,
  average_quiz_score DECIMAL(5,2),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, path_name)
);

CREATE INDEX idx_learning_paths_org ON user_learning_paths(organization_id);
CREATE INDEX idx_learning_paths_user ON user_learning_paths(user_id);
CREATE INDEX idx_learning_paths_discord ON user_learning_paths(discord_user_id);
CREATE INDEX idx_learning_paths_status ON user_learning_paths(status);
CREATE INDEX idx_learning_paths_progress ON user_learning_paths(progress_percent);

CREATE TRIGGER update_user_learning_paths_updated_at
  BEFORE UPDATE ON user_learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTIFICATION PREFERENCES
-- =====================================================

CREATE TABLE discord_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  discord_user_id TEXT NOT NULL,

  -- Notification types
  thread_summaries BOOLEAN DEFAULT true,
  meeting_transcripts BOOLEAN DEFAULT true,
  learning_suggestions BOOLEAN DEFAULT true,
  topic_alerts BOOLEAN DEFAULT true,
  task_reminders BOOLEAN DEFAULT true,
  sentiment_alerts BOOLEAN DEFAULT false,
  expertise_requests BOOLEAN DEFAULT true,

  -- Alert topics (specific topics to be notified about)
  alert_topics JSONB DEFAULT '[]'::jsonb,

  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC',

  -- Delivery preferences
  dm_notifications BOOLEAN DEFAULT true,
  channel_mentions BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(discord_user_id)
);

CREATE INDEX idx_notif_prefs_org ON discord_notification_preferences(organization_id);
CREATE INDEX idx_notif_prefs_user ON discord_notification_preferences(user_id);
CREATE INDEX idx_notif_prefs_discord ON discord_notification_preferences(discord_user_id);

CREATE TRIGGER update_discord_notification_preferences_updated_at
  BEFORE UPDATE ON discord_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COLLABORATION PATTERNS
-- =====================================================

CREATE TABLE collaboration_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  discord_guild_id TEXT NOT NULL,

  -- Connection
  user_a_discord_id TEXT NOT NULL,
  user_b_discord_id TEXT NOT NULL,

  -- Metrics
  interaction_count INTEGER DEFAULT 1,
  reply_count INTEGER DEFAULT 0,
  mention_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  thread_co_participation INTEGER DEFAULT 0,

  -- Channels where interaction happens
  channels JSONB DEFAULT '[]'::jsonb,

  -- Strength (normalized 0-1)
  collaboration_strength DECIMAL(3,2) DEFAULT 0.10,

  first_interaction_at TIMESTAMPTZ DEFAULT now(),
  last_interaction_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(organization_id, discord_guild_id, user_a_discord_id, user_b_discord_id),
  CHECK (user_a_discord_id < user_b_discord_id)
);

CREATE INDEX idx_collab_org ON collaboration_edges(organization_id);
CREATE INDEX idx_collab_guild ON collaboration_edges(discord_guild_id);
CREATE INDEX idx_collab_user_a ON collaboration_edges(user_a_discord_id);
CREATE INDEX idx_collab_user_b ON collaboration_edges(user_b_discord_id);
CREATE INDEX idx_collab_strength ON collaboration_edges(collaboration_strength DESC);

CREATE TRIGGER update_collaboration_edges_updated_at
  BEFORE UPDATE ON collaboration_edges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTION SYNC MAPPINGS
-- =====================================================

CREATE TABLE notion_sync_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Notion info
  notion_database_id TEXT NOT NULL,
  notion_page_id TEXT,
  notion_workspace_id TEXT,

  -- Discord info
  discord_guild_id TEXT,
  discord_channel_id TEXT,
  discord_thread_id TEXT,
  discord_task_id UUID REFERENCES discord_tasks(id) ON DELETE CASCADE,

  -- Mapping type
  mapping_type TEXT NOT NULL CHECK (mapping_type IN ('task', 'thread', 'meeting', 'document')),

  -- Sync status
  last_synced_at TIMESTAMPTZ,
  sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('to_notion', 'from_notion', 'bidirectional')),
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error')),
  last_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(notion_page_id)
);

CREATE INDEX idx_notion_sync_org ON notion_sync_mappings(organization_id);
CREATE INDEX idx_notion_sync_database ON notion_sync_mappings(notion_database_id);
CREATE INDEX idx_notion_sync_type ON notion_sync_mappings(mapping_type);

CREATE TRIGGER update_notion_sync_mappings_updated_at
  BEFORE UPDATE ON notion_sync_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE thread_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notion_sync_mappings ENABLE ROW LEVEL SECURITY;

-- Thread summaries policies
CREATE POLICY "Users can view their org thread summaries"
  ON thread_summaries FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage thread summaries"
  ON thread_summaries FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Meeting transcripts policies
CREATE POLICY "Users can view their org meeting transcripts"
  ON meeting_transcripts FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage meeting transcripts"
  ON meeting_transcripts FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- User expertise policies
CREATE POLICY "Users can view their org expertise"
  ON user_expertise FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their own expertise"
  ON user_expertise FOR ALL
  USING (user_id = auth.uid());

-- Sentiment policies
CREATE POLICY "Users can view their org sentiment"
  ON sentiment_snapshots FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Discord tasks policies
CREATE POLICY "Users can view their org tasks"
  ON discord_tasks FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage tasks assigned to them"
  ON discord_tasks FOR UPDATE
  USING (assignee_user_id = auth.uid());

CREATE POLICY "Org admins can manage all tasks"
  ON discord_tasks FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- Knowledge gaps policies
CREATE POLICY "Users can view their org knowledge gaps"
  ON knowledge_gaps FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Learning paths policies
CREATE POLICY "Users can view their own learning paths"
  ON user_learning_paths FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own learning paths"
  ON user_learning_paths FOR ALL
  USING (user_id = auth.uid());

-- Notification preferences policies
CREATE POLICY "Users can view their own notification prefs"
  ON discord_notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own notification prefs"
  ON discord_notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- Collaboration edges policies
CREATE POLICY "Users can view their org collaboration"
  ON collaboration_edges FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Notion sync policies
CREATE POLICY "Users can view their org notion sync"
  ON notion_sync_mappings FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Org admins can manage notion sync"
  ON notion_sync_mappings FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
  ));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get top experts for a topic
CREATE OR REPLACE FUNCTION get_topic_experts(
  p_organization_id UUID,
  p_topic TEXT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  discord_user_id TEXT,
  confidence DECIMAL(3,2),
  message_count INTEGER,
  last_demonstrated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ue.discord_user_id,
    ue.confidence,
    ue.message_count,
    ue.last_demonstrated_at
  FROM user_expertise ue
  WHERE ue.organization_id = p_organization_id
    AND ue.topic ILIKE '%' || p_topic || '%'
    AND ue.confidence >= 0.5
  ORDER BY ue.confidence DESC, ue.message_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending tasks for a user
CREATE OR REPLACE FUNCTION get_user_pending_tasks(
  p_discord_user_id TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  priority task_priority,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dt.id,
    dt.title,
    dt.description,
    dt.priority,
    dt.due_date,
    dt.created_at
  FROM discord_tasks dt
  WHERE dt.assignee_discord_id = p_discord_user_id
    AND dt.status IN ('pending', 'in_progress')
  ORDER BY
    CASE dt.priority
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    dt.due_date NULLS LAST,
    dt.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update collaboration strength between two users
CREATE OR REPLACE FUNCTION update_collaboration(
  p_organization_id UUID,
  p_guild_id TEXT,
  p_user_a TEXT,
  p_user_b TEXT,
  p_interaction_type TEXT DEFAULT 'reply'
)
RETURNS VOID AS $$
DECLARE
  v_user_a TEXT;
  v_user_b TEXT;
BEGIN
  -- Ensure consistent ordering (smaller ID first)
  IF p_user_a < p_user_b THEN
    v_user_a := p_user_a;
    v_user_b := p_user_b;
  ELSE
    v_user_a := p_user_b;
    v_user_b := p_user_a;
  END IF;

  INSERT INTO collaboration_edges (
    organization_id, discord_guild_id, user_a_discord_id, user_b_discord_id,
    interaction_count, reply_count, mention_count, reaction_count
  )
  VALUES (
    p_organization_id, p_guild_id, v_user_a, v_user_b,
    1,
    CASE WHEN p_interaction_type = 'reply' THEN 1 ELSE 0 END,
    CASE WHEN p_interaction_type = 'mention' THEN 1 ELSE 0 END,
    CASE WHEN p_interaction_type = 'reaction' THEN 1 ELSE 0 END
  )
  ON CONFLICT (organization_id, discord_guild_id, user_a_discord_id, user_b_discord_id)
  DO UPDATE SET
    interaction_count = collaboration_edges.interaction_count + 1,
    reply_count = collaboration_edges.reply_count + CASE WHEN p_interaction_type = 'reply' THEN 1 ELSE 0 END,
    mention_count = collaboration_edges.mention_count + CASE WHEN p_interaction_type = 'mention' THEN 1 ELSE 0 END,
    reaction_count = collaboration_edges.reaction_count + CASE WHEN p_interaction_type = 'reaction' THEN 1 ELSE 0 END,
    last_interaction_at = now(),
    collaboration_strength = LEAST(1.0, (collaboration_edges.interaction_count + 1)::DECIMAL / 100),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE thread_summaries IS 'AI-generated summaries of Discord threads with action items and key decisions';
COMMENT ON TABLE meeting_transcripts IS 'Transcripts from Discord voice channel meetings with summaries';
COMMENT ON TABLE user_expertise IS 'Tracked expertise topics for each user based on their message patterns';
COMMENT ON TABLE sentiment_snapshots IS 'Periodic sentiment analysis snapshots for team morale tracking';
COMMENT ON TABLE discord_tasks IS 'Tasks extracted from Discord conversations with AI-suggested assignments';
COMMENT ON TABLE knowledge_gaps IS 'Identified knowledge gaps from repeated questions across channels';
COMMENT ON TABLE user_learning_paths IS 'Personalized learning paths for users with progress tracking';
COMMENT ON TABLE discord_notification_preferences IS 'User preferences for Discord bot notifications';
COMMENT ON TABLE collaboration_edges IS 'Graph edges representing collaboration strength between team members';
COMMENT ON TABLE notion_sync_mappings IS 'Mappings between Discord content and Notion pages/databases';
