'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import {
  Plus,
  Minus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Edit2,
  Trash2,
  Link,
  X,
  Check,
} from 'lucide-react'

export interface MindMapNode {
  id: string
  label: string
  x: number
  y: number
  color: string
  children: string[]
  expanded: boolean
  status?: 'active' | 'blocked' | 'done' | 'planned'
  description?: string
}

interface MindMapProps {
  initialNodes?: MindMapNode[]
  onNodesChange?: (nodes: MindMapNode[]) => void
}

const defaultNodes: MindMapNode[] = [
  { id: 'root', label: 'HumanGlue', x: 400, y: 300, color: '#06B6D4', children: ['platform', 'integrations', 'ai'], expanded: true, status: 'active' },
  { id: 'platform', label: 'Platform', x: 200, y: 150, color: '#8B5CF6', children: ['dashboard', 'auth'], expanded: true, status: 'active' },
  { id: 'integrations', label: 'Integrations', x: 600, y: 150, color: '#10B981', children: ['discord', 'slack'], expanded: true, status: 'planned' },
  { id: 'ai', label: 'AI Features', x: 400, y: 500, color: '#F59E0B', children: ['mindmap', 'chat'], expanded: true, status: 'active' },
  { id: 'dashboard', label: 'Dashboard', x: 100, y: 250, color: '#EC4899', children: [], expanded: false, status: 'done' },
  { id: 'auth', label: 'Auth', x: 300, y: 250, color: '#EC4899', children: [], expanded: false, status: 'done' },
  { id: 'discord', label: 'Discord Bot', x: 500, y: 250, color: '#6366F1', children: [], expanded: false, status: 'active' },
  { id: 'slack', label: 'Slack', x: 700, y: 250, color: '#6366F1', children: [], expanded: false, status: 'blocked' },
  { id: 'mindmap', label: 'Mind Reasoner', x: 300, y: 600, color: '#EF4444', children: [], expanded: false, status: 'active' },
  { id: 'chat', label: 'AI Chat', x: 500, y: 600, color: '#EF4444', children: [], expanded: false, status: 'done' },
]

export function MindMap({ initialNodes = defaultNodes, onNodesChange }: MindMapProps) {
  const [nodes, setNodes] = useState<MindMapNode[]>(initialNodes)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Handle node drag
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    setDraggedNode(nodeId)
    setSelectedNode(nodeId)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNode && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - pan.x) / zoom
        const y = (e.clientY - rect.top - pan.y) / zoom

        setNodes(prev => prev.map(n =>
          n.id === draggedNode ? { ...n, x, y } : n
        ))
      }
    }

    const handleMouseUp = () => {
      setDraggedNode(null)
      if (onNodesChange) {
        onNodesChange(nodes)
      }
    }

    if (draggedNode) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedNode, pan, zoom, nodes, onNodesChange])

  // Draw connections between nodes
  const renderConnections = () => {
    const connections: JSX.Element[] = []

    nodes.forEach(node => {
      node.children.forEach(childId => {
        const child = nodes.find(n => n.id === childId)
        if (child) {
          connections.push(
            <line
              key={`${node.id}-${childId}`}
              x1={node.x}
              y1={node.y}
              x2={child.x}
              y2={child.y}
              stroke={`${node.color}40`}
              strokeWidth={2}
              strokeDasharray={child.status === 'blocked' ? '5,5' : undefined}
            />
          )
        }
      })
    })

    return connections
  }

  const handleAddChild = (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId)
    if (!parent) return

    const newId = `node-${Date.now()}`
    const newNode: MindMapNode = {
      id: newId,
      label: 'New Node',
      x: parent.x + 100,
      y: parent.y + 80,
      color: parent.color,
      children: [],
      expanded: false,
      status: 'planned',
    }

    setNodes(prev => [
      ...prev.map(n => n.id === parentId ? { ...n, children: [...n.children, newId] } : n),
      newNode,
    ])
    setEditingNode(newId)
    setEditLabel('New Node')
  }

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === 'root') return // Can't delete root

    setNodes(prev => {
      // Remove from parent's children
      const updated = prev.map(n => ({
        ...n,
        children: n.children.filter(c => c !== nodeId),
      }))
      // Remove the node itself
      return updated.filter(n => n.id !== nodeId)
    })
    setSelectedNode(null)
  }

  const handleSaveEdit = () => {
    if (editingNode && editLabel.trim()) {
      setNodes(prev => prev.map(n =>
        n.id === editingNode ? { ...n, label: editLabel.trim() } : n
      ))
    }
    setEditingNode(null)
    setEditLabel('')
  }

  const statusColors = {
    active: 'ring-2 ring-green-400',
    blocked: 'ring-2 ring-red-400 opacity-60',
    done: 'ring-2 ring-blue-400',
    planned: 'ring-2 ring-slate-400',
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Mind Map</h2>
          <p className="text-sm text-slate-400">Visualize your project architecture</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm text-slate-400 w-16 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.1))}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden relative"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Connections */}
          {renderConnections()}
        </svg>

        {/* Nodes */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          {nodes.map(node => (
            <motion.div
              key={node.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'absolute pointer-events-auto cursor-move',
                'px-4 py-2 rounded-lg text-white text-sm font-medium',
                'shadow-lg transition-all',
                selectedNode === node.id && 'ring-2 ring-white ring-offset-2 ring-offset-slate-900',
                node.status && statusColors[node.status],
              )}
              style={{
                left: node.x - 50,
                top: node.y - 20,
                backgroundColor: node.color,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onDoubleClick={() => {
                setEditingNode(node.id)
                setEditLabel(node.label)
              }}
            >
              {editingNode === node.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="bg-black/30 border-none rounded px-1 py-0.5 text-white text-sm w-24 focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') setEditingNode(null)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={handleSaveEdit} className="p-0.5 hover:bg-black/20 rounded">
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <span>{node.label}</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Selected Node Actions */}
        <AnimatePresence>
          {selectedNode && !editingNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700"
            >
              <button
                onClick={() => handleAddChild(selectedNode)}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-sm"
              >
                <Plus size={14} /> Add Child
              </button>
              <button
                onClick={() => {
                  setEditingNode(selectedNode)
                  setEditLabel(nodes.find(n => n.id === selectedNode)?.label || '')
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm"
              >
                <Edit2 size={14} /> Edit
              </button>
              {selectedNode !== 'root' && (
                <button
                  onClick={() => handleDeleteNode(selectedNode)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 rounded text-slate-400 hover:bg-slate-700"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" /> Active
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" /> Done
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400" /> Planned
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" /> Blocked
        </span>
      </div>
    </div>
  )
}
