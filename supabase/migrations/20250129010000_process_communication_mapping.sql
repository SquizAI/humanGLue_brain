-- Process & Communication Channel Mapping for HumanGlue Assessments
-- This enables mapping business processes, communication flows, and automation opportunities

-- =====================================================
-- BUSINESS PROCESSES
-- =====================================================

-- Business process catalog
CREATE TABLE IF NOT EXISTS business_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Process identification
  process_name TEXT NOT NULL,
  process_code TEXT NOT NULL, -- e.g., 'SALES_ONBOARDING', 'INVOICE_PROCESSING'
  process_category TEXT NOT NULL CHECK (process_category IN (
    'sales', 'marketing', 'operations', 'finance', 'hr',
    'customer_service', 'product', 'engineering', 'legal', 'other'
  )),

  -- Process details
  description TEXT,
  owner_role TEXT, -- Role responsible for process
  department TEXT,

  -- Process metrics
  frequency TEXT CHECK (frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'on_demand')),
  average_duration_minutes INTEGER,
  manual_effort_percentage INTEGER CHECK (manual_effort_percentage BETWEEN 0 AND 100),

  -- AI/Automation potential
  automation_score INTEGER CHECK (automation_score BETWEEN 0 AND 100), -- Calculated automation potential
  ai_enhancement_score INTEGER CHECK (ai_enhancement_score BETWEEN 0 AND 100), -- AI enhancement potential
  priority_rank INTEGER, -- 1 = highest priority for automation

  -- Status
  current_state TEXT CHECK (current_state IN ('manual', 'partially_automated', 'fully_automated', 'ai_enhanced')),
  target_state TEXT CHECK (target_state IN ('manual', 'partially_automated', 'fully_automated', 'ai_enhanced')),

  -- Metadata
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  last_assessed_at TIMESTAMPTZ,
  assessment_id UUID REFERENCES assessments(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, process_code)
);

-- Process steps within each business process
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES business_processes(id) ON DELETE CASCADE,

  -- Step identification
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_code TEXT NOT NULL, -- e.g., 'STEP_001'

  -- Step details
  description TEXT,
  responsible_role TEXT,

  -- Step type
  step_type TEXT CHECK (step_type IN (
    'decision', 'action', 'communication', 'data_entry',
    'review', 'approval', 'notification', 'integration', 'wait'
  )),

  -- Automation analysis
  is_automatable BOOLEAN DEFAULT false,
  automation_complexity TEXT CHECK (automation_complexity IN ('simple', 'moderate', 'complex')),
  requires_human_judgment BOOLEAN DEFAULT false,
  ai_can_assist BOOLEAN DEFAULT false,

  -- Time metrics
  average_duration_minutes INTEGER,
  wait_time_minutes INTEGER, -- Time waiting for next step

  -- Integration points
  systems_involved TEXT[], -- e.g., ['Salesforce', 'Slack', 'Email']
  data_inputs TEXT[],
  data_outputs TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(process_id, step_code)
);

-- =====================================================
-- COMMUNICATION CHANNELS
-- =====================================================

-- Communication channel inventory
CREATE TABLE IF NOT EXISTS communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Channel identification
  channel_name TEXT NOT NULL, -- e.g., 'Slack', 'Email', 'Teams'
  channel_type TEXT NOT NULL CHECK (channel_type IN (
    'email', 'instant_messaging', 'video_conferencing', 'phone',
    'project_management', 'crm', 'erp', 'custom', 'in_person'
  )),
  channel_provider TEXT, -- e.g., 'Microsoft', 'Slack', 'Zoom'

  -- Usage patterns
  primary_use_case TEXT, -- What is this channel mainly used for
  departments_using TEXT[], -- Which departments use this
  user_count INTEGER,

  -- Volume metrics
  daily_message_volume INTEGER,
  response_time_avg_minutes INTEGER,

  -- Integration status
  is_integrated BOOLEAN DEFAULT false,
  integration_type TEXT CHECK (integration_type IN ('api', 'webhook', 'manual', 'none')),
  api_available BOOLEAN DEFAULT false,

  -- AI/Automation potential
  ai_monitoring_potential INTEGER CHECK (ai_monitoring_potential BETWEEN 0 AND 100),
  automation_potential INTEGER CHECK (automation_potential BETWEEN 0 AND 100),
  humanglue_embeddable BOOLEAN DEFAULT false, -- Can HumanGlue be embedded here

  -- Assessment context
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  assessment_id UUID REFERENCES assessments(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, channel_name)
);

