'use client'

import { ChatProvider } from '../lib/contexts/ChatContext'
import { CartProvider } from '../lib/contexts/CartContext'
import { SocialProvider } from '../lib/contexts/SocialContext'
import { BillingProvider } from '../lib/contexts/BillingContext'
import { PWARegister } from './PWARegister'
import { GlobalAIChat } from './templates/GlobalAIChat'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <BillingProvider>
        <CartProvider>
          <SocialProvider>
            {children}
            <GlobalAIChat />
            <PWARegister />
          </SocialProvider>
        </CartProvider>
      </BillingProvider>
    </ChatProvider>
  )
}
