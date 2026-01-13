'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { RoadmapItem, useRoadmapItems } from '@/lib/hooks/useProjectManager'
import {
  Plus,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Circle,
  Flag,
  MoreHorizontal,
  Edit2,
  Trash2,
  X,
} from 'lucide-react'

const categoryColors = {
  feature: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  integration: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  infrastructure: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  design: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  other: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
}

const statusIcons = {
  planned: Circle,
  in_progress: Clock,
  progress: Clock,
  completed: CheckCircle,
  done: CheckCircle,
  blocked: AlertCircle,
  active: Clock,
  review: Flag,
}

const statusColors = {
  planned: 'text-slate-400',
  in_progress: 'text-blue-400',
  progress: 'text-blue-400',
  completed: 'text-green-400',
  done: 'text-green-400',
  blocked: 'text-red-400',
  active: 'text-blue-400',
  review: 'text-yellow-400',
}

interface RoadmapCardProps {
  item: RoadmapItem
  onUpdate: (id: string, updates: Partial<RoadmapItem>) => Promise<any>
  onDelete: (id: string) => Promise<void>
  onOpenEditModal: (item: RoadmapItem) => void
  isHighlighted?: boolean
}

function RoadmapCard({ item, onUpdate, onDelete, onOpenEditModal, isHighlighted = false }: RoadmapCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const StatusIcon = statusIcons[item.status] || Circle
  const colors = categoryColors[item.category] || categoryColors.other

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={isHighlighted ? { opacity: 1, y: 0, scale: [1, 1.03, 1] } : { opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={isHighlighted ? { duration: 0.5, scale: { repeat: 2, repeatType: 'reverse' } } : undefined}
      className={cn(
        'bg-slate-800/80 rounded-xl p-4 border',
        colors.border,
        'hover:border-opacity-60 transition-all group',
        isHighlighted && 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/20'
      )}
      data-testid={`roadmap-card-${item.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <StatusIcon size={18} className={cn('mt-0.5', statusColors[item.status])} />
          <div>
            <h4 className="font-medium text-white">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={16} />
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
                  onClick={() => { onOpenEditModal(item); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => { onDelete(item.id); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-slate-700"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <span className={cn('text-xs px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
          {item.category}
        </span>
        <span className={cn('text-xs', statusColors[item.status])}>
          {item.status.replace('_', ' ')}
        </span>
        {item.assignee && (
          <span className="text-xs text-slate-500">
            {item.assignee}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <span>{item.progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${item.progress}%` }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
          />
        </div>
      </div>

      {/* Dates */}
      {(item.start_date || item.end_date) && (
        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
          <Calendar size={12} />
          <span>
            {item.start_date && new Date(item.start_date).toLocaleDateString()}
            {item.start_date && item.end_date && ' - '}
            {item.end_date && new Date(item.end_date).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

interface NewItemModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (item: Partial<RoadmapItem>) => Promise<any>
}

function NewItemModal({ isOpen, onClose, onCreate }: NewItemModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<RoadmapItem['category']>('feature')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: 'planned',
        progress: 0,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      setTitle('')
      setDescription('')
      setCategory('feature')
      setPriority('medium')
      setStartDate('')
      setEndDate('')
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Add Roadmap Item</h3>
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
              placeholder="Enter item title..."
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Enter description..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="feature">Feature</option>
                <option value="integration">Integration</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="design">Design</option>
                <option value="other">Other</option>
              </select>
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
              <label className="block text-sm text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
              {loading ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

interface EditItemModalProps {
  item: RoadmapItem
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<RoadmapItem>) => Promise<any>
}

function EditItemModal({ item, isOpen, onClose, onUpdate }: EditItemModalProps) {
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || '')
  const [category, setCategory] = useState<RoadmapItem['category']>(item.category)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>(item.priority)
  const [status, setStatus] = useState<RoadmapItem['status']>(item.status)
  const [progress, setProgress] = useState(item.progress)
  const [startDate, setStartDate] = useState(item.start_date?.split('T')[0] || '')
  const [endDate, setEndDate] = useState(item.end_date?.split('T')[0] || '')
  const [assignee, setAssignee] = useState(item.assignee || '')
  const [tagsInput, setTagsInput] = useState((item.tags || []).join(', '))
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      // Parse tags from comma-separated input
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      await onUpdate(item.id, {
        title: title.trim(),
        description: description.trim() || null,
        category,
        priority,
        status,
        progress,
        start_date: startDate || null,
        end_date: endDate || null,
        assignee: assignee.trim() || null,
        tags: tags.length > 0 ? tags : null,
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
        className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Edit Roadmap Item</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Enter item title..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RoadmapItem['category'])}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="feature">Feature</option>
                <option value="integration">Integration</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="design">Design</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoadmapItem['status'])}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Progress Slider */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Progress: {progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Dates */}
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
              <label className="block text-sm text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Assignee</label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Enter assignee name..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="e.g., frontend, urgent, Q1"
            />
          </div>

          {/* Actions */}
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

interface RoadmapTimelineProps {
  highlightedItemId?: string | null
}

export function RoadmapTimeline({ highlightedItemId }: RoadmapTimelineProps = {}) {
  const { items, loading, error, createItem, updateItem, deleteItem } = useRoadmapItems()
  const [filter, setFilter] = useState<string>('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null)

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items
    return items.filter(item => item.category === filter || item.status === filter)
  }, [items, filter])

  const groupedItems = useMemo(() => {
    const groups: Record<string, RoadmapItem[]> = {
      'In Progress': [],
      'Planned': [],
      'Completed': [],
      'Blocked': [],
    }

    filteredItems.forEach(item => {
      const status = item.status.replace('_', ' ')
      if (status === 'in progress' || status === 'progress' || status === 'active') {
        groups['In Progress'].push(item)
      } else if (status === 'completed' || status === 'done') {
        groups['Completed'].push(item)
      } else if (status === 'blocked') {
        groups['Blocked'].push(item)
      } else {
        groups['Planned'].push(item)
      }
    })

    return groups
  }, [filteredItems])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Roadmap</h2>
          <p className="text-sm text-slate-400">{items.length} total items</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Items</option>
            <option value="feature">Features</option>
            <option value="integration">Integrations</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="design">Design</option>
          </select>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Timeline Sections */}
      <div className="flex-1 overflow-y-auto space-y-8">
        {Object.entries(groupedItems).map(([section, sectionItems]) => (
          sectionItems.length > 0 && (
            <div key={section}>
              <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                {section} ({sectionItems.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {sectionItems.map((item) => (
                    <RoadmapCard
                      key={item.id}
                      item={item}
                      onUpdate={updateItem}
                      onDelete={deleteItem}
                      onOpenEditModal={setEditingItem}
                      isHighlighted={highlightedItemId === item.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No roadmap items found</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-4 text-cyan-400 hover:text-cyan-300"
            >
              Add your first item
            </button>
          </div>
        )}
      </div>

      {/* New Item Modal */}
      <AnimatePresence>
        {showNewModal && (
          <NewItemModal
            isOpen={true}
            onClose={() => setShowNewModal(false)}
            onCreate={createItem}
          />
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingItem && (
          <EditItemModal
            key={editingItem.id}
            item={editingItem}
            isOpen={true}
            onClose={() => setEditingItem(null)}
            onUpdate={updateItem}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
