import { useState, useEffect } from 'react'

interface MobileDeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isIOS: boolean
  isAndroid: boolean
  isStandalone: boolean
  hasNotch: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
  orientation: 'portrait' | 'landscape'
  viewportHeight: number
  viewportWidth: number
  keyboardHeight: number
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export function useMobileDevice(): MobileDeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<MobileDeviceInfo>({
    isMobile: false,
    isTablet: false,
    isIOS: false,
    isAndroid: false,
    isStandalone: false,
    hasNotch: false,
    deviceType: 'desktop',
    orientation: 'portrait',
    viewportHeight: 0,
    viewportWidth: 0,
    keyboardHeight: 0,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Device detection
      const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      const isAndroid = /android/.test(userAgent)
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      
      // Standalone detection (PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone || 
                          document.referrer.includes('android-app://')
      
      // Notch detection
      const hasNotch = isIOS && (
        screen.height === 812 || screen.height === 896 || // iPhone X, XS, 11 Pro, 12, 13, 14
        screen.height === 844 || screen.height === 926 || // iPhone 12/13/14 Pro Max
        screen.height === 852 || screen.height === 932    // iPhone 14 Pro, 15 Pro
      )
      
      // Orientation
      const orientation = width > height ? 'landscape' : 'portrait'
      
      // Viewport dimensions
      const viewportHeight = window.visualViewport?.height || height
      const viewportWidth = window.visualViewport?.width || width
      
      // Keyboard height (for iOS)
      const keyboardHeight = height - viewportHeight
      
      // Safe area insets
      const computedStyle = getComputedStyle(document.documentElement)
      const safeAreaInsets = {
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0')
      }
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isIOS,
        isAndroid,
        isStandalone,
        hasNotch,
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        orientation,
        viewportHeight,
        viewportWidth,
        keyboardHeight,
        safeAreaInsets
      })
    }

    // Initial update
    updateDeviceInfo()

    // Event listeners
    const handleResize = () => updateDeviceInfo()
    const handleOrientationChange = () => setTimeout(updateDeviceInfo, 100)
    const handleViewportChange = () => updateDeviceInfo()

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    window.visualViewport?.addEventListener('resize', handleViewportChange)
    window.visualViewport?.addEventListener('scroll', handleViewportChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.visualViewport?.removeEventListener('resize', handleViewportChange)
      window.visualViewport?.removeEventListener('scroll', handleViewportChange)
    }
  }, [])

  return deviceInfo
}

// Utility functions for common mobile operations
export function preventIOSBounce() {
  if (typeof document === 'undefined') return

  let startY = 0
  
  const handleTouchStart = (e: TouchEvent) => {
    startY = e.touches[0].pageY
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    const element = e.target as HTMLElement
    const scrollElement = element.closest('.scroll-container') as HTMLElement
    
    if (!scrollElement) {
      e.preventDefault()
      return
    }
    
    const currentY = e.touches[0].pageY
    const isScrollingUp = currentY > startY
    const isAtTop = scrollElement.scrollTop === 0
    const isAtBottom = scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight
    
    if ((isScrollingUp && isAtTop) || (!isScrollingUp && isAtBottom)) {
      e.preventDefault()
    }
  }
  
  document.addEventListener('touchstart', handleTouchStart, { passive: false })
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  
  return () => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
  }
}

// Set CSS custom properties for safe areas
export function setSafeAreaProperties() {
  if (typeof document === 'undefined') return
  
  const style = document.documentElement.style
  
  // Set safe area CSS variables
  style.setProperty('--sat', 'env(safe-area-inset-top)')
  style.setProperty('--sab', 'env(safe-area-inset-bottom)')
  style.setProperty('--sal', 'env(safe-area-inset-left)')
  style.setProperty('--sar', 'env(safe-area-inset-right)')
}

// Prevent zoom on input focus
export function preventInputZoom() {
  if (typeof document === 'undefined') return
  
  const metaViewport = document.querySelector('meta[name="viewport"]')
  if (metaViewport) {
    metaViewport.setAttribute('content', 
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
    )
  }
} 