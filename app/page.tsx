'use client'

import { EnhancedHomepage } from '@/components/templates/EnhancedHomepage'
import { ChatProvider, useChat } from '@/lib/contexts/ChatContext'
import { Metadata } from 'next'

function HomeContent() {
  const { userData, chatState, onChatStateChange } = useChat()

  return (
    <EnhancedHomepage
      userData={userData}
      chatState={chatState}
      onChatStateChange={onChatStateChange}
    />
  )
}

export default function HomePage() {
  return (
    <ChatProvider>
      <HomeContent />
    </ChatProvider>
  )
}
