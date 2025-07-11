'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../../utils/cn'
import { Button } from '../atoms'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface NavigationProps {
  className?: string
}

const navItems = [
  { href: '/solutions', label: 'Solutions' },
  { href: '/process', label: 'Process' },
  { href: '/results', label: 'Results' }
]

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Get the height of the navigation for proper spacing
  const navHeight = 'h-16 md:h-20'

  return (
    <>
      {/* Spacer to prevent content from going under fixed header */}
      <div className={navHeight} />
      
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "backdrop-blur-xl bg-gray-900/80 shadow-lg" : "backdrop-blur-md bg-gray-900/50",
          "border-b border-white/10",
          className
        )}
      >
        <nav className={cn("container max-w-7xl mx-auto px-4 sm:px-6", navHeight, "flex items-center")}>
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative"
              >
                <Image
                  src="/HumanGlue_nobackground.png"
                  alt="Human Glue"
                  width={120}
                  height={48}
                  className="w-24 sm:w-28 cursor-pointer"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <motion.div 
              className="hidden md:flex items-center gap-6 lg:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.span 
                    className={cn(
                      "text-sm font-medium transition-all relative group cursor-pointer inline-block",
                      pathname === item.href 
                        ? "text-white" 
                        : "text-gray-400 hover:text-white"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                    <span className={cn(
                      "absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-transform origin-left",
                      pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )} />
                  </motion.span>
                </Link>
              ))}
              
              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/#chat">
                  <Button 
                    variant="gradient"
                    size="sm"
                    className="shadow-lg"
                  >
                    Get Started
                  </Button>
                </Link>
              </motion.div>
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
          className="md:hidden fixed inset-0 top-16 bg-gray-900 backdrop-blur-xl z-40"
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
              <Link href="/#chat">
                <Button 
                  variant="gradient"
                  size="md"
                  className="w-full mt-8"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.header>
    </>
  )
}