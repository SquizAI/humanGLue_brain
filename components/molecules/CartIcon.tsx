'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/contexts/CartContext'
import { cn } from '@/utils/cn'

interface CartIconProps {
  className?: string
  variant?: 'default' | 'compact'
}

export function CartIcon({ className, variant = 'default' }: CartIconProps) {
  const { itemCount, setIsCartOpen } = useCart()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsCartOpen(true)}
      className={cn(
        'relative flex items-center gap-3 transition-all',
        variant === 'default' && 'px-4 py-2 rounded-lg hover:bg-white/10',
        variant === 'compact' && 'p-2 rounded-lg hover:bg-white/10',
        className
      )}
      aria-label="Shopping Cart"
    >
      <div className="relative">
        <ShoppingBag className="w-5 h-5 text-gray-300" />

        {/* Badge */}
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            >
              <motion.span
                key={itemCount}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-[10px] font-bold text-white px-1"
              >
                {itemCount > 9 ? '9+' : itemCount}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {variant === 'default' && (
        <div className="hidden sm:block">
          <span className="text-sm font-medium text-white font-diatype">Cart</span>
        </div>
      )}
    </motion.button>
  )
}
