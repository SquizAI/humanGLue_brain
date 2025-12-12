'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { ProjectNote, useProjectNotes } from '@/lib/hooks/useProjectManager'
import {
  Plus,
  MoreHorizontal,
  Clock,
  User,
  Flag,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
} from 'lucide-react'

type KanbanStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'

const columns: { id: KanbanStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'slate' },
  { id: 'in_progress', label: 'In Progress', color: 'blue' },
  { id: 'review', label: 'Review', color: 'yellow' },
  { id: 'done', label: 'Done', color: 'green' },
  { id: 'blocked', label: 'Blocked', color: 'red' },
]

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
}

interface KanbanCardProps {
  note: ProjectNote
  onUpdate: (id: string, updates: Partial<ProjectNote>) => Promise<any>
  onDelete: (id: string) => Promise<void>
}

function KanbanCard({ note, onUpdate, onDelete }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(note.title)
  const [showMenu, setShowMenu] = useState(false)

  const handleSave = async () => {
    if (editTitle.trim()) {
      await onUpdate(note.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2">
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') setIsEditing(false)
              }}
            />
            <button onClick={handleSave} className="p-1 text-green-400 hover:bg-green-500/20 rounded">
              <Check size={14} />
            </button>
            <button onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:bg-slate-700 rounded">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <h4 className="text-sm font-medium text-white flex-1">{note.title}</h4>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal size={14} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 top-6 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1 min-w-[120px]"
                  >
                    <button
                      onClick={() => { setIsEditing(true); setShowMenu(false) }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => { onDelete(note.id); setShowMenu(false) }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-slate-700"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {note.content && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{note.content}</p>
      )}

      <div className="flex items-center gap-2 mt-3">
        <span className={cn('text-xs px-2 py-0.5 rounded-full', priorityColors[note.priority])}>
          {note.priority}
        </span>
        {note.created_by_name && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <User size={10} /> {note.created_by_name}
          </span>
        )}
      </div>
    </motion.div>
  )
}

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (note: Partial<ProjectNote>) => Promise<any>
  defaultStatus: KanbanStatus
}

function NewTaskModal({ isOpen, onClose, onCreate, defaultStatus }: NewTaskModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onCreate({
        title: title.trim(),
        content: content.trim(),
        status: defaultStatus,
        priority,
      })
      setTitle('')
      setContent('')
      setPriority('medium')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Create New Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Enter task title..."
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Enter task description..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export function KanbanBoard() {
  const { notes, loading, error, createNote, updateNote, deleteNote } = useProjectNotes()
  const [newTaskColumn, setNewTaskColumn] = useState<KanbanStatus | null>(null)

  const getColumnNotes = (status: KanbanStatus) => {
    return notes.filter(n => {
      // Map various status values to kanban columns
      const normalizedStatus = n.status?.replace('-', '_') || 'todo'
      if (status === 'in_progress') {
        return normalizedStatus === 'in_progress' || normalizedStatus === 'progress' || normalizedStatus === 'active'
      }
      if (status === 'done') {
        return normalizedStatus === 'done' || normalizedStatus === 'completed'
      }
      return normalizedStatus === status
    })
  }

  const handleDragEnd = async (noteId: string, newStatus: KanbanStatus) => {
    await updateNote(noteId, { status: newStatus })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        <AlertCircle className="mr-2" /> Error: {error}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Kanban Board</h2>
          <p className="text-sm text-slate-400">{notes.length} total tasks</p>
        </div>
      </div>

      {/* Columns */}
      <div className="flex-1 grid grid-cols-5 gap-4 min-h-0 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnNotes = getColumnNotes(column.id)
          return (
            <div
              key={column.id}
              className="flex flex-col bg-slate-800/30 rounded-xl border border-slate-700/50 min-w-[250px]"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      column.color === 'slate' && 'bg-slate-400',
                      column.color === 'blue' && 'bg-blue-400',
                      column.color === 'yellow' && 'bg-yellow-400',
                      column.color === 'green' && 'bg-green-400',
                      column.color === 'red' && 'bg-red-400',
                    )} />
                    <span className="text-sm font-medium text-white">{column.label}</span>
                    <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                      {columnNotes.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setNewTaskColumn(column.id)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                <AnimatePresence>
                  {columnNotes.map((note) => (
                    <KanbanCard
                      key={note.id}
                      note={note}
                      onUpdate={updateNote}
                      onDelete={deleteNote}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {newTaskColumn && (
          <NewTaskModal
            isOpen={true}
            onClose={() => setNewTaskColumn(null)}
            onCreate={createNote}
            defaultStatus={newTaskColumn}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
