'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Trash2, Tag, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/contexts/CartContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/utils/cn'
import Link from 'next/link'

export function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    itemCount,
    subtotal,
    tax,
    total,
    discountCode,
    applyDiscountCode,
    removeDiscountCode,
    isCartOpen,
    setIsCartOpen,
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const router = useRouter()

  const handleApplyCoupon = () => {
    const success = applyDiscountCode(couponInput)
    if (success) {
      setCouponInput('')
      setCouponError('')
    } else {
      setCouponError('Invalid coupon code')
    }
  }

  const handleCheckout = () => {
    setIsCartOpen(false)
    router.push('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-gray-950 border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <ShoppingBag className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-gendy">Shopping Cart</h2>
                  <p className="text-sm text-gray-400 font-diatype">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full py-12"
                >
                  <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 font-gendy">Your cart is empty</h3>
                  <p className="text-sm text-gray-400 mb-6 text-center font-diatype">
                    Browse our courses, workshops, and expert consultations
                  </p>
                  <Link href="/dashboard/learning">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-diatype"
                    >
                      Browse Courses
                    </button>
                  </Link>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-white line-clamp-1 font-gendy">
                                {item.name}
                              </h3>
                              <p className="text-xs text-gray-400 line-clamp-1 font-diatype">
                                {item.metadata?.instructor || item.metadata?.expertName}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Type Badge */}
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                item.type === 'course' && 'bg-blue-500/20 text-blue-300',
                                item.type === 'workshop' && 'bg-cyan-500/20 text-cyan-300',
                                item.type === 'consultation' && 'bg-amber-500/20 text-amber-300'
                              )}
                            >
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                            {item.metadata?.duration && (
                              <span className="text-xs text-gray-500">
                                {item.metadata.duration}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls & Price */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold text-white px-2">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-white font-diatype">
                                ${item.price * item.quantity}
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-xs text-gray-500">
                                  ${item.price} each
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer - Only show if items exist */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-6 space-y-4">
                {/* Coupon Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2 font-diatype">
                    <Tag className="w-4 h-4" />
                    Discount Code
                  </label>
                  {discountCode ? (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-semibold text-green-300">
                          {discountCode.code}
                        </span>
                        <span className="text-xs text-green-400">
                          (-{discountCode.type === 'percentage' ? `${discountCode.value}%` : `$${discountCode.value}`})
                        </span>
                      </div>
                      <button
                        onClick={removeDiscountCode}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value)
                          setCouponError('')
                        }}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-semibold font-diatype"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-xs text-red-400 font-diatype">{couponError}</p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-diatype">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountCode && (
                    <div className="flex justify-between text-sm font-diatype">
                      <span className="text-green-400">Discount</span>
                      <span className="text-green-400">
                        -${(subtotal - (total - tax)).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-diatype">
                    <span className="text-gray-400">Tax (8%)</span>
                    <span className="text-white">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                    <span className="text-white font-gendy">Total</span>
                    <span className="text-white font-gendy">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-gendy"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
