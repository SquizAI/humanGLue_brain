# Phase 0.2: Code Reference & Key Implementations

## File: `/lib/utils/personalization.ts`

### 1. Personalized Greeting Function

```typescript
export function getPersonalizedGreeting(): PersonalizedGreeting {
  const hasVisitedBefore = typeof window !== 'undefined'
    ? localStorage.getItem('humanglue_first_visit') !== null
    : false

  const urlParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams()

  const referralSource = urlParams.get('ref') || urlParams.get('utm_source') || ''
  const utmMedium = urlParams.get('utm_medium') || ''

  // Mark first visit
  if (typeof window !== 'undefined' && !hasVisitedBefore) {
    localStorage.setItem('humanglue_first_visit', new Date().toISOString())
  }

  // Returning visitor
  if (hasVisitedBefore) {
    return {
      greeting: "Welcome back to HumanGlue!",
      context: "I remember our last conversation. Ready to continue your transformation journey?",
      suggestions: [
        "Continue where we left off",
        "Start fresh assessment",
        "See ROI calculator"
      ]
    }
  }

  // LinkedIn referral
  if (referralSource.toLowerCase().includes('linkedin') || utmMedium.toLowerCase().includes('social')) {
    return {
      greeting: "Welcome from LinkedIn!",
      context: "I see you're exploring how Fortune 1000 companies transform their teams. Let's discover your path to peak performance.",
      suggestions: [
        "Show me success stories",
        "Calculate potential ROI",
        "Start quick assessment"
      ]
    }
  }

  // Default first-time visitor
  return {
    greeting: "Welcome to HumanGlue. We guide Fortune 1000 companies of tomorrow, today.",
    context: "Let's start with your first name",
    suggestions: []
  }
}
```

### 2. Engagement Tracking

```typescript
export function trackEngagement(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return

  const engagementData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    referrer: document.referrer,
    ...properties
  }

  const existingEvents = localStorage.getItem('humanglue_engagement_events')
  const events = existingEvents ? JSON.parse(existingEvents) : []
  events.push(engagementData)

  // Keep last 50 events
  if (events.length > 50) {
    events.shift()
  }

  localStorage.setItem('humanglue_engagement_events', JSON.stringify(events))
}
```

## File: `/lib/hooks/useChatProgress.ts`

### 1. Hook Implementation

```typescript
export function useChatProgress(
  messages: Message[],
  userData: any,
  currentState: ChatState
): UseChatProgressReturn {
  const [abandonmentDetected, setAbandonmentDetected] = useState(false)
  const lastActivityRef = useRef<number>(Date.now())
  const saveIntervalRef = useRef<NodeJS.Timeout>()
  const activityCheckRef = useRef<NodeJS.Timeout>()

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    if (typeof window === 'undefined') return
    if (messages.length === 0) return

    const progress: ChatProgress = {
      messages,
      userData,
      currentState,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch (error) {
      console.error('[ChatProgress] Failed to save progress:', error)
    }
  }, [messages, userData, currentState])

  // Load progress from localStorage
  const loadProgress = useCallback((): ChatProgress | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const progress: ChatProgress = JSON.parse(stored)

      // Check if progress has expired (24 hours)
      const age = Date.now() - new Date(progress.timestamp).getTime()
      if (age > PROGRESS_EXPIRY) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return progress
    } catch (error) {
      console.error('[ChatProgress] Failed to load progress:', error)
      return null
    }
  }, [])

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    abandonmentDetected,
    resetAbandonmentFlag
  }
}
```

### 2. Activity Tracking

```typescript
// Track user activity
const handleActivity = useCallback(() => {
  lastActivityRef.current = Date.now()
}, [])

// Set up activity tracking
useEffect(() => {
  if (typeof window === 'undefined') return

  const events = ['mousemove', 'keypress', 'scroll', 'click', 'touchstart']

  events.forEach(event => {
    window.addEventListener(event, handleActivity, { passive: true })
  })

  return () => {
    events.forEach(event => {
      window.removeEventListener(event, handleActivity)
    })
  }
}, [handleActivity])
```

### 3. Abandonment Detection

```typescript
// Check for abandonment
const checkAbandonment = useCallback(() => {
  const timeSinceActivity = Date.now() - lastActivityRef.current

  if (
    timeSinceActivity > ACTIVITY_TIMEOUT &&
    messages.length > 0 &&
    currentState !== 'complete' &&
    !abandonmentDetected
  ) {
    setAbandonmentDetected(true)
  }
}, [messages.length, currentState, abandonmentDetected])

// Set up periodic checking
useEffect(() => {
  if (typeof window === 'undefined') return

  activityCheckRef.current = setInterval(() => {
    checkAbandonment()
  }, 10000) // Check every 10 seconds

  return () => {
    if (activityCheckRef.current) {
      clearInterval(activityCheckRef.current)
    }
  }
}, [checkAbandonment])
```

