-- =====================================================
-- Migration: 014_announcement_logs
-- Description: Add announcement logs and scheduled tasks tables
-- =====================================================

-- Announcement logs table (tracks all announcement activities)
CREATE TABLE IF NOT EXISTS announcement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workshop_id UUID,
    announcement_type VARCHAR(50) NOT NULL DEFAULT 'initial', -- initial, reminder, update
    channels_attempted TEXT[] DEFAULT '{}',
    channels_succeeded TEXT[] DEFAULT '{}',
    results JSONB DEFAULT '[]',
    success_rate DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled tasks table (for reminders and scheduled announcements)
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL, -- workshop_reminder, scheduled_post, newsletter_send
    payload JSONB DEFAULT '{}',
    scheduled_at TIMESTAMPTZ NOT NULL,
    executed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_announcement_logs_org ON announcement_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_announcement_logs_workshop ON announcement_logs(workshop_id);
CREATE INDEX IF NOT EXISTS idx_announcement_logs_created ON announcement_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_org ON scheduled_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_scheduled_at ON scheduled_tasks(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_pending ON scheduled_tasks(status, scheduled_at) WHERE status = 'pending';

-- RLS policies
ALTER TABLE announcement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Announcement logs policies
CREATE POLICY "Users can view their organization's announcement logs"
    ON announcement_logs FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert announcement logs for their organization"
    ON announcement_logs FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Scheduled tasks policies
CREATE POLICY "Users can view their organization's scheduled tasks"
    ON scheduled_tasks FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage scheduled tasks"
    ON scheduled_tasks FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
        )
    );

-- Function to process pending scheduled tasks (for cron job)
CREATE OR REPLACE FUNCTION process_pending_scheduled_tasks()
RETURNS INTEGER AS $$
DECLARE
    task_count INTEGER := 0;
    task RECORD;
BEGIN
    -- Mark tasks as processing
    FOR task IN
        SELECT id, task_type, payload, organization_id
        FROM scheduled_tasks
        WHERE status = 'pending'
        AND scheduled_at <= NOW()
        AND retry_count < max_retries
        ORDER BY scheduled_at ASC
        LIMIT 100
        FOR UPDATE SKIP LOCKED
    LOOP
        -- Mark as processing
        UPDATE scheduled_tasks
        SET status = 'processing', updated_at = NOW()
        WHERE id = task.id;

        task_count := task_count + 1;
    END LOOP;

    RETURN task_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a scheduled task
CREATE OR REPLACE FUNCTION complete_scheduled_task(
    p_task_id UUID,
    p_result JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE scheduled_tasks
    SET
        status = 'completed',
        executed_at = NOW(),
        result = p_result,
        updated_at = NOW()
    WHERE id = p_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to fail a scheduled task
CREATE OR REPLACE FUNCTION fail_scheduled_task(
    p_task_id UUID,
    p_error TEXT
)
RETURNS VOID AS $$
DECLARE
    current_retries INTEGER;
    max_retry INTEGER;
BEGIN
    SELECT retry_count, max_retries INTO current_retries, max_retry
    FROM scheduled_tasks WHERE id = p_task_id;

    IF current_retries + 1 >= max_retry THEN
        UPDATE scheduled_tasks
        SET
            status = 'failed',
            error_message = p_error,
            retry_count = retry_count + 1,
            updated_at = NOW()
        WHERE id = p_task_id;
    ELSE
        -- Reset to pending for retry
        UPDATE scheduled_tasks
        SET
            status = 'pending',
            error_message = p_error,
            retry_count = retry_count + 1,
            updated_at = NOW()
        WHERE id = p_task_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE announcement_logs IS 'Tracks all workshop announcements sent across channels';
COMMENT ON TABLE scheduled_tasks IS 'Queue for scheduled operations like reminders and posts';
COMMENT ON FUNCTION process_pending_scheduled_tasks IS 'Marks pending tasks as processing for execution';
COMMENT ON FUNCTION complete_scheduled_task IS 'Marks a task as completed with optional result';
COMMENT ON FUNCTION fail_scheduled_task IS 'Marks a task as failed, with automatic retry logic';
