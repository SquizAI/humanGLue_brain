/**
 * Realtime Context
 * Central subscription management for Supabase Realtime
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js'
import { RealtimeContextValue, RealtimeConnectionStatus, SubscriptionConfig } from '@/lib/types/realtime'
import { useChat } from './ChatContext'

const RealtimeContext = createContext<RealtimeContextValue | null>(null)

interface RealtimeProviderProps {
  children: React.ReactNode
  autoConnect?: boolean
  debug?: boolean
}

export function RealtimeProvider({
  children,
  autoConnect = true,
  debug = false
}: RealtimeProviderProps) {
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>({
    connected: false,
    reconnecting: false,
  })
  const [channels, setChannels] = useState<Map<string, RealtimeChannel>>(new Map())

  const { userData } = useChat()
  const supabase = createClient()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  // Monitor connection status
  useEffect(() => {
    if (!autoConnect || !userData?.id) return

    const handleConnectionChange = (status: string) => {
      if (debug) {
        console.log('[Realtime] Connection status:', status)
      }

      if (status === 'SUBSCRIBED') {
        setConnectionStatus({
          connected: true,
          reconnecting: false,
          lastConnected: new Date(),
        })
        reconnectAttempts.current = 0
      } else if (status === 'CHANNEL_ERROR') {
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
          error: new Error('Channel error'),
        }))
        handleReconnect()
      } else if (status === 'TIMED_OUT') {
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
          error: new Error('Connection timed out'),
        }))
        handleReconnect()
      } else if (status === 'CLOSED') {
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
        }))
      }
    }

    // Create a heartbeat channel to monitor connection
    const heartbeatChannel = supabase.channel(`heartbeat:${userData.id}`)

    heartbeatChannel
      .on('presence', { event: 'sync' }, () => {
        handleConnectionChange('SUBSCRIBED')
      })
      .subscribe((status) => {
        handleConnectionChange(status)
      })

    setChannels(prev => new Map(prev).set('heartbeat', heartbeatChannel))

    return () => {
      heartbeatChannel.unsubscribe()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [autoConnect, userData?.id, debug, supabase])

  // Reconnection logic with exponential backoff
  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('[Realtime] Max reconnection attempts reached')
      setConnectionStatus(prev => ({
        ...prev,
        reconnecting: false,
        error: new Error('Failed to reconnect after multiple attempts'),
      }))
      return
    }

    setConnectionStatus(prev => ({ ...prev, reconnecting: true }))
    reconnectAttempts.current += 1

    const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)

    if (debug) {
      console.log(`[Realtime] Reconnecting in ${backoffDelay}ms (attempt ${reconnectAttempts.current})`)
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      // Resubscribe all channels
      channels.forEach((channel, name) => {
        channel.subscribe()
      })
    }, backoffDelay)
  }, [channels, debug])

  // Subscribe to a channel
  const subscribe = useCallback(
    (channelName: string, config: SubscriptionConfig): RealtimeChannel | null => {
      if (!config.enabled) {
        if (debug) {
          console.log(`[Realtime] Subscription disabled for ${channelName}`)
        }
        return null
      }

      // Check if channel already exists
      if (channels.has(channelName)) {
        if (debug) {
          console.log(`[Realtime] Channel ${channelName} already exists`)
        }
        return channels.get(channelName)!
      }

      if (debug) {
        console.log(`[Realtime] Creating channel: ${channelName}`)
      }

      const channel = supabase.channel(channelName)

      // Subscribe based on configuration
      if (config.filter) {
        channel.subscribe((status) => {
          if (debug) {
            console.log(`[Realtime] Channel ${channelName} status:`, status)
          }
        })
      }

      setChannels(prev => new Map(prev).set(channelName, channel))
      return channel
    },
    [channels, debug, supabase]
  )

  // Unsubscribe from a channel
  const unsubscribe = useCallback(
    (channelName: string) => {
      const channel = channels.get(channelName)
      if (channel) {
        if (debug) {
          console.log(`[Realtime] Unsubscribing from ${channelName}`)
        }
        channel.unsubscribe()
        setChannels(prev => {
          const newChannels = new Map(prev)
          newChannels.delete(channelName)
          return newChannels
        })
      }
    },
    [channels, debug]
  )

  // Unsubscribe from all channels
  const unsubscribeAll = useCallback(() => {
    if (debug) {
      console.log('[Realtime] Unsubscribing from all channels')
    }

    channels.forEach((channel, name) => {
      if (name !== 'heartbeat') {
        channel.unsubscribe()
      }
    })

    setChannels(new Map([['heartbeat', channels.get('heartbeat')!]]))
  }, [channels, debug])

  // Connection status indicator component
  const ConnectionIndicator = () => {
    if (!connectionStatus.connected && connectionStatus.reconnecting) {
      return (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          <span>Reconnecting...</span>
        </div>
      )
    }

    if (!connectionStatus.connected && connectionStatus.error) {
      return (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Connection error. Please refresh the page.
        </div>
      )
    }

    return null
  }

  const value: RealtimeContextValue = {
    isConnected: connectionStatus.connected,
    connectionStatus,
    subscribe,
    unsubscribe,
    unsubscribeAll,
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      {debug && <ConnectionIndicator />}
    </RealtimeContext.Provider>
  )
}

// Hook to use the Realtime context
export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

// HOC to wrap components that need realtime
export function withRealtime<P extends object>(
  Component: React.ComponentType<P>,
  config?: { autoConnect?: boolean; debug?: boolean }
) {
  return function WithRealtimeComponent(props: P) {
    return (
      <RealtimeProvider autoConnect={config?.autoConnect} debug={config?.debug}>
        <Component {...props} />
      </RealtimeProvider>
    )
  }
}
