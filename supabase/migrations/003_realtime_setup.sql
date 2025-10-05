-- =====================================================================================
-- Migration: Real-time Features Setup
-- Description: Notifications table, triggers, and Realtime configuration for instructor dashboard
-- Author: HumanGlue Development Team
-- Created: 2025-10-04
-- =====================================================================================

-- =====================================================================================
-- 1. NOTIFICATIONS TABLE
-- =====================================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'enrollment',
    'workshop_registration',
    'completion',
    'review',
    'question',
    'payment',
    'announcement',
    'co_instructor_update',
    'workshop_checkin'
  )),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,

  -- Indexes
  CONSTRAINT valid_notification_data CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

-- =====================================================================================
-- 2. STUDENT PRESENCE TRACKING
-- =====================================================================================

CREATE TABLE IF NOT EXISTS student_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  workshop_id uuid REFERENCES workshops(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('online', 'offline', 'away')),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,

  CONSTRAINT presence_target_check CHECK (
    (course_id IS NOT NULL AND workshop_id IS NULL) OR
    (course_id IS NULL AND workshop_id IS NOT NULL)
  )
);

CREATE INDEX idx_presence_user_id ON student_presence(user_id);
CREATE INDEX idx_presence_course_id ON student_presence(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX idx_presence_workshop_id ON student_presence(workshop_id) WHERE workshop_id IS NOT NULL;
CREATE INDEX idx_presence_status ON student_presence(status);

-- =====================================================================================
-- 3. NOTIFICATION TRIGGER FUNCTIONS
-- =====================================================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data, expires_at)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_expires_at)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Trigger: New enrollment notification
CREATE OR REPLACE FUNCTION notify_instructor_new_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_course_title text;
  v_student_name text;
  v_instructor_id uuid;
