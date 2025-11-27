-- Migration: 006_add_payment_failed_status.sql
-- Description: Add 'payment_failed' status to workshop_registrations
-- Dependencies: 002_create_workshops.sql

-- Add payment_failed status to workshop_registrations
ALTER TABLE public.workshop_registrations
  DROP CONSTRAINT IF EXISTS workshop_registrations_status_check;

ALTER TABLE public.workshop_registrations
  ADD CONSTRAINT workshop_registrations_status_check
  CHECK (status IN ('registered', 'completed', 'cancelled', 'no_show', 'payment_failed', 'pending_payment'));

-- Update the trigger to handle pending_payment status
-- When payment is pending, don't decrement capacity yet
DROP TRIGGER IF EXISTS decrement_capacity_on_registration ON public.workshop_registrations;

CREATE TRIGGER decrement_capacity_on_registration
  BEFORE INSERT ON public.workshop_registrations
  FOR EACH ROW
  WHEN (NEW.status = 'registered')
  EXECUTE FUNCTION decrement_workshop_capacity();

-- Add index for payment_failed status for quick queries
CREATE INDEX IF NOT EXISTS idx_registrations_payment_failed
  ON public.workshop_registrations(workshop_id, status)
  WHERE status = 'payment_failed';

COMMENT ON CONSTRAINT workshop_registrations_status_check ON public.workshop_registrations
  IS 'Valid registration statuses: registered, completed, cancelled, no_show, payment_failed, pending_payment';

-- ============================================================
-- ROLLBACK
-- ============================================================
-- ALTER TABLE public.workshop_registrations
--   DROP CONSTRAINT IF EXISTS workshop_registrations_status_check;
-- ALTER TABLE public.workshop_registrations
--   ADD CONSTRAINT workshop_registrations_status_check
--   CHECK (status IN ('registered', 'completed', 'cancelled', 'no_show'));
-- DROP INDEX IF EXISTS idx_registrations_payment_failed;
