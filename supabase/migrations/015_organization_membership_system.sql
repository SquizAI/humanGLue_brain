-- Migration: 015_organization_membership_system.sql
-- Description: Complete organization membership, invitations, and role management system
-- Dependencies: 001_multi_tenant_schema.sql, 008_admin_role_hierarchy.sql

-- ============================================================
-- STEP 1: Create organization_members table for direct user-org mapping
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Role within the organization
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'org_admin', 'team_lead', 'member')),

  -- Membership status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),

  -- Metadata
  title TEXT, -- Job title within org
  department TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  invited_by UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_org_member UNIQUE (organization_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.organization_members(role);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON public.organization_members(status);

-- ============================================================
-- STEP 2: Create organization_invitations table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Invitation details
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('org_admin', 'team_lead', 'member')),

  -- Optional team assignment
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),

  -- Inviter info
  invited_by UUID NOT NULL REFERENCES public.users(id),

  -- Expiration (default 7 days)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),

  -- Acceptance tracking
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES public.users(id),

  -- Custom message
  personal_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_pending_invite UNIQUE (organization_id, email, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_invites_org_id ON public.organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON public.organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON public.organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_status ON public.organization_invitations(status);
CREATE INDEX IF NOT EXISTS idx_org_invites_expires ON public.organization_invitations(expires_at);

-- ============================================================
-- STEP 3: Create subscription_plans table for tier definitions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan identification
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,

  -- Pricing
  price_monthly INTEGER NOT NULL DEFAULT 0, -- in cents
  price_yearly INTEGER NOT NULL DEFAULT 0, -- in cents

  -- Limits
  max_users INTEGER NOT NULL DEFAULT 5,
  max_teams INTEGER NOT NULL DEFAULT 1,
  max_assessments_per_month INTEGER DEFAULT NULL, -- NULL = unlimited
  max_storage_gb INTEGER NOT NULL DEFAULT 1,

  -- Features (JSON for flexibility)
  features JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Stripe integration
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  stripe_product_id TEXT,

  -- Display
  display_order INTEGER NOT NULL DEFAULT 0,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default plans
INSERT INTO public.subscription_plans (name, slug, price_monthly, price_yearly, max_users, max_teams, max_assessments_per_month, features, display_order, is_popular)
VALUES
  ('Free', 'free', 0, 0, 5, 1, 10, '["Basic AI Assessment", "Individual Results Dashboard", "Email Support"]'::jsonb, 1, false),
  ('Starter', 'starter', 4900, 47000, 25, 3, 100, '["Everything in Free", "Team Analytics", "Priority Support", "Export Reports"]'::jsonb, 2, false),
  ('Professional', 'professional', 14900, 143000, 100, 10, NULL, '["Everything in Starter", "Custom Branding", "API Access", "Dedicated Success Manager", "Advanced Analytics"]'::jsonb, 3, true),
  ('Enterprise', 'enterprise', 0, 0, -1, -1, NULL, '["Everything in Professional", "Unlimited Users", "SSO/SAML", "Custom Integrations", "On-Premise Option", "SLA"]'::jsonb, 4, false)
ON CONFLICT (slug) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_users = EXCLUDED.max_users,
  max_teams = EXCLUDED.max_teams,
  features = EXCLUDED.features,
  updated_at = now();

-- ============================================================
-- STEP 4: Create organization_subscriptions table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),

  -- Billing cycle
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'paused')),

  -- Dates
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 month'),
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,

  -- Usage tracking
  current_user_count INTEGER NOT NULL DEFAULT 1,
  current_team_count INTEGER NOT NULL DEFAULT 0,
  current_assessment_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Only one active subscription per org
  CONSTRAINT unique_active_subscription UNIQUE (organization_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_subs_org_id ON public.organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subs_status ON public.organization_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_org_subs_stripe ON public.organization_subscriptions(stripe_subscription_id);

-- ============================================================
-- STEP 5: RLS Policies for organization_members
-- ============================================================

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Users can view members of organizations they belong to
CREATE POLICY "org_members_select_policy" ON public.organization_members
  FOR SELECT
  USING (
    -- User is a member of the same organization
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
    OR
    -- User is a platform admin
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin_full')
    )
  );

-- Org admins and owners can insert members
CREATE POLICY "org_members_insert_policy" ON public.organization_members
  FOR INSERT
  WITH CHECK (
    -- User is org_admin or owner of the organization
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = auth.uid()
        AND organization_id = organization_members.organization_id
        AND role IN ('owner', 'org_admin')
    )
    OR
    -- Platform admin
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin_full')
    )
  );

-- Org admins and owners can update members
CREATE POLICY "org_members_update_policy" ON public.organization_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = organization_members.organization_id
        AND om.role IN ('owner', 'org_admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin_full')
    )
  );

-- Org owners can delete members (not themselves)
CREATE POLICY "org_members_delete_policy" ON public.organization_members
  FOR DELETE
  USING (
    (
      EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.user_id = auth.uid()
          AND om.organization_id = organization_members.organization_id
          AND om.role IN ('owner', 'org_admin')
      )
      AND user_id != auth.uid() -- Can't delete yourself
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin_full')
    )
  );