-- =====================================================
-- INFORMATION FLOWS
-- =====================================================

-- Information flow mapping between processes and channels
CREATE TABLE IF NOT EXISTS information_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Flow identification
  flow_name TEXT NOT NULL,
  flow_code TEXT NOT NULL,

  -- Source and destination
  source_type TEXT CHECK (source_type IN ('process', 'channel', 'system', 'person', 'external')),
  source_id TEXT, -- UUID of process/channel or name
  source_name TEXT NOT NULL,

  destination_type TEXT CHECK (destination_type IN ('process', 'channel', 'system', 'person', 'external')),
  destination_id TEXT,
  destination_name TEXT NOT NULL,

  -- Flow characteristics
  data_type TEXT CHECK (data_type IN (
    'document', 'message', 'notification', 'data_record',
    'approval', 'report', 'request', 'response', 'other'
  )),
  information_sensitivity TEXT CHECK (information_sensitivity IN ('public', 'internal', 'confidential', 'restricted')),

  -- Volume and frequency
  frequency TEXT CHECK (frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'monthly', 'on_demand')),
  volume_per_period INTEGER,

  -- Flow quality
  reliability_score INTEGER CHECK (reliability_score BETWEEN 0 AND 100), -- How reliable is this flow
  bottleneck_score INTEGER CHECK (bottleneck_score BETWEEN 0 AND 100), -- Is this a bottleneck

  -- AI/Automation opportunities
  can_be_automated BOOLEAN DEFAULT false,
  ai_enhancement_opportunity TEXT, -- Description of AI opportunity

  -- Assessment context
  assessment_id UUID REFERENCES assessments(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, flow_code)
);

-- =====================================================
-- TEAM & ROLE MAPPING
-- =====================================================

-- Team structure for org visualization
CREATE TABLE IF NOT EXISTS team_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Team identification
  team_name TEXT NOT NULL,
  team_code TEXT NOT NULL,
  department TEXT,

  -- Hierarchy
  parent_team_id UUID REFERENCES team_structures(id),
  level INTEGER DEFAULT 0, -- 0 = root, 1 = direct report, etc.

  -- Team details
  description TEXT,
  team_size INTEGER,
  primary_function TEXT,

  -- AI readiness
  ai_literacy_score INTEGER CHECK (ai_literacy_score BETWEEN 0 AND 100),
  change_readiness_score INTEGER CHECK (change_readiness_score BETWEEN 0 AND 100),

  -- Assessment context
  assessment_id UUID REFERENCES assessments(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, team_code)
);

-- Role definitions within teams
CREATE TABLE IF NOT EXISTS role_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES team_structures(id) ON DELETE CASCADE,

  -- Role identification
  role_name TEXT NOT NULL,
  role_code TEXT NOT NULL,

  -- Role details
  description TEXT,
  responsibilities TEXT[],
  required_skills TEXT[],

  -- AI impact analysis
  ai_impact_level TEXT CHECK (ai_impact_level IN ('high', 'medium', 'low', 'none')),
  augmentation_opportunities TEXT[], -- How AI can help
  displacement_risk INTEGER CHECK (displacement_risk BETWEEN 0 AND 100),
  upskilling_priority INTEGER CHECK (upskilling_priority BETWEEN 1 AND 10),

  -- Process involvement
  processes_involved UUID[], -- References to business_processes

  -- Assessment context
  assessment_id UUID REFERENCES assessments(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, role_code)
);

