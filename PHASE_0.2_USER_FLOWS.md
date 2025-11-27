# Phase 0.2: User Flow Diagrams

## Flow 1: First-Time Visitor (Default)

```
User lands on page
        |
        v
[Wait 3.5s - Page loads, user sees hero]
        |
        v
Check: isHeroVisible && document.hasFocus()?
        |
    Yes |
        v
Chat auto-starts
└─> Greeting: "Welcome to HumanGlue..."
└─> Context: "Let's start with your first name"
└─> No quick actions
        |
        v
[Wait 5s - User reads greeting]
        |
        v
Discovery prompt appears above chat
└─> Title: "Get AI-Powered Insights"
└─> Message: "Chat with me to get your personalized transformation roadmap in just 5 minutes"
└─> Arrow points to chat
        |
        v
[Wait 8s - User sees prompt]
        |
        v
Discovery prompt auto-dismisses
        |
        v
User interacts with chat OR becomes inactive
        |
    Inactive (60s)
        |
        v
Abandonment prompt appears
└─> Options: "Continue now" | "Send me the link" | "I'm just browsing"
```

## Flow 2: Returning Visitor

```
User lands on page
        |
        v
Check localStorage for saved progress
        |
    Found (< 24h old)
        |
        v
Recovery modal appears (full overlay)
└─> Title: "Welcome back!"
└─> Message: "I found your previous conversation. Would you like to continue where you left off?"
└─> Options:
    ├─> "Continue conversation" → Restore full state
    ├─> "Email me the link" → Send recovery link (TODO)
    └─> "Start fresh" → Clear progress, begin new session
        |
    User clicks "Continue"
        |
        v
Full chat state restored
└─> Messages array restored
└─> User data restored
└─> Chat state restored
└─> User can continue exactly where they left off
```

## Flow 3: LinkedIn Referral

```
User clicks link with ?ref=linkedin or ?utm_source=linkedin
        |
        v
User lands on page
        |
        v
getPersonalizedGreeting() detects LinkedIn referral
        |
        v
[Wait 3.5s]
        |
        v
Chat auto-starts with personalized greeting
└─> Greeting: "Welcome from LinkedIn!"
└─> Context: "I see you're exploring how Fortune 1000 companies transform their teams. Let's discover your path to peak performance."
└─> Quick actions rendered as buttons:
    ├─> "Show me success stories"
    ├─> "Calculate potential ROI"
    └─> "Start quick assessment"
        |
        v
User clicks quick action button
        |
        v
Button text sent as message (e.g., "Show me success stories")
        |
        v
Chat flow processes message and responds
```

## Flow 4: Blog Referral

```
User clicks link with ?ref=blog or ?utm_medium=content
        |
        v
User lands on page
        |
        v
getPersonalizedGreeting() detects blog referral
        |
        v
[Wait 3.5s]
        |
        v
Chat auto-starts with personalized greeting
└─> Greeting: "Great to see you here!"
└─> Context: "Ready to turn insights into action? Let's explore how HumanGlue can transform your organization."
└─> Quick actions:
    ├─> "See real client results"
    ├─> "Get personalized roadmap"
    └─> "Schedule expert call"
```

## Flow 5: Abandonment Recovery

```
User is chatting (messages.length > 0)
        |
        v
User activity tracked (mousemove, keypress, scroll, click, touchstart)
        |
        v
User becomes inactive (no activity events)
        |
        v
[Wait 60s - No activity detected]
        |
        v
abandonmentDetected = true
        |
        v
Abandonment prompt appears inline in chat
└─> Icon: Sparkles
└─> Title: "Still there?"
└─> Message: "I noticed you might need a moment. How would you like to continue?"
└─> Options:
    ├─> "Continue now" → Reset abandonment flag
    ├─> "Send me the link" → Ask for email, save progress
    └─> "I'm just browsing" → Dismiss prompt, track event
        |
    User clicks "Send me the link"
        |
        v
Assistant asks for email in chat
└─> New message: "I'd be happy to send you a link to continue this conversation later. What's your email address?"
```

## Flow 6: Chat Progress Auto-Save