BEGIN
  -- Get course and student details
  SELECT c.title, c.instructor_id, u.name
  INTO v_course_title, v_instructor_id, v_student_name
  FROM courses c
  JOIN users u ON u.id = NEW.user_id
  WHERE c.id = NEW.course_id;

  -- Create notification for instructor
  PERFORM create_notification(
    v_instructor_id,
    'enrollment',
    'New Student Enrollment',
    v_student_name || ' enrolled in ' || v_course_title,
    jsonb_build_object(
      'enrollment_id', NEW.id,
      'course_id', NEW.course_id,
      'student_id', NEW.user_id,
      'student_name', v_student_name,
      'course_title', v_course_title
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_enrollment
AFTER INSERT ON enrollments
FOR EACH ROW
EXECUTE FUNCTION notify_instructor_new_enrollment();

-- Trigger: Workshop registration notification
CREATE OR REPLACE FUNCTION notify_instructor_workshop_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workshop_title text;
  v_student_name text;
  v_instructor_id uuid;
BEGIN
  SELECT w.title, w.instructor_id, u.name
  INTO v_workshop_title, v_instructor_id, v_student_name
  FROM workshops w
  JOIN users u ON u.id = NEW.user_id
  WHERE w.id = NEW.workshop_id;

  PERFORM create_notification(
    v_instructor_id,
    'workshop_registration',
    'New Workshop Registration',
    v_student_name || ' registered for ' || v_workshop_title,
    jsonb_build_object(
      'registration_id', NEW.id,
      'workshop_id', NEW.workshop_id,
      'student_id', NEW.user_id,
      'student_name', v_student_name,
      'workshop_title', v_workshop_title
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_workshop_registration
AFTER INSERT ON workshop_registrations
FOR EACH ROW
EXECUTE FUNCTION notify_instructor_workshop_registration();

-- Trigger: Course completion notification
CREATE OR REPLACE FUNCTION notify_instructor_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_course_title text;
  v_student_name text;
  v_instructor_id uuid;
BEGIN
  -- Only notify on first completion
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    SELECT c.title, c.instructor_id, u.name
    INTO v_course_title, v_instructor_id, v_student_name
    FROM courses c
    JOIN users u ON u.id = NEW.user_id
    WHERE c.id = NEW.course_id;

    PERFORM create_notification(
      v_instructor_id,
      'completion',
      'Course Completed',
      v_student_name || ' completed ' || v_course_title,
      jsonb_build_object(
        'enrollment_id', NEW.id,
        'course_id', NEW.course_id,
        'student_id', NEW.user_id,
        'student_name', v_student_name,
        'course_title', v_course_title,
        'completion_rate', NEW.completion_percentage
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_completion
AFTER UPDATE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION notify_instructor_completion();

-- Trigger: New review notification
CREATE OR REPLACE FUNCTION notify_instructor_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_course_title text;
  v_student_name text;
  v_instructor_id uuid;
BEGIN
  SELECT c.title, c.instructor_id, u.name
  INTO v_course_title, v_instructor_id, v_student_name
  FROM courses c
  JOIN users u ON u.id = NEW.user_id
  WHERE c.id = NEW.course_id;

  PERFORM create_notification(
    v_instructor_id,
    'review',
    'New Course Review',
    v_student_name || ' left a ' || NEW.rating || '-star review for ' || v_course_title,
    jsonb_build_object(
      'review_id', NEW.id,
      'course_id', NEW.course_id,
      'student_id', NEW.user_id,
      'student_name', v_student_name,
      'course_title', v_course_title,
      'rating', NEW.rating,
      'comment', NEW.comment
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_review
AFTER INSERT ON course_reviews
FOR EACH ROW
EXECUTE FUNCTION notify_instructor_new_review();

-- Trigger: Payment confirmation notification
CREATE OR REPLACE FUNCTION notify_instructor_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_instructor_id uuid;
  v_item_title text;
  v_student_name text;
BEGIN
  -- Only notify on successful payments
  IF NEW.status = 'succeeded' THEN
    -- Determine if course or workshop payment
    IF NEW.course_id IS NOT NULL THEN
      SELECT c.instructor_id, c.title, u.name
      INTO v_instructor_id, v_item_title, v_student_name
      FROM courses c
      JOIN users u ON u.id = NEW.user_id
      WHERE c.id = NEW.course_id;
    ELSIF NEW.workshop_id IS NOT NULL THEN
      SELECT w.instructor_id, w.title, u.name
      INTO v_instructor_id, v_item_title, v_student_name
      FROM workshops w
      JOIN users u ON u.id = NEW.user_id
      WHERE w.id = NEW.workshop_id;
    END IF;

    IF v_instructor_id IS NOT NULL THEN
      PERFORM create_notification(
        v_instructor_id,
        'payment',
        'Payment Received',
        'Payment of $' || (NEW.amount / 100.0) || ' received from ' || v_student_name,
        jsonb_build_object(
          'payment_id', NEW.id,
          'amount', NEW.amount,
          'student_id', NEW.user_id,
          'student_name', v_student_name,
          'item_title', v_item_title,
          'course_id', NEW.course_id,
          'workshop_id', NEW.workshop_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_payment
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION notify_instructor_payment();

-- =====================================================================================
-- 4. CLEANUP FUNCTIONS
-- =====================================================================================

-- Function to auto-delete old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete notifications older than 30 days OR past expiration
  DELETE FROM notifications
  WHERE created_at < now() - INTERVAL '30 days'
     OR (expires_at IS NOT NULL AND expires_at < now());

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Function to cleanup stale presence records
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Mark as offline if last seen > 5 minutes ago
  UPDATE student_presence
  SET status = 'offline'
  WHERE status IN ('online', 'away')
    AND last_seen_at < now() - INTERVAL '5 minutes';

  -- Delete offline records older than 24 hours
  DELETE FROM student_presence
  WHERE status = 'offline'
    AND last_seen_at < now() - INTERVAL '24 hours';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- =====================================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_presence ENABLE ROW LEVEL SECURITY;

-- Notifications: Users can only see their own notifications
CREATE POLICY notifications_select_own
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY notifications_update_own
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY notifications_delete_own
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- Student presence: Instructors can see presence for their courses/workshops
CREATE POLICY presence_select_instructor
ON student_presence FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = student_presence.course_id
      AND courses.instructor_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM workshops
    WHERE workshops.id = student_presence.workshop_id
      AND workshops.instructor_id = auth.uid()
  )
  OR student_presence.user_id = auth.uid()
);

CREATE POLICY presence_insert_own
ON student_presence FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY presence_update_own
ON student_presence FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================================================
-- 6. ENABLE REALTIME
-- =====================================================================================

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable Realtime for enrollments (for live stats)
ALTER PUBLICATION supabase_realtime ADD TABLE enrollments;

-- Enable Realtime for workshop_registrations
ALTER PUBLICATION supabase_realtime ADD TABLE workshop_registrations;

-- Enable Realtime for student_activity
ALTER PUBLICATION supabase_realtime ADD TABLE student_activity;

-- Enable Realtime for course_reviews
ALTER PUBLICATION supabase_realtime ADD TABLE course_reviews;

-- Enable Realtime for student_presence
ALTER PUBLICATION supabase_realtime ADD TABLE student_presence;

-- Enable Realtime for payments
ALTER PUBLICATION supabase_realtime ADD TABLE payments;

-- =====================================================================================
-- 7. HELPER VIEWS FOR REALTIME QUERIES
-- =====================================================================================

-- View: Unread notification count by user
CREATE OR REPLACE VIEW user_unread_notifications AS
SELECT
  user_id,
  COUNT(*) as unread_count,
  MAX(created_at) as latest_notification_at
FROM notifications
WHERE read_at IS NULL
  AND (expires_at IS NULL OR expires_at > now())
GROUP BY user_id;

-- View: Recent student activity for instructors
CREATE OR REPLACE VIEW instructor_recent_activity AS
SELECT
  sa.id,
  sa.user_id as student_id,
  sa.course_id,
  sa.lesson_id,
  sa.activity_type,
  sa.metadata,
  sa.created_at,
  u.name as student_name,
  u.avatar as student_avatar,
  c.title as course_title,
  c.instructor_id
FROM student_activity sa
JOIN users u ON u.id = sa.user_id
JOIN courses c ON c.id = sa.course_id
ORDER BY sa.created_at DESC;

-- View: Live course statistics
CREATE OR REPLACE VIEW live_course_stats AS
SELECT
  c.id as course_id,
  c.instructor_id,
  COUNT(DISTINCT e.id) as total_enrollments,
  COUNT(DISTINCT e.id) FILTER (WHERE e.completed_at IS NOT NULL) as completed_count,
  AVG(cr.rating) as average_rating,
  COUNT(DISTINCT cr.id) as review_count,
  COUNT(DISTINCT sp.id) FILTER (WHERE sp.status = 'online') as online_students
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
LEFT JOIN course_reviews cr ON cr.course_id = c.id
LEFT JOIN student_presence sp ON sp.course_id = c.id AND sp.status = 'online'
GROUP BY c.id, c.instructor_id;

-- =====================================================================================
-- 8. SCHEDULED CLEANUP (via pg_cron if available)
-- =====================================================================================

-- Note: This requires pg_cron extension
-- Uncomment if pg_cron is available in your Supabase instance

-- SELECT cron.schedule(
--   'cleanup-old-notifications',
--   '0 2 * * *', -- Run at 2 AM daily
--   'SELECT cleanup_old_notifications();'
-- );

-- SELECT cron.schedule(
--   'cleanup-stale-presence',
--   '*/5 * * * *', -- Run every 5 minutes
--   'SELECT cleanup_stale_presence();'
-- );

-- =====================================================================================
-- 9. GRANT PERMISSIONS
-- =====================================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON student_presence TO authenticated;
GRANT SELECT ON user_unread_notifications TO authenticated;
GRANT SELECT ON instructor_recent_activity TO authenticated;
GRANT SELECT ON live_course_stats TO authenticated;

-- =====================================================================================
-- Migration Complete
-- =====================================================================================

COMMENT ON TABLE notifications IS 'Stores user notifications for real-time updates';
COMMENT ON TABLE student_presence IS 'Tracks student online/offline presence in courses and workshops';
COMMENT ON FUNCTION create_notification IS 'Helper function to create notifications with validation';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Cleanup function for expired/old notifications';
COMMENT ON FUNCTION cleanup_stale_presence IS 'Cleanup function for stale presence records';
