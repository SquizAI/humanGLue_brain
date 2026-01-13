-- Migration: 021_mind_map_nodes.sql
-- Description: Mind map nodes table for project visualization
-- Created: 2025-12-31

-- =====================================================
-- MIND MAP NODES TABLE
-- =====================================================

-- Status enum for mind map nodes
CREATE TYPE mind_map_node_status AS ENUM (
  'active',
  'blocked',
  'done',
  'planned'
);

-- Main table for mind map nodes
CREATE TABLE mind_map_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Node content
  label TEXT NOT NULL,
  description TEXT,

  -- Position coordinates
  x DOUBLE PRECISION NOT NULL DEFAULT 400,
  y DOUBLE PRECISION NOT NULL DEFAULT 300,

  -- Visual properties
  color TEXT NOT NULL DEFAULT '#06B6D4',

  -- Hierarchy
  children TEXT[] DEFAULT ARRAY[]::TEXT[],
  parent_id UUID REFERENCES mind_map_nodes(id) ON DELETE SET NULL,

  -- State
  expanded BOOLEAN NOT NULL DEFAULT false,
  status mind_map_node_status NOT NULL DEFAULT 'planned',

  -- Ownership
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Index on creator for filtering user's nodes
CREATE INDEX idx_mind_map_nodes_created_by ON mind_map_nodes(created_by);

-- Index on parent for hierarchy queries
CREATE INDEX idx_mind_map_nodes_parent ON mind_map_nodes(parent_id);

-- Index on status for filtering
CREATE INDEX idx_mind_map_nodes_status ON mind_map_nodes(status);

-- GIN index on children array for containment queries
CREATE INDEX idx_mind_map_nodes_children ON mind_map_nodes USING GIN(children);

-- Composite index for common queries (user + created_at)
CREATE INDEX idx_mind_map_nodes_user_created ON mind_map_nodes(created_by, created_at DESC);

-- =====================================================
-- TRIGGER FOR updated_at
-- =====================================================

CREATE TRIGGER update_mind_map_nodes_updated_at
  BEFORE UPDATE ON mind_map_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE mind_map_nodes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own mind map nodes
CREATE POLICY "Users can view own mind map nodes"
  ON mind_map_nodes
  FOR SELECT
  USING (auth.uid() = created_by);

-- Policy: Users can insert their own mind map nodes
CREATE POLICY "Users can create mind map nodes"
  ON mind_map_nodes
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own mind map nodes
CREATE POLICY "Users can update own mind map nodes"
  ON mind_map_nodes
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can delete their own mind map nodes
CREATE POLICY "Users can delete own mind map nodes"
  ON mind_map_nodes
  FOR DELETE
  USING (auth.uid() = created_by);

-- =====================================================
-- REALTIME SETUP
-- =====================================================

-- Enable realtime for mind_map_nodes table
ALTER PUBLICATION supabase_realtime ADD TABLE mind_map_nodes;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get all descendants of a node (recursive)
CREATE OR REPLACE FUNCTION get_mind_map_descendants(p_node_id UUID)
RETURNS TABLE(
  id UUID,
  label TEXT,
  depth INTEGER
) AS $$
WITH RECURSIVE node_tree AS (
  -- Base case: the starting node
  SELECT n.id, n.label, 0 AS depth
  FROM mind_map_nodes n
  WHERE n.id = p_node_id

  UNION ALL

  -- Recursive case: children of current nodes
  SELECT c.id, c.label, t.depth + 1
  FROM mind_map_nodes c
  JOIN node_tree t ON c.parent_id = t.id
)
SELECT id, label, depth
FROM node_tree
WHERE id != p_node_id; -- Exclude the starting node
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to update children array when parent_id changes
CREATE OR REPLACE FUNCTION sync_mind_map_children()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove from old parent's children if parent_id changed
  IF OLD.parent_id IS NOT NULL AND (NEW.parent_id IS NULL OR OLD.parent_id != NEW.parent_id) THEN
    UPDATE mind_map_nodes
    SET children = array_remove(children, OLD.id::TEXT)
    WHERE id = OLD.parent_id;
  END IF;

  -- Add to new parent's children if parent_id set
  IF NEW.parent_id IS NOT NULL AND (OLD.parent_id IS NULL OR OLD.parent_id != NEW.parent_id) THEN
    UPDATE mind_map_nodes
    SET children = array_append(children, NEW.id::TEXT)
    WHERE id = NEW.parent_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_mind_map_children_trigger
  AFTER UPDATE OF parent_id ON mind_map_nodes
  FOR EACH ROW
  WHEN (OLD.parent_id IS DISTINCT FROM NEW.parent_id)
  EXECUTE FUNCTION sync_mind_map_children();

