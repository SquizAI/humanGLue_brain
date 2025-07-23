import { Message, ChatState } from './types'

const STORAGE_KEYS = {
  messages: 'humanglue_chat_messages',
  userData: 'humanglue_user_data',
  chatState: 'humanglue_chat_state',
  lastActivity: 'humanglue_last_activity'
} as const

export class ChatPersistence {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  static saveMessages(messages: Message[]) {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages))
      localStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString())
    } catch (error) {
      console.error('Error saving messages:', error)
    }
  }

  static loadMessages(): Message[] {
    if (typeof window === 'undefined') return []
    
    try {
      const lastActivity = localStorage.getItem(STORAGE_KEYS.lastActivity)
      
      // Check if session has expired
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity)
        if (timeSinceActivity > this.SESSION_TIMEOUT) {
          this.clearAll()
          return []
        }
      }
      
      const saved = localStorage.getItem(STORAGE_KEYS.messages)
      if (saved) {
        const messages = JSON.parse(saved)
        // Convert timestamp strings back to Date objects
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
    
    return []
  }

  static saveUserData(userData: any) {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(userData))
      localStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString())
    } catch (error) {
      console.error('Error saving user data:', error)
    }
  }

  static loadUserData(): any {
    if (typeof window === 'undefined') return {}
    
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.userData)
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error('Error loading user data:', error)
      return {}
    }
  }

  static saveChatState(state: ChatState) {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.chatState, state)
      localStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString())
    } catch (error) {
      console.error('Error saving chat state:', error)
    }
  }

  static loadChatState(): ChatState {
    if (typeof window === 'undefined') return 'initial'
    
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.chatState)
      return (saved as ChatState) || 'initial'
    } catch (error) {
      console.error('Error loading chat state:', error)
      return 'initial'
    }
  }

  static clearAll() {
    if (typeof window === 'undefined') return
    
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Error clearing chat data:', error)
    }
  }

  static isSessionValid(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const lastActivity = localStorage.getItem(STORAGE_KEYS.lastActivity)
      if (!lastActivity) return false
      
      const timeSinceActivity = Date.now() - parseInt(lastActivity)
      return timeSinceActivity <= this.SESSION_TIMEOUT
    } catch (error) {
      return false
    }
  }
}