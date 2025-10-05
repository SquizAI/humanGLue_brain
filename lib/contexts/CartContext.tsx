'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export interface CartItem {
  id: string
  type: 'course' | 'workshop' | 'consultation' | 'subscription'
  name: string
  description: string
  price: number
  quantity: number
  image: string
  metadata?: {
    instructor?: string
    duration?: string
    date?: string
    time?: string
    expertName?: string
    level?: string
    pillar?: string
  }
}

export interface DiscountCode {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  isValid: boolean
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  tax: number
  total: number
  discountCode: DiscountCode | null
  applyDiscountCode: (code: string) => boolean
  removeDiscountCode: () => void
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Mock discount codes
const VALID_DISCOUNT_CODES: Record<string, DiscountCode> = {
  'WELCOME10': { code: 'WELCOME10', type: 'percentage', value: 10, isValid: true },
  'SAVE50': { code: 'SAVE50', type: 'fixed', value: 50, isValid: true },
  'EARLYBIRD': { code: 'EARLYBIRD', type: 'percentage', value: 15, isValid: true },
}

const TAX_RATE = 0.08 // 8% tax

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [discountCode, setDiscountCode] = useState<DiscountCode | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('humanglue_cart')
      const savedDiscount = localStorage.getItem('humanglue_discount')

      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
      if (savedDiscount) {
        setDiscountCode(JSON.parse(savedDiscount))
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('humanglue_cart', JSON.stringify(items))
      } catch (error) {
        console.error('Error saving cart:', error)
      }
    }
  }, [items, isLoaded])

  // Save discount to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        if (discountCode) {
          localStorage.setItem('humanglue_discount', JSON.stringify(discountCode))
        } else {
          localStorage.removeItem('humanglue_discount')
        }
      } catch (error) {
        console.error('Error saving discount:', error)
      }
    }
  }, [discountCode, isLoaded])

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItem = prevItems.find((i) => i.id === item.id && i.type === item.type)

      if (existingItem) {
        // Update quantity if it exists
        return prevItems.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    setDiscountCode(null)
  }

  const applyDiscountCode = (code: string): boolean => {
    const upperCode = code.trim().toUpperCase()
    const discount = VALID_DISCOUNT_CODES[upperCode]

    if (discount) {
      setDiscountCode(discount)
      return true
    }
    return false
  }

  const removeDiscountCode = () => {
    setDiscountCode(null)
  }

  // Calculate totals
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Apply discount
  let discountAmount = 0
  if (discountCode) {
    if (discountCode.type === 'percentage') {
      discountAmount = subtotal * (discountCode.value / 100)
    } else {
      discountAmount = discountCode.value
    }
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const tax = afterDiscount * TAX_RATE
  const total = afterDiscount + tax

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        tax,
        total,
        discountCode,
        applyDiscountCode,
        removeDiscountCode,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