-- ============================================================
-- STEP 6: RLS Policies for organization_invitations
-- ============================================================

ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations for orgs they manage
CREATE POLICY "org_invites_select_policy" ON public.organization_invitations
  FOR SELECT
  USING (
    -- Org admin/owner
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = auth.uid()
        AND organization_id = organization_invitations.organization_id
        AND role IN ('owner', 'org_admin')
    )
    OR
    -- The invited email matches current user
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- Platform admin
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin_full')
    )
  );

-- Org admins can create invitations
CREATE POLICY "org_invites_insert_policy" ON public.organization_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = auth.uid()
        AND organization_id = organization_invitations.organization_id
        AND role IN ('owner', 'org_admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin_full')
    )
  );

-- Org admins can update invitations (revoke, etc)
CREATE POLICY "org_invites_update_policy" ON public.organization_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = auth.uid()
        AND organization_id = organization_invitations.organization_id
        AND role IN ('owner', 'org_admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin_full')
    )
  );

-- ============================================================
-- STEP 7: RLS Policies for subscriptions
-- ============================================================

ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;

-- Org members can view their org's subscription
CREATE POLICY "org_subs_select_policy" ON public.organization_subscriptions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin_full')
    )
  );

-- Only platform admins can modify subscriptions
CREATE POLICY "org_subs_modify_policy" ON public.organization_subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin_full')
    )
  );

-- Plans are viewable by everyone
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_select_policy" ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

-- ============================================================
-- STEP 8: Helper Functions
-- ============================================================

-- Function to check if user can manage organization
CREATE OR REPLACE FUNCTION public.can_manage_organization(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = p_user_id
      AND organization_id = p_org_id
      AND role IN ('owner', 'org_admin')
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's primary organization
CREATE OR REPLACE FUNCTION public.get_user_primary_organization(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM public.organization_members
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY
    CASE role
      WHEN 'owner' THEN 1
      WHEN 'org_admin' THEN 2
      ELSE 3
    END,
    joined_at ASC
  LIMIT 1;

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check organization limits
CREATE OR REPLACE FUNCTION public.check_org_limits(p_org_id UUID, p_check_type TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_current_count INTEGER;
  v_max_count INTEGER;
  v_plan_name TEXT;
BEGIN
  -- Get plan limits
  SELECT
    sp.name,
    CASE p_check_type
      WHEN 'users' THEN sp.max_users
      WHEN 'teams' THEN sp.max_teams
      WHEN 'assessments' THEN sp.max_assessments_per_month
    END
  INTO v_plan_name, v_max_count
  FROM public.organization_subscriptions os
  JOIN public.subscription_plans sp ON sp.id = os.plan_id
  WHERE os.organization_id = p_org_id
    AND os.status IN ('active', 'trialing');

  -- If no subscription found, use free tier defaults
  IF v_max_count IS NULL THEN
    v_max_count := CASE p_check_type
      WHEN 'users' THEN 5
      WHEN 'teams' THEN 1
      WHEN 'assessments' THEN 10
    END;
    v_plan_name := 'Free';
  END IF;

  -- Get current count
  v_current_count := CASE p_check_type
    WHEN 'users' THEN (SELECT COUNT(*) FROM public.organization_members WHERE organization_id = p_org_id AND status = 'active')
    WHEN 'teams' THEN (SELECT COUNT(*) FROM public.teams WHERE organization_id = p_org_id)
    WHEN 'assessments' THEN (SELECT COUNT(*) FROM public.assessments WHERE organization_id = p_org_id AND created_at >= date_trunc('month', now()))
  END;

  v_result := jsonb_build_object(
    'plan', v_plan_name,
    'check_type', p_check_type,
    'current', v_current_count,
    'max', v_max_count,
    'unlimited', (v_max_count = -1),
    'at_limit', (v_max_count != -1 AND v_current_count >= v_max_count),
    'remaining', CASE WHEN v_max_count = -1 THEN -1 ELSE v_max_count - v_current_count END
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 9: Triggers for updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_org_members_updated_at ON public.organization_members;
CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_org_invites_updated_at ON public.organization_invitations;
CREATE TRIGGER update_org_invites_updated_at
  BEFORE UPDATE ON public.organization_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_org_subs_updated_at ON public.organization_subscriptions;
CREATE TRIGGER update_org_subs_updated_at
  BEFORE UPDATE ON public.organization_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- STEP 10: Auto-create organization owner membership
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- If owner_id is set, create owner membership
  IF NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.organization_members (
      organization_id,
      user_id,
      role,
      status,
      joined_at
    ) VALUES (
      NEW.id,
      NEW.owner_id,
      'owner',
      'active',
      now()
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
      role = 'owner',
      status = 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add owner_id column to organizations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN owner_id UUID REFERENCES public.users(id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;
CREATE TRIGGER on_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_organization();

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ organization_members table created';
  RAISE NOTICE '✅ organization_invitations table created';
  RAISE NOTICE '✅ subscription_plans table created with default plans';
  RAISE NOTICE '✅ organization_subscriptions table created';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '✅ Helper functions created';
  RAISE NOTICE '✅ Triggers configured';
END $$;
