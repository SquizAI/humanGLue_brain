'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/utils/cn'
import { ProjectNote, useProjectNotes } from '@/lib/hooks/useProjectManager'
import {
  Plus,
  MoreHorizontal,
  User,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  GripVertical,
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
  onEdit?: (note: ProjectNote) => void
  isDragging?: boolean
  isOverlay?: boolean
  isHighlighted?: boolean
}

function KanbanCard({ note, onUpdate, onDelete, onEdit, isDragging = false, isOverlay = false, isHighlighted = false }: KanbanCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.div
      layout={!isDragging && !isOverlay}
      initial={isOverlay ? false : { opacity: 0, y: 20 }}
      animate={isOverlay ? { opacity: 1, scale: 1.05 } : isHighlighted ? { opacity: 1, y: 0, scale: [1, 1.03, 1] } : { opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={!isDragging && !isOverlay ? { scale: 1.02 } : undefined}
      transition={isHighlighted ? { duration: 0.5, scale: { repeat: 2, repeatType: 'reverse' } } : undefined}
      className={cn(
        'bg-slate-800/80 rounded-lg p-3 border border-slate-700/50 transition-all group',
        isDragging && 'opacity-50 border-dashed border-cyan-500/50',
        isOverlay && 'shadow-2xl shadow-cyan-500/20 border-cyan-500 cursor-grabbing rotate-2',
        !isDragging && !isOverlay && 'hover:border-slate-600 cursor-grab',
        isHighlighted && 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/20'
      )}
      data-testid={`kanban-card-${note.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Drag Handle */}
        <div className={cn(
          'flex items-center text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab',
          isOverlay && 'opacity-100'
        )}>
          <GripVertical size={14} />
        </div>

        <h4 className="text-sm font-medium text-white flex-1">{note.title}</h4>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
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
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { onEdit?.(note); setShowMenu(false) }}
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
      </div>

      {note.content && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 ml-5">{note.content}</p>
      )}

      <div className="flex items-center gap-2 mt-3 ml-5">
        <span className={cn('text-xs px-2 py-0.5 rounded-full', priorityColors[note.priority])}>
          {note.priority}
        </span>
        {note.created_by_name && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <User size={10} /> {note.created_by_name}
          </span>
        )}
      </div>

      {/* Due Date Display */}
      {note.due_date && (
        <div className="flex items-center gap-1.5 mt-2 ml-5 text-xs text-slate-400">
          <Calendar size={12} />
          <span>Due: {new Date(note.due_date).toLocaleDateString()}</span>
        </div>
      )}
    </motion.div>
  )
}

// Draggable wrapper for KanbanCard
interface DraggableKanbanCardProps {
  note: ProjectNote
  onUpdate: (id: string, updates: Partial<ProjectNote>) => Promise<any>
  onDelete: (id: string) => Promise<void>
  onEdit?: (note: ProjectNote) => void
  isHighlighted?: boolean
}

function DraggableKanbanCard({ note, onUpdate, onDelete, onEdit, isHighlighted = false }: DraggableKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: note.id,
    data: {
      type: 'card',
      note,
    },
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : undefined,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <KanbanCard
        note={note}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onEdit={onEdit}
        isDragging={isDragging}
        isHighlighted={isHighlighted}
      />
    </div>
  )
}

// Droppable column component
interface DroppableColumnProps {
  column: { id: KanbanStatus; label: string; color: string }
  notes: ProjectNote[]
  onUpdate: (id: string, updates: Partial<ProjectNote>) => Promise<any>
  onDelete: (id: string) => Promise<void>
  onEdit: (note: ProjectNote) => void
  onAddTask: (status: KanbanStatus) => void
  isOver: boolean
  highlightedItemId?: string | null
}

function DroppableColumn({ column, notes, onUpdate, onDelete, onEdit, onAddTask, isOver, highlightedItemId }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      status: column.id,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col bg-slate-800/30 rounded-xl border min-w-[250px] transition-all duration-200',
        isOver
          ? 'border-cyan-500/70 bg-cyan-500/5 shadow-lg shadow-cyan-500/10'
          : 'border-slate-700/50'
      )}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn(
              'w-2 h-2 rounded-full transition-all duration-200',
              column.color === 'slate' && 'bg-slate-400',
              column.color === 'blue' && 'bg-blue-400',
              column.color === 'yellow' && 'bg-yellow-400',
              column.color === 'green' && 'bg-green-400',
              column.color === 'red' && 'bg-red-400',
              isOver && 'scale-150'
            )} />
            <span className="text-sm font-medium text-white">{column.label}</span>
            <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
              {notes.length}
            </span>
          </div>
          <button
            onClick={() => onAddTask(column.id)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Column Content */}
      <div className={cn(
        'flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px] transition-all duration-200',
        isOver && notes.length === 0 && 'bg-cyan-500/5'
      )}>
        {/* Drop indicator when empty */}
        {isOver && notes.length === 0 && (
          <div className="h-20 border-2 border-dashed border-cyan-500/50 rounded-lg flex items-center justify-center">
            <span className="text-xs text-cyan-400">Drop here</span>
          </div>
        )}

        <AnimatePresence>
          {notes.map((note) => (
            <DraggableKanbanCard
              key={note.id}
              note={note}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
              isHighlighted={highlightedItemId === note.id}
            />
          ))}
        </AnimatePresence>

        {/* Drop indicator when has cards */}
        {isOver && notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 60 }}
            exit={{ opacity: 0, height: 0 }}
            className="border-2 border-dashed border-cyan-500/50 rounded-lg flex items-center justify-center"
          >
            <span className="text-xs text-cyan-400">Drop here</span>
          </motion.div>
        )}
      </div>
    </div>
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
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
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
        start_date: startDate || null,
        due_date: dueDate || null,
      } as any)
      setTitle('')
      setContent('')
      setPriority('medium')
      setStartDate('')
      setDueDate('')
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
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

interface EditTaskModalProps {
  note: ProjectNote
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<ProjectNote>) => Promise<any>
}

function EditTaskModal({ note, isOpen, onClose, onUpdate }: EditTaskModalProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content || '')
  const [priority, setPriority] = useState(note.priority)
  const [status, setStatus] = useState(note.status)
  const [startDate, setStartDate] = useState(note.start_date?.split('T')[0] || '')
  const [dueDate, setDueDate] = useState(note.due_date?.split('T')[0] || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onUpdate(note.id, {
        title: title.trim(),
        content: content.trim() || null,
        priority,
        status,
        start_date: startDate || null,
        due_date: dueDate || null,
      })
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Edit Task</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectNote['priority'])}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectNote['status'])}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

interface KanbanBoardProps {
  highlightedItemId?: string | null
}

export function KanbanBoard({ highlightedItemId }: KanbanBoardProps = {}) {
  const { notes, loading, error, createNote, updateNote, deleteNote } = useProjectNotes()
  const [newTaskColumn, setNewTaskColumn] = useState<KanbanStatus | null>(null)
  const [editingTask, setEditingTask] = useState<ProjectNote | null>(null)
  const [activeNote, setActiveNote] = useState<ProjectNote | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  )

  const getColumnNotes = useCallback((status: KanbanStatus) => {
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
  }, [notes])

  // Memoize column data to prevent unnecessary re-renders
  const columnData = useMemo(() => {
    return columns.map(column => ({
      ...column,
      notes: getColumnNotes(column.id),
    }))
  }, [getColumnNotes])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const note = notes.find(n => n.id === active.id)
    if (note) {
      setActiveNote(note)
    }
  }, [notes])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    setOverId(over?.id as string | null)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveNote(null)
    setOverId(null)

    if (!over) return

    const noteId = active.id as string
    const note = notes.find(n => n.id === noteId)

    if (!note) return

    // Determine the new status
    let newStatus: KanbanStatus | null = null

    // Check if dropped on a column
    if (columns.some(col => col.id === over.id)) {
      newStatus = over.id as KanbanStatus
    }
    // Check if dropped on another card - get its column
    else {
      const targetNote = notes.find(n => n.id === over.id)
      if (targetNote) {
        // Map the target note's status to a kanban column
        const normalizedStatus = targetNote.status?.replace('-', '_') || 'todo'
        if (normalizedStatus === 'progress' || normalizedStatus === 'active') {
          newStatus = 'in_progress'
        } else if (normalizedStatus === 'completed') {
          newStatus = 'done'
        } else if (columns.some(col => col.id === normalizedStatus)) {
          newStatus = normalizedStatus as KanbanStatus
        }
      }
    }

    // Only update if the status actually changed
    if (newStatus) {
      const currentNormalizedStatus = note.status?.replace('-', '_') || 'todo'
      const currentMappedStatus =
        currentNormalizedStatus === 'progress' || currentNormalizedStatus === 'active'
          ? 'in_progress'
          : currentNormalizedStatus === 'completed'
          ? 'done'
          : currentNormalizedStatus

      if (newStatus !== currentMappedStatus) {
        try {
          await updateNote(noteId, { status: newStatus })
        } catch (err) {
          console.error('Failed to update note status:', err)
        }
      }
    }
  }, [notes, updateNote])

  const handleDragCancel = useCallback(() => {
    setActiveNote(null)
    setOverId(null)
  }, [])

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
          {columnData.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              notes={column.notes}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onEdit={setEditingTask}
              onAddTask={setNewTaskColumn}
              isOver={overId === column.id}
              highlightedItemId={highlightedItemId}
            />
          ))}
        </div>

        {/* Drag Overlay - shows the card being dragged */}
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeNote ? (
            <KanbanCard
              note={activeNote}
              onUpdate={updateNote}
              onDelete={deleteNote}
              isOverlay
            />
          ) : null}
        </DragOverlay>

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

        {/* Edit Task Modal */}
        <AnimatePresence>
          {editingTask && (
            <EditTaskModal
              note={editingTask}
              isOpen={true}
              onClose={() => setEditingTask(null)}
              onUpdate={updateNote}
            />
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  )
}
