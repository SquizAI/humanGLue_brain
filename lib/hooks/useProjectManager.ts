'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

// Types for Project Manager
export interface ProjectNote {
  id: string
  title: string
  content: string | null
  status: 'todo' | 'in_progress' | 'progress' | 'done' | 'completed' | 'blocked' | 'review' | 'backlog' | 'active'
  priority: 'low' | 'medium' | 'high' | 'critical'
  start_date: string | null
  due_date: string | null
  diagram_view: string | null
  node_reference: string | null
  created_by: string | null
  created_by_name: string | null
  created_at: string
  updated_at: string
}

export interface RoadmapItem {
  id: string
  title: string
  description: string | null
  category: 'feature' | 'integration' | 'infrastructure' | 'design' | 'other'
  status: 'planned' | 'in_progress' | 'progress' | 'completed' | 'done' | 'blocked' | 'active' | 'review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  start_date: string | null
  end_date: string | null
  progress: number
  assignee: string | null
  tags: string[] | null
  dependencies: string[] | null
  metadata: Record<string, any> | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MindReasonerResponse {
  thinking?: string
  feeling?: string
  saying?: string
  acting?: string
  summary?: string
}

export interface MindMapNode {
  id: string
  label: string
  x: number
  y: number
  color: string
  children: string[]
  expanded: boolean
  status: 'active' | 'blocked' | 'done' | 'planned'
  description: string | null
  parent_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export function useProjectNotes() {
  const [notes, setNotes] = useState<ProjectNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('project_notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setNotes(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching notes:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createNote = async (note: Partial<ProjectNote>) => {
    try {
      const { data, error: createError } = await (supabase
        .from('project_notes') as any)
        .insert([{
          title: note.title || 'Untitled',
          content: note.content || '',
          status: note.status || 'todo',
          priority: note.priority || 'medium',
          start_date: note.start_date,
          due_date: note.due_date,
          diagram_view: note.diagram_view,
          node_reference: note.node_reference,
        }])
        .select()
        .single()

      if (createError) throw createError
      setNotes(prev => [data as ProjectNote, ...prev])
      return data as ProjectNote
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateNote = async (id: string, updates: Partial<ProjectNote>) => {
    try {
      const { data, error: updateError } = await (supabase
        .from('project_notes') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      setNotes(prev => prev.map(n => n.id === id ? data as ProjectNote : n))
      return data as ProjectNote
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchNotes()

    // Set up real-time subscription
    const channel = supabase
      .channel('project_notes_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'project_notes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes(prev => [payload.new as ProjectNote, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setNotes(prev => prev.map(n => n.id === payload.new.id ? payload.new as ProjectNote : n))
          } else if (payload.eventType === 'DELETE') {
            setNotes(prev => prev.filter(n => n.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotes, supabase])

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  }
}

export function useRoadmapItems() {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('roadmap_items')
        .select('*')
        .order('start_date', { ascending: true })

      if (fetchError) throw fetchError
      setItems(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching roadmap items:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createItem = async (item: Partial<RoadmapItem>) => {
    try {
      const { data, error: createError } = await (supabase
        .from('roadmap_items') as any)
        .insert([{
          title: item.title || 'Untitled',
          description: item.description || '',
          category: item.category || 'feature',
          status: item.status || 'planned',
          priority: item.priority || 'medium',
          start_date: item.start_date,
          end_date: item.end_date,
          progress: item.progress || 0,
          assignee: item.assignee,
          tags: item.tags,
          dependencies: item.dependencies,
          metadata: item.metadata,
        }])
        .select()
        .single()

      if (createError) throw createError
      setItems(prev => [...prev, data as RoadmapItem])
      return data as RoadmapItem
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateItem = async (id: string, updates: Partial<RoadmapItem>) => {
    try {
      const { data, error: updateError } = await (supabase
        .from('roadmap_items') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      setItems(prev => prev.map(i => i.id === id ? data as RoadmapItem : i))
      return data as RoadmapItem
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('roadmap_items')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchItems()

    // Set up real-time subscription
    const channel = supabase
      .channel('roadmap_items_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'roadmap_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems(prev => [...prev, payload.new as RoadmapItem])
          } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(i => i.id === payload.new.id ? payload.new as RoadmapItem : i))
          } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(i => i.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchItems, supabase])

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  }
}

export function useMindReasoner() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const simulate = async (mindId: string, message: string): Promise<MindReasonerResponse | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/.netlify/functions/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mindId,
          message,
          model: 'mind-reasoner-pro',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Mind Reasoner API error')
      }

      const data = await response.json()
      return data
    } catch (err: any) {
      setError(err.message)
      console.error('Mind Reasoner error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    simulate,
    loading,
    error,
  }
}

// ==========================================
// Mind Map Nodes Hook
// ==========================================

// Default nodes for initial state (when database is empty)
const defaultMindMapNodes: Omit<MindMapNode, 'created_by' | 'created_at' | 'updated_at'>[] = [
  { id: 'root', label: 'HMN', x: 400, y: 300, color: '#06B6D4', children: ['platform', 'integrations', 'ai'], expanded: true, status: 'active', description: null, parent_id: null },
  { id: 'platform', label: 'Platform', x: 200, y: 150, color: '#8B5CF6', children: ['dashboard', 'auth'], expanded: true, status: 'active', description: null, parent_id: 'root' },
  { id: 'integrations', label: 'Integrations', x: 600, y: 150, color: '#10B981', children: ['discord', 'slack'], expanded: true, status: 'planned', description: null, parent_id: 'root' },
  { id: 'ai', label: 'AI Features', x: 400, y: 500, color: '#F59E0B', children: ['mindmap', 'chat'], expanded: true, status: 'active', description: null, parent_id: 'root' },
  { id: 'dashboard', label: 'Dashboard', x: 100, y: 250, color: '#EC4899', children: [], expanded: false, status: 'done', description: null, parent_id: 'platform' },
  { id: 'auth', label: 'Auth', x: 300, y: 250, color: '#EC4899', children: [], expanded: false, status: 'done', description: null, parent_id: 'platform' },
  { id: 'discord', label: 'Discord Bot', x: 500, y: 250, color: '#6366F1', children: [], expanded: false, status: 'active', description: null, parent_id: 'integrations' },
  { id: 'slack', label: 'Slack', x: 700, y: 250, color: '#6366F1', children: [], expanded: false, status: 'blocked', description: null, parent_id: 'integrations' },
  { id: 'mindmap', label: 'Mind Reasoner', x: 300, y: 600, color: '#EF4444', children: [], expanded: false, status: 'active', description: null, parent_id: 'ai' },
  { id: 'chat', label: 'AI Chat', x: 500, y: 600, color: '#EF4444', children: [], expanded: false, status: 'done', description: null, parent_id: 'ai' },
]

export function useMindMapNodes() {
  const [nodes, setNodes] = useState<MindMapNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const supabase = createClient()

  const fetchNodes = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await (supabase
        .from('mind_map_nodes') as any)
        .select('*')
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setNodes(data || [])
      setError(null)
      setInitialized(true)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching mind map nodes:', err)
      setInitialized(true)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createNode = async (node: Partial<MindMapNode>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error: createError } = await (supabase
        .from('mind_map_nodes') as any)
        .insert([{
          label: node.label || 'New Node',
          x: node.x ?? 400,
          y: node.y ?? 300,
          color: node.color || '#06B6D4',
          children: node.children || [],
          expanded: node.expanded ?? false,
          status: node.status || 'planned',
          description: node.description || null,
          parent_id: node.parent_id || null,
          created_by: user.id,
        }])
        .select()
        .single()

      if (createError) throw createError
      setNodes(prev => [...prev, data as MindMapNode])
      return data as MindMapNode
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateNode = async (id: string, updates: Partial<MindMapNode>) => {
    try {
      // Optimistically update local state for smooth drag experience
      setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n))

      const { data, error: updateError } = await (supabase
        .from('mind_map_nodes') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        // Revert on error
        fetchNodes()
        throw updateError
      }
      return data as MindMapNode
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteNode = async (id: string) => {
    try {
      // First, find the node to get its parent_id
      const nodeToDelete = nodes.find(n => n.id === id)

      // Find all descendants to delete (cascade)
      const getDescendantIds = (nodeId: string): string[] => {
        const node = nodes.find(n => n.id === nodeId)
        if (!node) return []
        const childIds = node.children || []
        return [...childIds, ...childIds.flatMap(getDescendantIds)]
      }

      const descendantIds = getDescendantIds(id)
      const idsToDelete = [id, ...descendantIds]

      // Optimistically update local state
      setNodes(prev => prev.filter(n => !idsToDelete.includes(n.id)))

      // Delete from database (children cascade via trigger)
      const { error: deleteError } = await (supabase
        .from('mind_map_nodes') as any)
        .delete()
        .eq('id', id)

      if (deleteError) {
        // Revert on error
        fetchNodes()
        throw deleteError
      }

      // Also delete descendants explicitly (in case trigger doesn't handle it)
      if (descendantIds.length > 0) {
        await (supabase
          .from('mind_map_nodes') as any)
          .delete()
          .in('id', descendantIds)
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Initialize default nodes if database is empty
  const initializeDefaultNodes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user already has nodes
      const { count } = await (supabase
        .from('mind_map_nodes') as any)
        .select('*', { count: 'exact', head: true })

      if (count === 0) {
        // Insert default nodes
        const nodesToInsert = defaultMindMapNodes.map(node => ({
          ...node,
          created_by: user.id,
        }))

        const { error: insertError } = await (supabase
          .from('mind_map_nodes') as any)
          .insert(nodesToInsert)

        if (insertError) {
          console.error('Error initializing default nodes:', insertError)
        } else {
          await fetchNodes()
        }
      }
    } catch (err: any) {
      console.error('Error checking for default nodes:', err)
    }
  }

  useEffect(() => {
    fetchNodes()

    // Set up real-time subscription
    const channel = supabase
      .channel('mind_map_nodes_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mind_map_nodes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNodes(prev => {
              // Avoid duplicates from optimistic updates
              if (prev.some(n => n.id === payload.new.id)) return prev
              return [...prev, payload.new as MindMapNode]
            })
          } else if (payload.eventType === 'UPDATE') {
            setNodes(prev => prev.map(n => n.id === payload.new.id ? payload.new as MindMapNode : n))
          } else if (payload.eventType === 'DELETE') {
            setNodes(prev => prev.filter(n => n.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNodes, supabase])

  // Initialize default nodes after first fetch if empty
  useEffect(() => {
    if (initialized && nodes.length === 0) {
      initializeDefaultNodes()
    }
  }, [initialized, nodes.length])

  return {
    nodes,
    loading,
    error,
    createNode,
    updateNode,
    deleteNode,
    refetch: fetchNodes,
  }
}

// ==========================================
// Global Search Types and Hook
// ==========================================

export type SearchResultType = 'task' | 'roadmap'

export interface SearchResult {
  id: string
  title: string
  description: string | null
  type: SearchResultType
  status: string
  priority: string
  category?: string
  createdAt: string
}

export interface GroupedSearchResults {
  tasks: SearchResult[]
  roadmap: SearchResult[]
  total: number
}

// Debounce helper hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GroupedSearchResults>({ tasks: [], roadmap: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const debouncedQuery = useDebounce(query, 300)
  const supabase = createClient()

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ tasks: [], roadmap: [], total: 0 })
      return
    }

    try {
      setLoading(true)
      setError(null)

      const searchPattern = `%${searchQuery.toLowerCase()}%`

      // Search project_notes (tasks)
      const { data: notesData, error: notesError } = await supabase
        .from('project_notes')
        .select('*')
        .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
        .order('updated_at', { ascending: false })
        .limit(10)

      if (notesError) throw notesError

      // Search roadmap_items
      const { data: roadmapData, error: roadmapError } = await supabase
        .from('roadmap_items')
        .select('*')
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .order('updated_at', { ascending: false })
        .limit(10)

      if (roadmapError) throw roadmapError

      // Transform results
      const tasks: SearchResult[] = (notesData || []).map((note: ProjectNote) => ({
        id: note.id,
        title: note.title,
        description: note.content,
        type: 'task' as SearchResultType,
        status: note.status,
        priority: note.priority,
        createdAt: note.created_at,
      }))

      const roadmap: SearchResult[] = (roadmapData || []).map((item: RoadmapItem) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: 'roadmap' as SearchResultType,
        status: item.status,
        priority: item.priority,
        category: item.category,
        createdAt: item.created_at,
      }))

      setResults({
        tasks,
        roadmap,
        total: tasks.length + roadmap.length,
      })
    } catch (err: any) {
      setError(err.message)
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Trigger search when debounced query changes
  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])

  // Open dropdown when there's a query
  useEffect(() => {
    setIsOpen(query.trim().length > 0)
  }, [query])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults({ tasks: [], roadmap: [], total: 0 })
    setIsOpen(false)
  }, [])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    isOpen,
    setIsOpen,
    clearSearch,
  }
}