-- Function to handle children sync on insert
CREATE OR REPLACE FUNCTION sync_mind_map_children_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    UPDATE mind_map_nodes
    SET children = array_append(children, NEW.id::TEXT)
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_mind_map_children_insert_trigger
  AFTER INSERT ON mind_map_nodes
  FOR EACH ROW
  WHEN (NEW.parent_id IS NOT NULL)
  EXECUTE FUNCTION sync_mind_map_children_insert();

-- Function to handle children sync on delete
CREATE OR REPLACE FUNCTION sync_mind_map_children_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.parent_id IS NOT NULL THEN
    UPDATE mind_map_nodes
    SET children = array_remove(children, OLD.id::TEXT)
    WHERE id = OLD.parent_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_mind_map_children_delete_trigger
  AFTER DELETE ON mind_map_nodes
  FOR EACH ROW
  WHEN (OLD.parent_id IS NOT NULL)
  EXECUTE FUNCTION sync_mind_map_children_delete();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE mind_map_nodes IS 'Mind map nodes for project visualization and architecture planning';
COMMENT ON COLUMN mind_map_nodes.label IS 'Display text for the node';
COMMENT ON COLUMN mind_map_nodes.description IS 'Optional longer description for the node';
COMMENT ON COLUMN mind_map_nodes.x IS 'X coordinate position on the canvas';
COMMENT ON COLUMN mind_map_nodes.y IS 'Y coordinate position on the canvas';
COMMENT ON COLUMN mind_map_nodes.color IS 'Hex color code for the node background';
COMMENT ON COLUMN mind_map_nodes.children IS 'Array of child node IDs (maintained via triggers)';
COMMENT ON COLUMN mind_map_nodes.parent_id IS 'Reference to parent node for hierarchy';
COMMENT ON COLUMN mind_map_nodes.expanded IS 'Whether the node children are visible';
COMMENT ON COLUMN mind_map_nodes.status IS 'Current status: active, blocked, done, or planned';

-- =====================================================
-- ROLLBACK SCRIPT (for reference)
-- =====================================================
/*
DROP TRIGGER IF EXISTS sync_mind_map_children_delete_trigger ON mind_map_nodes;
DROP TRIGGER IF EXISTS sync_mind_map_children_insert_trigger ON mind_map_nodes;
DROP TRIGGER IF EXISTS sync_mind_map_children_trigger ON mind_map_nodes;
DROP TRIGGER IF EXISTS update_mind_map_nodes_updated_at ON mind_map_nodes;
DROP FUNCTION IF EXISTS sync_mind_map_children_delete();
DROP FUNCTION IF EXISTS sync_mind_map_children_insert();
DROP FUNCTION IF EXISTS sync_mind_map_children();
DROP FUNCTION IF EXISTS get_mind_map_descendants(UUID);
DROP POLICY IF EXISTS "Users can delete own mind map nodes" ON mind_map_nodes;
DROP POLICY IF EXISTS "Users can update own mind map nodes" ON mind_map_nodes;
DROP POLICY IF EXISTS "Users can create mind map nodes" ON mind_map_nodes;
DROP POLICY IF EXISTS "Users can view own mind map nodes" ON mind_map_nodes;
DROP INDEX IF EXISTS idx_mind_map_nodes_user_created;
DROP INDEX IF EXISTS idx_mind_map_nodes_children;
DROP INDEX IF EXISTS idx_mind_map_nodes_status;
DROP INDEX IF EXISTS idx_mind_map_nodes_parent;
DROP INDEX IF EXISTS idx_mind_map_nodes_created_by;
DROP TABLE IF EXISTS mind_map_nodes;
DROP TYPE IF EXISTS mind_map_node_status;
*/
