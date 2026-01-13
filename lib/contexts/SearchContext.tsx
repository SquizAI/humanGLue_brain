'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { SearchResult, SearchResultType } from '@/lib/hooks/useProjectManager'

export interface SelectedItem {
  id: string
  type: SearchResultType
}

interface SearchContextType {
  // Selected/highlighted item from search
  selectedItem: SelectedItem | null
  setSelectedItem: (item: SelectedItem | null) => void

  // Navigation request - tells parent to switch views
  pendingNavigation: { view: 'kanban' | 'roadmap'; itemId: string } | null
  requestNavigation: (view: 'kanban' | 'roadmap', itemId: string) => void
  clearNavigation: () => void

  // Highlight state for views
  highlightedItemId: string | null
  setHighlightedItemId: (id: string | null) => void
  clearHighlight: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

interface SearchProviderProps {
  children: ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [pendingNavigation, setPendingNavigation] = useState<{ view: 'kanban' | 'roadmap'; itemId: string } | null>(null)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)

  const requestNavigation = useCallback((view: 'kanban' | 'roadmap', itemId: string) => {
    setPendingNavigation({ view, itemId })
    setHighlightedItemId(itemId)
  }, [])

  const clearNavigation = useCallback(() => {
    setPendingNavigation(null)
  }, [])

  const clearHighlight = useCallback(() => {
    setHighlightedItemId(null)
    // Clear highlight after animation duration
    setTimeout(() => {
      setHighlightedItemId(null)
    }, 3000)
  }, [])

  return (
    <SearchContext.Provider
      value={{
        selectedItem,
        setSelectedItem,
        pendingNavigation,
        requestNavigation,
        clearNavigation,
        highlightedItemId,
        setHighlightedItemId,
        clearHighlight,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchContext() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}