```
User starts chatting
        |
        v
useChatProgress hook initializes
        |
        v
Activity tracking starts
└─> Track: mousemove, keypress, scroll, click, touchstart
        |
        v
Chat state changes (new message, state change, etc.)
        |
        v
Auto-save triggers:
├─> Every 30s (periodic timer)
├─> On state change (useEffect dependency)
└─> On page unload (beforeunload event)
        |
        v
Save to localStorage:
{
  messages: Message[],
  userData: any,
  currentState: ChatState,
  timestamp: string,
  url: string
}
        |
        v
Progress saved under key: 'humanglue_chat_progress'
        |
        v
User closes tab / navigates away
        |
        v
Progress saved for up to 24 hours
```

## Flow 7: Discovery Prompt Timing

```
User lands on page
        |
        v
Check: messages.length === 0 && !hasStarted?
        |
    Yes |
        v
[Wait 5s]
        |
        v
setShowChatPrompt(true)
└─> Prompt appears with fade-in animation
└─> Track: 'chat_prompt_shown'
        |
        v
[Wait 8s]
        |
        v
setShowChatPrompt(false)
└─> Prompt dismisses with fade-out animation
        |
    OR
        |
    User starts chatting (messages.length > 0)
        |
        v
setShowChatPrompt(false)
└─> Prompt immediately dismissed
```

## Engagement Tracking Events

All events stored in localStorage under `humanglue_engagement_events`:

```javascript
{
  event: string,
  timestamp: string (ISO),
  url: string,
  referrer: string,
  ...properties (custom per event)
}
```

**Events Tracked:**
1. `chat_auto_started` - Auto-start triggered
   - Properties: { greeting: string }

2. `chat_prompt_shown` - Discovery prompt displayed
   - Properties: none

3. `conversation_started` - User began chatting
   - Properties: { greetingType: string }

4. `chat_recovery_offered` - Recovery modal shown
   - Properties: { savedMessages: number, savedState: string }

5. `chat_recovered` - User continued saved chat
   - Properties: { messageCount: number }

6. `chat_recovery_email_requested` - User wants email link
   - Properties: none

7. `chat_recovery_declined` - User started fresh
   - Properties: none

8. `chat_abandonment_detected` - 60s inactivity
   - Properties: { messageCount: number, state: string }

9. `abandonment_continue_now` - User continues after abandonment
   - Properties: none

10. `abandonment_email_requested` - User wants email after abandonment
    - Properties: none

11. `abandonment_browsing_continued` - User dismissed abandonment
    - Properties: none

## Timing Configuration

```typescript
const TIMINGS = {
  AUTO_START_DELAY: 3500,        // 3.5 seconds
  DISCOVERY_PROMPT_DELAY: 5000,  // 5 seconds
  DISCOVERY_PROMPT_AUTO_DISMISS: 8000,  // 8 seconds
  ACTIVITY_TIMEOUT: 60000,       // 60 seconds (1 minute)
  SAVE_INTERVAL: 30000,          // 30 seconds
  PROGRESS_EXPIRY: 86400000      // 24 hours
}
```

## State Management

```typescript
// Component State
const [showChatPrompt, setShowChatPrompt] = useState(false)
const [personalizedGreeting, setPersonalizedGreeting] = useState(getPersonalizedGreeting())
const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false)

// From useChatProgress hook
const {
  saveProgress: () => void,
  loadProgress: () => ChatProgress | null,
  clearProgress: () => void,
  abandonmentDetected: boolean,
  resetAbandonmentFlag: () => void
}

// localStorage Keys
- 'humanglue_first_visit': string (ISO timestamp)
- 'humanglue_visit_count': string (number)
- 'humanglue_last_visit': string (ISO timestamp)
- 'humanglue_chat_progress': string (JSON ChatProgress)
- 'humanglue_engagement_events': string (JSON Event[])
```

## Error Handling

All functions include try-catch blocks and graceful degradation:

```typescript
// SSR Safe
if (typeof window === 'undefined') return

// localStorage error handling
try {
  localStorage.setItem(key, value)
} catch (error) {
  console.error('Failed to save:', error)
  // Continue without saving
}

// Focus check with fallback
const hasFocus = typeof document !== 'undefined'
  ? document.hasFocus()
  : true // Default to true in SSR
```

## Mobile Considerations

- All prompts are responsive
- Touch events tracked (`touchstart`) in addition to mouse events
- Buttons sized for touch targets (min 44px)
- Modals sized appropriately for mobile screens
- Discovery prompt positioned to not overlap with chat input

## Accessibility

- All buttons have proper `aria-label` attributes
- Focus management for modals
- Keyboard navigation supported
- Screen reader friendly messaging
- Color contrast meets WCAG AA standards