-- =====================================================
-- AUTOMATION OPPORTUNITIES
-- =====================================================

-- Identified automation/AI opportunities
CREATE TABLE IF NOT EXISTS automation_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Opportunity identification
  opportunity_name TEXT NOT NULL,
  opportunity_code TEXT NOT NULL,
  opportunity_type TEXT CHECK (opportunity_type IN (
    'rpa', 'ai_assistant', 'workflow_automation', 'chatbot',
    'data_pipeline', 'document_processing', 'decision_support', 'other'
  )),

  -- Related entities
  process_id UUID REFERENCES business_processes(id),
  channel_id UUID REFERENCES communication_channels(id),
  flow_id UUID REFERENCES information_flows(id),

  -- Opportunity details
  description TEXT,
  current_pain_points TEXT[],
  proposed_solution TEXT,

  -- Impact assessment
  time_savings_hours_weekly DECIMAL,
  cost_savings_monthly DECIMAL,
  quality_improvement_score INTEGER CHECK (quality_improvement_score BETWEEN 0 AND 100),
  employee_satisfaction_impact TEXT CHECK (employee_satisfaction_impact IN ('positive', 'neutral', 'negative')),

  -- Implementation
  implementation_complexity TEXT CHECK (implementation_complexity IN ('simple', 'moderate', 'complex')),
  estimated_implementation_weeks INTEGER,
  required_tools TEXT[],
  dependencies TEXT[],

  -- Prioritization
  priority_score INTEGER CHECK (priority_score BETWEEN 0 AND 100), -- Calculated priority
  quick_win BOOLEAN DEFAULT false,
  strategic_importance TEXT CHECK (strategic_importance IN ('critical', 'high', 'medium', 'low')),

  -- Status tracking
  status TEXT DEFAULT 'identified' CHECK (status IN (
    'identified', 'analyzed', 'approved', 'in_progress', 'implemented', 'deferred', 'rejected'
  )),

  -- Assessment context
  assessment_id UUID REFERENCES assessments(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, opportunity_code)
);

-- =====================================================
-- ASSESSMENT QUESTIONS FOR PROCESS MAPPING
-- =====================================================

-- Insert process mapping questions into question_bank
INSERT INTO question_bank (
  question_code, version, question_text, question_description, help_text,
  dimension, subdimension, answer_type, weight, display_order, is_active
) VALUES
-- Process Discovery Questions
('PROC_001', 1,
 'What are your top 5 most time-consuming business processes?',
 'Identify processes that consume the most employee time',
 'Think about activities that take more than 30 minutes and happen frequently',
 'embedding', 'process_discovery', 'text', 2, 100, true),

('PROC_002', 1,
 'Which of your processes involve the most manual data entry?',
 'Identify data entry bottlenecks',
 'Consider processes where information is copied between systems',
 'embedding', 'process_discovery', 'text', 2, 101, true),

('PROC_003', 1,
 'What processes require multiple approvals or handoffs between people?',
 'Map approval chains and collaboration points',
 'Look for processes that frequently get stuck waiting for someone',
 'embedding', 'process_discovery', 'text', 2, 102, true),

('PROC_004', 1,
 'How automated are your current business processes?',
 'Current automation level',
 NULL,
 'embedding', 'process_automation', 'scale', 1.5, 103, true),

-- Communication Channel Questions
('COMM_001', 1,
 'What are your primary communication tools? (Select all that apply)',
 'Inventory of communication channels',
 'Include email, chat, video, phone, and project management tools',
 'embedding', 'communication_channels', 'text', 1.5, 110, true),

('COMM_002', 1,
 'How fragmented is your team''s communication across different platforms?',
 'Communication fragmentation assessment',
 'Consider if important information gets lost between platforms',
 'embedding', 'communication_channels', 'scale', 1, 111, true),

