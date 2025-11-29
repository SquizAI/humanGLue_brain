-- Migration: Add custom_domain support to organizations table
-- Phase 5: Custom Domain Support
-- Date: 2025-01-28

-- Add custom_domain column with unique constraint
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;

-- Add index for fast domain lookups
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain
ON organizations(custom_domain);

-- Add comment explaining the column
COMMENT ON COLUMN organizations.custom_domain IS 'Custom domain for white-label access (e.g., platform.acme.com). Must be unique across all organizations.';

-- Note: Organizations can optionally configure a custom domain.
-- When set, the platform will detect the organization from the domain
-- and automatically load branding without requiring authentication.
