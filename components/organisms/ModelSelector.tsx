'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Sparkles, Zap, Brain } from 'lucide-react'
import { AIModel } from '../../lib/mcp/types'
import { api } from '../../services/api'
import { modelConfigs } from '../../lib/mcp/models'
import { cn } from '../../utils/cn'
import { Skeleton } from '../atoms/Skeleton'

interface ModelSelectorProps {
  selectedModel: AIModel
  onModelChange: (model: AIModel) => void
  className?: string
}

interface ModelInfo {
  id: string
  name: string
  provider: string
  description: string
  capabilities: string[]
  available: boolean
}

export function ModelSelector({ selectedModel, onModelChange, className }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAvailableModels()
  }, [])

  const fetchAvailableModels = async () => {
    setIsLoading(true)
    try {
      const response = await api.getAvailableModels()
      setAvailableModels(response.models)
    } catch (error) {
      console.error('Failed to fetch models:', error)
      // Fallback to showing all models as potentially available
      setAvailableModels(
        Object.entries(modelConfigs).map(([id, config]) => ({
          id,
          ...config,
          available: true
        }))
      )
    } finally {
      setIsLoading(false)
    }
  }

  const currentModel = modelConfigs[selectedModel]
  const ModelIcon = currentModel?.provider === 'google' ? Sparkles : 
                    currentModel?.provider === 'openai' ? Zap : Brain

  if (isLoading) {
    return (
      <div className={cn("relative", className)}>
        <Skeleton 
          variant="rounded" 
          width="100%" 
          height={48} 
          className="bg-gray-800/50"
        />
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-3 rounded-xl",
          "bg-gray-800/50 backdrop-blur-sm border border-gray-700",
          "hover:bg-gray-800/70 hover:border-gray-600",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          "transition-all duration-200",
          "flex items-center justify-between gap-3"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <ModelIcon className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">{currentModel?.name || 'Select Model'}</p>
            <p className="text-xs text-gray-400">{currentModel?.provider}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute top-full left-0 right-0 mt-2 z-50",
                "bg-gray-800/95 backdrop-blur-xl rounded-xl",
                "border border-gray-700 shadow-2xl",
                "max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600"
              )}
            >
              <div className="p-2">
                {availableModels.map((model) => {
                  const config = modelConfigs[model.id as AIModel]
                  const Icon = config?.provider === 'google' ? Sparkles : 
                              config?.provider === 'openai' ? Zap : Brain
                  const isSelected = selectedModel === model.id

                  return (
                    <motion.button
                      key={model.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (model.available) {
                          onModelChange(model.id as AIModel)
                          setIsOpen(false)
                        }
                      }}
                      disabled={!model.available}
                      className={cn(
                        "w-full p-3 rounded-lg",
                        "flex items-center gap-3",
                        "transition-all duration-200",
                        "text-left",
                        isSelected ? "bg-blue-500/20 border border-blue-500/30" : "hover:bg-gray-700/50",
                        !model.available && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        isSelected ? "bg-blue-500/20" : "bg-gradient-to-br from-gray-600/20 to-gray-700/20"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4",
                          isSelected ? "text-blue-400" : "text-gray-400"
                        )} />
                      </div>
                      
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-blue-300" : "text-white"
                        )}>
                          {model.name}
                        </p>
                        <p className="text-xs text-gray-400">{model.description}</p>
                        {!model.available && (
                          <p className="text-xs text-red-400 mt-1">API key not configured</p>
                        )}
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}