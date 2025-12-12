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