## File: `/components/templates/UnifiedChatSystem.tsx`

### 1. Smart Auto-Start

```typescript
// Smart auto-start with timing and visibility checks
useEffect(() => {
  if (!hasStarted.current && messages.length === 0) {
    const autoStartTimer = setTimeout(() => {
      // Only start if user is still on page, hero is visible, and page has focus
      if (isHeroVisible && typeof document !== 'undefined' && document.hasFocus()) {
        startConversation()
        trackEngagement('chat_auto_started', { greeting: personalizedGreeting.greeting })
      }
    }, 3500) // 3.5 seconds after page load

    return () => clearTimeout(autoStartTimer)
  }
}, [isHeroVisible])
```

### 2. Discovery Prompt Effect

```typescript
// Chat discovery prompt - show after 5 seconds if no messages
useEffect(() => {
  if (messages.length === 0 && !hasStarted.current) {
    const promptTimer = setTimeout(() => {
      setShowChatPrompt(true)
      trackEngagement('chat_prompt_shown')

      // Auto-dismiss after 8 seconds
      const dismissTimer = setTimeout(() => {
        setShowChatPrompt(false)
      }, 8000)

      return () => clearTimeout(dismissTimer)
    }, 5000)

    return () => clearTimeout(promptTimer)
  } else {
    setShowChatPrompt(false)
  }
}, [messages.length])
```

### 3. Recovery Prompt Effect

```typescript
// Check for saved progress on mount
useEffect(() => {
  const savedProgress = loadProgress()
  if (savedProgress && savedProgress.messages.length > 0) {
    setShowRecoveryPrompt(true)
    trackEngagement('chat_recovery_offered', {
      savedMessages: savedProgress.messages.length,
      savedState: savedProgress.currentState
    })
  }
}, [])
```

### 4. Discovery Prompt UI

```typescript
{/* Chat Discovery Prompt - appears above chat */}
<AnimatePresence>
  {showChatPrompt && isHeroVisible && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute -top-24 right-0 z-50"
    >
      <div className="relative bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 backdrop-blur-xl border border-brand-cyan/30 rounded-xl p-4 shadow-2xl max-w-[280px]">
        <button
          onClick={() => setShowChatPrompt(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-white text-sm font-semibold font-diatype">
              Get AI-Powered Insights
            </p>
            <p className="text-gray-300 text-xs font-diatype leading-relaxed">
              Chat with me to get your personalized transformation roadmap in just 5 minutes
            </p>
          </div>
        </div>
        {/* Arrow pointer */}
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 border-r border-b border-brand-cyan/30 transform rotate-45" />
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### 5. Recovery Modal UI

```typescript
{/* Chat Recovery Prompt - modal overlay */}
<AnimatePresence>
  {showRecoveryPrompt && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-2xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-brand-cyan/30 rounded-xl p-6 max-w-[320px] shadow-2xl"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-brand-cyan/20">
            <Sparkles className="w-5 h-5 text-brand-cyan" />
          </div>
          <div className="flex-1">
            <h3 className="text-white text-base font-semibold font-diatype mb-1">
              Welcome back!
            </h3>
            <p className="text-gray-400 text-sm font-diatype">
              I found your previous conversation. Would you like to continue where you left off?
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => handleRecoverChat('continue')}
            className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-purple text-white text-sm font-medium font-diatype hover:shadow-lg hover:shadow-brand-cyan/25 transition-all"
          >
            Continue conversation
          </button>
          <button
            onClick={() => handleRecoverChat('email')}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium font-diatype transition-all"
          >
            Email me the link
          </button>
          <button
            onClick={() => handleRecoverChat('browse')}
            className="w-full px-4 py-2 text-gray-400 hover:text-gray-300 text-xs font-diatype transition-colors"
          >
            Start fresh
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### 6. Abandonment Prompt UI

