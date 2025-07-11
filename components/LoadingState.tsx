import { motion } from 'framer-motion'
import { CardSkeleton } from './atoms/Skeleton'

export function SectionLoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="py-20"
    >
      <div className="container max-w-7xl mx-auto px-6">
        {/* Header skeleton */}
        <div className="text-center mb-12 space-y-4">
          <div className="h-10 bg-gray-700/50 rounded-lg max-w-md mx-auto animate-pulse" />
          <div className="h-6 bg-gray-700/50 rounded-lg max-w-2xl mx-auto animate-pulse" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <CardSkeleton />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function ChatLoadingState() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-400">AI is thinking...</span>
    </div>
  )
}

export function PageLoadingState() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4">
          <motion.div
            className="w-full h-full rounded-full border-4 border-blue-500/20 border-t-blue-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-lg text-gray-400">Loading Human Glue...</p>
      </motion.div>
    </div>
  )
} 