('COMM_003', 1,
 'What percentage of your communication could benefit from AI assistance?',
 'AI opportunity in communications',
 'Consider drafting, summarizing, routing, or automating responses',
 'embedding', 'communication_channels', 'scale', 1.5, 112, true),

-- Information Flow Questions
('FLOW_001', 1,
 'Where does important information get stuck or lost in your organization?',
 'Identify information bottlenecks',
 'Think about where handoffs fail or information is delayed',
 'embedding', 'information_flow', 'text', 2, 120, true),

('FLOW_002', 1,
 'How easily can information flow between departments?',
 'Cross-departmental information flow',
 'Consider how easy it is for Sales to get info from Operations, etc.',
 'embedding', 'information_flow', 'scale', 1.5, 121, true),

('FLOW_003', 1,
 'What systems need to share data but currently don''t integrate well?',
 'Integration gaps identification',
 'Look for manual data transfer between systems',
 'embedding', 'information_flow', 'text', 1.5, 122, true),

-- Team Structure Questions
('TEAM_001', 1,
 'Describe your team structure and reporting relationships',
 'Organizational structure mapping',
 'Include departments, teams, and how they interact',
 'cultural', 'team_structure', 'text', 1, 130, true),

('TEAM_002', 1,
 'Which teams have the highest potential for AI-enhanced productivity?',
 'AI opportunity by team',
 'Consider teams doing repetitive tasks or heavy information processing',
 'cultural', 'team_structure', 'text', 1.5, 131, true)

ON CONFLICT (question_code, version) DO UPDATE
SET question_text = EXCLUDED.question_text,
    question_description = EXCLUDED.question_description,
    is_active = EXCLUDED.is_active;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate automation opportunity score
