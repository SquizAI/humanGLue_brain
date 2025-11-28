'use client'

import { motion, useAnimation } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../../utils/cn'
import { Button } from '../atoms'
import { Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useChat } from '../../lib/contexts/ChatContext'

export interface NavigationProps {
  className?: string
}

const navItems = [
  { href: '/solutions', label: 'Solutions' },
  { href: '/purpose', label: 'Purpose' },
  { href: '/results', label: 'Results' },
  { href: '/workshops', label: 'Workshops' },
  { href: '/talent', label: 'Talent' },
  { href: '/pricing', label: 'Pricing' }
]

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { userData } = useChat()

  // Smart Navigation Show/Hide State
  const [isVisible, setIsVisible] = useState(true)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastScrollY = useRef(0)
  const scrollThreshold = 50 // Minimum scroll movement to trigger
  const rafId = useRef<number>()

  const controls = useAnimation()

  /**
   * Smart Navigation Show/Hide Logic
   * - Hide on scroll down
   * - Show on scroll up
   * - Always show when at top of page
   * - Minimum 50px movement before triggering
   */
  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }

      rafId.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY

        // Check if at top of page
        const atTop = currentScrollY < 10
        setIsAtTop(atTop)

        // Always show when at top
        if (atTop) {
          setIsVisible(true)
          setScrolled(false)
          controls.start({
            y: 0,
            opacity: 1,
            transition: { duration: 0.3, ease: 'easeOut' }
          })
          return
        }

        // Only trigger if scrolled past threshold
        const scrollDelta = Math.abs(currentScrollY - lastScrollY.current)

        if (scrollDelta > scrollThreshold) {
          const scrollingDown = currentScrollY > lastScrollY.current

          if (scrollingDown) {
            // Scrolling down - hide navigation
            setIsVisible(false)
            controls.start({
              y: -100,
              opacity: 0,
              transition: { duration: 0.3, ease: 'easeIn' }
            })
          } else {
            // Scrolling up - show navigation
            setIsVisible(true)
            controls.start({
              y: 0,
              opacity: 1,
              transition: { duration: 0.3, ease: 'easeOut' }
            })
          }

          lastScrollY.current = currentScrollY
        }

        // Track if page has been scrolled (for backdrop blur effect)
        setScrolled(currentScrollY > 10)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [controls])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Get the height of the navigation for proper spacing
  const navHeight = 'h-14 md:h-16'

  return (
    <>
      <motion.header
        initial={{ opacity: 1, y: 0 }}
        animate={controls}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled && "backdrop-blur-xl bg-gray-900/80",
          className
        )}
      >
        <nav className={cn("container max-w-7xl mx-auto px-6", navHeight, "flex items-center")}>
          <div className="flex items-center justify-between w-full relative">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative"
              >
                <Image
                  src="/HumnaGlue_logo_white_blue.png"
                  alt="Human Glue"
                  width={160}
                  height={42}
                  className="w-28 sm:w-32 cursor-pointer"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation - Centered */}
            <motion.div
              className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.span
                    className={cn(
                      "text-sm font-medium transition-all relative group cursor-pointer inline-block font-gendy",
                      pathname === item.href
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                    <span className={cn(
                      "absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-brand-cyan to-brand-purple transition-transform origin-left",
                      pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )} />
                  </motion.span>
                </Link>
              ))}
            </motion.div>

            {/* CTA Button or Welcome Message - Right side */}
            <motion.div
              className="hidden md:flex items-center gap-3 flex-shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {userData?.authenticated ? (
                <>
                  <div className="text-sm text-white/80 font-diatype">
                    Welcome, <span className="text-white font-medium">{userData.name || userData.email}</span>
                  </div>
                  <Link href="/dashboard">
                    <Button
                      variant="gradient"
                      size="sm"
                      className="shadow-lg"
                    >
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="secondary"
                      size="sm"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      variant="gradient"
                      size="sm"
                      className="shadow-lg"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Mobile menu button */}
            <motion.button
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10"
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </div>
        </nav>

        {/* Mobile Navigation - Full Screen Overlay */}
        <motion.div
          initial={false}
          animate={{
            opacity: mobileMenuOpen ? 1 : 0,
            pointerEvents: mobileMenuOpen ? 'auto' : 'none'
          }}
          className="md:hidden fixed inset-0 top-14 bg-gray-900 backdrop-blur-xl z-40"
          style={{ display: mobileMenuOpen ? 'block' : 'none' }}
        >
          <div className="container mx-auto px-6 py-8">
            <div className="space-y-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "block py-3 text-lg font-medium transition-colors",
                      pathname === item.href
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {item.label}
                  </motion.div>
                </Link>
              ))}

              {/* Auth Buttons */}
              <div className="pt-6 border-t border-white/10 space-y-3">
                {userData?.authenticated ? (
                  <>
                    <div className="text-sm text-white/80 font-diatype mb-4">
                      Welcome, <span className="text-white font-medium">{userData.name || userData.email}</span>
                    </div>
                    <Link href="/dashboard">
                      <Button
                        variant="gradient"
                        size="md"
                        className="w-full"
                      >
                        Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        variant="gradient"
                        size="md"
                        className="w-full"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.header>
    </>
  )
}
