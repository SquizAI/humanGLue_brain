/**
 * Real-time Communications Hook
 * React hook for Supabase Realtime messaging features
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useChat } from '@/lib/contexts/ChatContext'
import {
  CommunicationMessage,
  CommunicationConversation,
  MessagingChannel,
  UseCommunicationsReturn,
  SendMessageOptions,
  CommunicationFilters,
  CommunicationChannel,
} from '@/lib/types/realtime'
import { RealtimeChannel } from '@supabase/supabase-js'

// =====================================================================================
// COMMUNICATIONS HOOK
// =====================================================================================

export function useCommunications(
  filters?: CommunicationFilters
): UseCommunicationsReturn {
  const [messages, setMessages] = useState<CommunicationMessage[]>([])
  const [conversations, setConversations] = useState<CommunicationConversation[]>([])
  const [channels, setChannels] = useState<MessagingChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { userData } = useChat()
  const channelRef = useRef<RealtimeChannel | null>(null)
  // Use any cast to bypass strict type checking for tables not in generated types
  const supabase = createClient() as any

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!userData?.id) return

    try {
      let query = supabase
        .from('communication_logs')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(100)

      // Apply filters
      if (filters?.channel && filters.channel.length > 0) {
        query = query.in('channel', filters.channel)
      }
      if (filters?.direction) {
        query = query.eq('direction', filters.direction)
      }
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }
      if (filters?.contactIdentifier) {
        query = query.or(`recipient.eq.${filters.contactIdentifier},sender.eq.${filters.contactIdentifier}`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setMessages(data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
      throw err
    }
  }, [userData?.id, filters, supabase])

  // Fetch channels
  const fetchChannels = useCallback(async () => {
    if (!userData?.id) return

    try {
      const { data, error: fetchError } = await supabase
        .from('messaging_channels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setChannels(data || [])
    } catch (err) {
      console.error('Error fetching channels:', err)
    }
  }, [userData?.id, supabase])

  // Build conversations from messages
  const buildConversations = useCallback((msgs: CommunicationMessage[]) => {
    const conversationMap = new Map<string, CommunicationConversation>()

    msgs.forEach((msg) => {
      const contactId = msg.direction === 'outbound' ? msg.recipient : (msg.sender || msg.recipient)
      const key = `${contactId}-${msg.channel}`

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          id: key,
          organization_id: msg.organization_id || '',
          contact_identifier: contactId,
          channel_type: msg.channel as CommunicationChannel,
          last_message_at: msg.created_at,
          unread_count: msg.direction === 'inbound' && msg.status !== 'read' ? 1 : 0,
          status: 'active',
          created_at: msg.created_at,
        })
      } else {
        const existing = conversationMap.get(key)!
        if (new Date(msg.created_at) > new Date(existing.last_message_at)) {
          existing.last_message_at = msg.created_at
        }
        if (msg.direction === 'inbound' && msg.status !== 'read') {
          existing.unread_count++
        }
      }
    })

    return Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    )
  }, [])

  // Initial fetch
  const refetch = useCallback(async () => {
    if (!userData?.id) return

    try {
      setLoading(true)
      await Promise.all([fetchMessages(), fetchChannels()])
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userData?.id, fetchMessages, fetchChannels])

  // Update conversations when messages change
  useEffect(() => {
    setConversations(buildConversations(messages))
  }, [messages, buildConversations])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userData?.id) return

    refetch()

    // Create real-time subscription for new messages
    const channel = supabase
      .channel(`communications:${userData.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communication_logs',
          filter: `user_id=eq.${userData.id}`,
        },
        (payload: any) => {
          const newMessage = payload.new as CommunicationMessage
          setMessages((prev) => [newMessage, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'communication_logs',
          filter: `user_id=eq.${userData.id}`,
        },
        (payload: any) => {
          const updatedMessage = payload.new as CommunicationMessage
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          )
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [userData?.id, refetch, supabase])

  // Send message
  const sendMessage = useCallback(
    async (options: SendMessageOptions): Promise<CommunicationMessage> => {
      if (!userData?.id) {
        throw new Error('User not authenticated')
      }

      try {
        // Call API to send message
        const response = await fetch('/api/communications/sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: options.to,
            message: options.message,
            channelId: options.channelId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send message')
        }

        const data = await response.json()

        // Return the message data
        const newMessage: CommunicationMessage = {
          id: data.messageId,
          user_id: userData.id,
          channel: options.channel || 'sms',
          provider: 'bird',
          direction: 'outbound',
          recipient: options.to,
          content: options.message,
          external_id: data.messageId,
          status: data.status || 'sent',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Optimistically add to messages
        setMessages((prev) => [newMessage, ...prev])

        return newMessage
      } catch (err) {
        console.error('Error sending message:', err)
        throw err
      }
    },
    [userData?.id]
  )

  // Mark message as read
  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        const { error: updateError } = await supabase
          .from('communication_logs')
          .update({ status: 'read' })
          .eq('id', messageId)
          .eq('user_id', userData?.id)

        if (updateError) throw updateError

        // Optimistic update
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, status: 'read' as const } : m
          )
        )
      } catch (err) {
        console.error('Error marking message as read:', err)
        throw err
      }
    },
    [userData?.id, supabase]
  )

  return {
    messages,
    conversations,
    channels,
    loading,
    error,
    sendMessage,
    markAsRead,
    refetch,
  }
}

// =====================================================================================
// CONVERSATION HOOK - For a specific conversation thread
// =====================================================================================

export interface UseConversationReturn {
  messages: CommunicationMessage[]
  loading: boolean
  error: Error | null
  sendMessage: (message: string) => Promise<CommunicationMessage>
  loadMore: () => Promise<void>
  hasMore: boolean
}

export function useConversation(
  contactIdentifier: string,
  channelType: CommunicationChannel = 'sms'
): UseConversationReturn {
  const [messages, setMessages] = useState<CommunicationMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const { userData } = useChat()
  const channelRef = useRef<RealtimeChannel | null>(null)
  // Use any cast to bypass strict type checking for tables not in generated types
  const supabase = createClient() as any

  const fetchMessages = useCallback(async (offset = 0) => {
    if (!userData?.id || !contactIdentifier) return

    try {
      if (offset === 0) setLoading(true)

      const { data, error: fetchError } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('user_id', userData.id)
        .eq('channel', channelType)
        .or(`recipient.eq.${contactIdentifier},sender.eq.${contactIdentifier}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + 49)

      if (fetchError) throw fetchError

      if (offset === 0) {
        setMessages(data || [])
      } else {
        setMessages((prev) => [...prev, ...(data || [])])
      }

      setHasMore((data?.length || 0) === 50)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching conversation:', err)
    } finally {
      setLoading(false)
    }
  }, [userData?.id, contactIdentifier, channelType, supabase])

  // Subscribe to real-time updates for this conversation
  useEffect(() => {
    if (!userData?.id || !contactIdentifier) return

    fetchMessages()

    // Create real-time subscription
    const channel = supabase
      .channel(`conversation:${contactIdentifier}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communication_logs',
          filter: `user_id=eq.${userData.id}`,
        },
        (payload: any) => {
          const newMessage = payload.new as CommunicationMessage
          // Only add if it's for this conversation
          if (
            newMessage.channel === channelType &&
            (newMessage.recipient === contactIdentifier || newMessage.sender === contactIdentifier)
          ) {
            setMessages((prev) => [newMessage, ...prev])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'communication_logs',
          filter: `user_id=eq.${userData.id}`,
        },
        (payload: any) => {
          const updatedMessage = payload.new as CommunicationMessage
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          )
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [userData?.id, contactIdentifier, channelType, fetchMessages, supabase])

  const sendMessage = useCallback(
    async (message: string): Promise<CommunicationMessage> => {
      if (!userData?.id) {
        throw new Error('User not authenticated')
      }

      const response = await fetch('/api/communications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contactIdentifier,
          message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      const newMessage: CommunicationMessage = {
        id: data.messageId,
        user_id: userData.id,
        channel: channelType,
        provider: 'bird',
        direction: 'outbound',
        recipient: contactIdentifier,
        content: message,
        external_id: data.messageId,
        status: data.status || 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setMessages((prev) => [newMessage, ...prev])

      return newMessage
    },
    [userData?.id, contactIdentifier, channelType]
  )

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchMessages(messages.length)
    }
  }, [hasMore, loading, messages.length, fetchMessages])

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadMore,
    hasMore,
  }
}

// =====================================================================================
// CHANNEL STATUS HOOK - Monitor channel health
// =====================================================================================

export interface ChannelStatus {
  channelId: string
  name: string
  status: 'active' | 'inactive' | 'error'
  lastMessageAt?: string
  messageCount24h: number
  errorCount24h: number
}

export interface UseChannelStatusReturn {
  statuses: ChannelStatus[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useChannelStatus(): UseChannelStatusReturn {
  const [statuses, setStatuses] = useState<ChannelStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { userData } = useChat()
  // Use any cast to bypass strict type checking for tables not in generated types
  const supabase = createClient() as any

  const fetchStatus = useCallback(async () => {
    if (!userData?.id) return

    try {
      setLoading(true)

      // Get channels
      const { data: channels, error: channelError } = await supabase
        .from('messaging_channels')
        .select('*')
        .eq('is_active', true)

      if (channelError) throw channelError

      // Get message stats for last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { data: messages, error: msgError } = await supabase
        .from('communication_logs')
        .select('id, status, created_at, metadata')
        .gte('created_at', oneDayAgo)

      if (msgError) throw msgError

      // Build status for each channel
      const statusList: ChannelStatus[] = (channels || []).map((ch: any) => {
        const channelMessages = (messages || []).filter(
          (m: any) => m.metadata?.channelId === ch.external_channel_id
        )

        return {
          channelId: ch.id,
          name: ch.name,
          status: ch.is_active ? 'active' : 'inactive',
          lastMessageAt: channelMessages[0]?.created_at,
          messageCount24h: channelMessages.length,
          errorCount24h: channelMessages.filter((m: any) => m.status === 'failed').length,
        }
      })

      setStatuses(statusList)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching channel status:', err)
    } finally {
      setLoading(false)
    }
  }, [userData?.id, supabase])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    statuses,
    loading,
    error,
    refetch: fetchStatus,
  }
}