```typescript
{/* Abandonment recovery prompt */}
<AnimatePresence>
  {abandonmentDetected && messages.length > 0 && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-4 p-4 rounded-xl bg-gradient-to-br from-brand-cyan/10 to-brand-purple/10 border border-brand-cyan/20"
    >
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-white text-sm font-medium font-diatype mb-1">
              Still there?
            </p>
            <p className="text-gray-400 text-xs font-diatype">
              I noticed you might need a moment. How would you like to continue?
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAbandonmentAction('continue')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium font-diatype bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 transition-colors"
            >
              Continue now
            </button>
            <button
              onClick={() => handleAbandonmentAction('email')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium font-diatype bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Send me the link
            </button>
            <button
              onClick={() => handleAbandonmentAction('browse')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium font-diatype text-gray-400 hover:text-gray-300 transition-colors"
            >
              I'm just browsing
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### 7. Personalized Greeting UI

```typescript
{messages.length === 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="py-6 space-y-4"
  >
    <div className="space-y-3">
      <p className="text-white text-base font-medium font-diatype">
        {personalizedGreeting.greeting}
      </p>
      <p className="text-gray-400 text-sm font-diatype">
        {personalizedGreeting.context}
      </p>
    </div>

    {/* Quick action buttons for personalized suggestions */}
    {personalizedGreeting.suggestions.length > 0 && (
      <div className="flex flex-wrap gap-2 pt-2">
        {personalizedGreeting.suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            onClick={() => handleSend(suggestion)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium font-diatype',
              'bg-gray-800/50 border border-gray-700/50',
              'text-gray-300 hover:text-white',
              'hover:border-brand-cyan/50 hover:bg-gray-800',
              'transition-all duration-200'
            )}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    )}
  </motion.div>
)}
```

### 8. Handler Functions

```typescript
const handleRecoverChat = (action: 'continue' | 'email' | 'browse') => {
  const savedProgress = loadProgress()
  if (!savedProgress) return

  switch (action) {
    case 'continue':
      // Restore saved state
      setMessages(savedProgress.messages)
      localUserData.current = savedProgress.userData
      onChatStateChange(savedProgress.currentState, savedProgress.userData)
      setShowRecoveryPrompt(false)
      hasStarted.current = true
      setHasStartedChat(true)
      trackEngagement('chat_recovered', {
        messageCount: savedProgress.messages.length
      })
      break

    case 'email':
      // TODO: Implement email link functionality
      setShowRecoveryPrompt(false)
      clearProgress()
      trackEngagement('chat_recovery_email_requested')
      break

    case 'browse':
      // Clear saved progress and start fresh
      setShowRecoveryPrompt(false)
      clearProgress()
      trackEngagement('chat_recovery_declined')
      break
  }
}

const handleAbandonmentAction = (action: 'continue' | 'email' | 'browse') => {
  resetAbandonmentFlag()

  if (action === 'email') {
    // Add a message asking for email
    const emailMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "I'd be happy to send you a link to continue this conversation later. What's your email address?",
      timestamp: new Date()
    }
    setMessages(prev => [...prev, emailMessage])
    trackEngagement('abandonment_email_requested')
  } else if (action === 'browse') {
    trackEngagement('abandonment_browsing_continued')
  } else {
    trackEngagement('abandonment_continue_now')
  }
}
```

## Integration Points

### 1. Add to Component

```typescript
// Import statements
import { getPersonalizedGreeting, trackEngagement } from '../../lib/utils/personalization'
import { useChatProgress } from '../../lib/hooks/useChatProgress'

// State
const [showChatPrompt, setShowChatPrompt] = useState(false)
const [personalizedGreeting, setPersonalizedGreeting] = useState(getPersonalizedGreeting())
const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false)

// Hook
const {
  saveProgress,
  loadProgress,
  clearProgress,
  abandonmentDetected,
  resetAbandonmentFlag
} = useChatProgress(messages, localUserData.current, currentState)
```

### 2. Testing Referrals

```bash
# Test LinkedIn referral
http://localhost:3000/?ref=linkedin

# Test blog referral
http://localhost:3000/?ref=blog

# Test UTM source
http://localhost:3000/?utm_source=linkedin&utm_medium=social

# Test campaign
http://localhost:3000/?utm_campaign=launch
```

### 3. Testing Recovery

```javascript
// In browser console - simulate saved progress
const mockProgress = {
  messages: [
    { id: '1', role: 'assistant', content: 'Hi!', timestamp: new Date() },
    { id: '2', role: 'user', content: 'Hello', timestamp: new Date() }
  ],
  userData: { name: 'Test User' },
  currentState: 'greeting',
  timestamp: new Date().toISOString(),
  url: window.location.href
}
localStorage.setItem('humanglue_chat_progress', JSON.stringify(mockProgress))
// Refresh page - recovery modal should appear
```

### 4. Testing Abandonment

```javascript
// In browser console - simulate abandonment
// 1. Start chat normally
// 2. Stop interacting for 60 seconds
// 3. Watch for abandonment prompt to appear
// OR manually trigger:
// Find the component instance and set abandonmentDetected = true
```

## Constants & Configuration

```typescript
// Timing constants
const AUTO_START_DELAY = 3500        // 3.5 seconds
const DISCOVERY_PROMPT_DELAY = 5000  // 5 seconds
const DISCOVERY_PROMPT_DISMISS = 8000 // 8 seconds
const ACTIVITY_TIMEOUT = 60000       // 60 seconds
const SAVE_INTERVAL = 30000          // 30 seconds
const PROGRESS_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

// localStorage keys
const STORAGE_KEY = 'humanglue_chat_progress'
const FIRST_VISIT_KEY = 'humanglue_first_visit'
const VISIT_COUNT_KEY = 'humanglue_visit_count'
const LAST_VISIT_KEY = 'humanglue_last_visit'
const ENGAGEMENT_EVENTS_KEY = 'humanglue_engagement_events'
```
