'use client'

import { useState } from 'react'
import { EnhancedHomepage } from '../components/templates/EnhancedHomepage'
import { ChatState } from '../lib/types'

export default function HomePage() {
  const [userData, setUserData] = useState({})
  const [chatState, setChatState] = useState<ChatState>('initial')

  const handleChatStateChange = (state: ChatState, data?: any) => {
    setChatState(state)
    if (data) {
      setUserData(prev => ({ ...prev, ...data }))
    }
  }

  return (
    <EnhancedHomepage 
      userData={userData}
      chatState={chatState}
      onChatStateChange={handleChatStateChange}
    />
  )
}