CREATE OR REPLACE FUNCTION calculate_automation_score(
  p_manual_effort INTEGER,
  p_frequency TEXT,
  p_complexity TEXT,
  p_data_volume INTEGER
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  freq_multiplier DECIMAL := 1.0;
  complexity_factor DECIMAL := 1.0;
BEGIN
  -- Base score from manual effort
  score := p_manual_effort;

  -- Frequency multiplier
  CASE p_frequency
    WHEN 'hourly' THEN freq_multiplier := 1.5;
    WHEN 'daily' THEN freq_multiplier := 1.3;
    WHEN 'weekly' THEN freq_multiplier := 1.1;
    WHEN 'monthly' THEN freq_multiplier := 0.9;
    ELSE freq_multiplier := 1.0;
  END CASE;

  -- Complexity factor (simpler = higher automation potential)
  CASE p_complexity
    WHEN 'simple' THEN complexity_factor := 1.2;
    WHEN 'moderate' THEN complexity_factor := 1.0;
    WHEN 'complex' THEN complexity_factor := 0.7;
    ELSE complexity_factor := 1.0;
  END CASE;

  -- Apply multipliers
  score := LEAST(100, GREATEST(0,
    (score * freq_multiplier * complexity_factor)::INTEGER
  ));

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to generate process flow for Mermaid visualization
CREATE OR REPLACE FUNCTION generate_process_mermaid(p_process_id UUID)
RETURNS TEXT AS $$
DECLARE
  mermaid_code TEXT := 'flowchart TD' || E'\n';
  step RECORD;
  prev_step_code TEXT := NULL;
BEGIN
  FOR step IN
    SELECT step_code, step_name, step_type, is_automatable
    FROM process_steps
    WHERE process_id = p_process_id
    ORDER BY step_number
  LOOP
    -- Add node
    CASE step.step_type
      WHEN 'decision' THEN
        mermaid_code := mermaid_code || '    ' || step.step_code || '{' || step.step_name || '}' || E'\n';
      WHEN 'action' THEN
        mermaid_code := mermaid_code || '    ' || step.step_code || '[' || step.step_name || ']' || E'\n';
      WHEN 'communication' THEN
        mermaid_code := mermaid_code || '    ' || step.step_code || '([' || step.step_name || '])' || E'\n';
      ELSE
        mermaid_code := mermaid_code || '    ' || step.step_code || '[' || step.step_name || ']' || E'\n';
    END CASE;

    -- Add styling for automatable steps
    IF step.is_automatable THEN
      mermaid_code := mermaid_code || '    style ' || step.step_code || ' fill:#90EE90' || E'\n';
    END IF;

    -- Add connection from previous step
    IF prev_step_code IS NOT NULL THEN
      mermaid_code := mermaid_code || '    ' || prev_step_code || ' --> ' || step.step_code || E'\n';
    END IF;

    prev_step_code := step.step_code;
  END LOOP;

  RETURN mermaid_code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate org structure Mermaid
CREATE OR REPLACE FUNCTION generate_org_mermaid(p_organization_id UUID)
RETURNS TEXT AS $$
DECLARE
  mermaid_code TEXT := 'flowchart TB' || E'\n';
  team RECORD;
BEGIN
  FOR team IN
    SELECT t.team_code, t.team_name, t.ai_literacy_score, p.team_code as parent_code
    FROM team_structures t
    LEFT JOIN team_structures p ON t.parent_team_id = p.id
    WHERE t.organization_id = p_organization_id
    ORDER BY t.level, t.team_name
  LOOP
    -- Add node
    mermaid_code := mermaid_code || '    ' || team.team_code || '["' || team.team_name || '"]' || E'\n';

    -- Color code by AI literacy
    IF team.ai_literacy_score >= 70 THEN
      mermaid_code := mermaid_code || '    style ' || team.team_code || ' fill:#90EE90' || E'\n';
    ELSIF team.ai_literacy_score >= 40 THEN
      mermaid_code := mermaid_code || '    style ' || team.team_code || ' fill:#FFD700' || E'\n';
    ELSE
      mermaid_code := mermaid_code || '    style ' || team.team_code || ' fill:#FFB6C1' || E'\n';
    END IF;

    -- Add connection to parent
    IF team.parent_code IS NOT NULL THEN
      mermaid_code := mermaid_code || '    ' || team.parent_code || ' --> ' || team.team_code || E'\n';
    END IF;
  END LOOP;

  RETURN mermaid_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_business_processes_org ON business_processes(organization_id);
CREATE INDEX IF NOT EXISTS idx_business_processes_category ON business_processes(process_category);
CREATE INDEX IF NOT EXISTS idx_business_processes_automation ON business_processes(automation_score DESC);
CREATE INDEX IF NOT EXISTS idx_process_steps_process ON process_steps(process_id);
CREATE INDEX IF NOT EXISTS idx_communication_channels_org ON communication_channels(organization_id);
CREATE INDEX IF NOT EXISTS idx_information_flows_org ON information_flows(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_structures_org ON team_structures(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_structures_parent ON team_structures(parent_team_id);
CREATE INDEX IF NOT EXISTS idx_automation_opportunities_org ON automation_opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_opportunities_priority ON automation_opportunities(priority_score DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE business_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE information_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_opportunities ENABLE ROW LEVEL SECURITY;

-- Users can view their organization's data
CREATE POLICY "Users can view org processes" ON business_processes
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view org channels" ON communication_channels
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view org flows" ON information_flows
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view org teams" ON team_structures
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view org roles" ON role_definitions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view org opportunities" ON automation_opportunities
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Admins can manage all data
CREATE POLICY "Admins manage processes" ON business_processes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
    )
  );

CREATE POLICY "Admins manage channels" ON communication_channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
    )
  );

CREATE POLICY "Admins manage flows" ON information_flows
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
    )
  );

CREATE POLICY "Admins manage teams" ON team_structures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
    )
  );

CREATE POLICY "Admins manage roles" ON role_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
    )
  );

CREATE POLICY "Admins manage opportunities" ON automation_opportunities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
    )
  );
