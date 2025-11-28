'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../../utils/cn'
import {
  LayoutDashboard,
  Video,
  PlayCircle,
  Users,
  ClipboardList,
  BookOpen,
  BarChart3,
  User,
  MoreHorizontal,
  X,
  Bookmark,
  Calendar,
  Edit,
  Settings,
  LogOut,
  Globe,
  DollarSign,
  Database,
} from 'lucide-react'
import { useState } from 'react'
import { useChat } from '@/lib/contexts/ChatContext'

export interface MobileDashboardNavProps {
  onLogout?: () => void
}

/**
 * Mobile Dashboard Navigation
 *
 * Clean sticky footer navigation with icons only
 * Role-based navigation items (Client/Instructor/Admin)
 * More menu with accordion for additional options
 */

// CLIENT NAVIGATION (4 main + more menu)
const clientMainItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/dashboard/learning', label: 'Learning', icon: PlayCircle },
  { href: '/dashboard/talent', label: 'Experts', icon: Users },
]

const clientMoreItems = [
  { href: '/dashboard/workshops', label: 'Live Workshops', icon: Video },
  { href: '/dashboard/resources', label: 'Resources', icon: BookOpen },
  { href: '/dashboard/saved', label: 'Saved Items', icon: Bookmark },
  { href: '/dashboard/meetings', label: 'Meetings', icon: Calendar },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

// INSTRUCTOR NAVIGATION (4 main + more menu)
const instructorMainItems = [
  { href: '/instructor', label: 'Overview', icon: LayoutDashboard },
  { href: '/instructor/courses', label: 'Courses', icon: PlayCircle },
  { href: '/instructor/workshops', label: 'Workshops', icon: Video },
  { href: '/instructor/students', label: 'Students', icon: Users },
]

const instructorMoreItems = [
  { href: '/instructor/courses/new', label: 'Create Course', icon: Edit },
  { href: '/instructor/workshops/new', label: 'Schedule Workshop', icon: Calendar },
  { href: '/instructor/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/instructor/profile', label: 'Profile', icon: User },
  { href: '/instructor/settings', label: 'Settings', icon: Settings },
]

// ADMIN NAVIGATION (4 main + more menu)
const adminMainItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/courses', label: 'Courses', icon: PlayCircle },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

const adminMoreItems = [
  { href: '/admin/organizations', label: 'Organizations', icon: Globe },
  { href: '/admin/workshops', label: 'Workshops', icon: Video },
  { href: '/admin/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/admin/payments', label: 'Payments', icon: DollarSign },
  { href: '/admin/database', label: 'Database', icon: Database },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function MobileDashboardNav({ onLogout }: MobileDashboardNavProps) {
  const pathname = usePathname()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const { userData } = useChat()

  // Determine user role
  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || userData?.userType === 'admin'
  const isInstructor = userData?.isInstructor || userData?.role === 'instructor' || userData?.userType === 'instructor'

  // Get navigation items based on role
  const getNavConfig = () => {
    if (isAdmin) {
      return {
        mainItems: adminMainItems,
        moreItems: adminMoreItems,
      }
    } else if (isInstructor) {
      return {
        mainItems: instructorMainItems,
        moreItems: instructorMoreItems,
      }
    } else {
      return {
        mainItems: clientMainItems,
        moreItems: clientMoreItems,
      }
    }
  }

  const navConfig = getNavConfig()

  const NavButton = ({ item, onClick }: { item: typeof clientMainItems[0], onClick?: () => void }) => {
    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
    const Icon = item.icon

    return (
      <Link href={item.href} onClick={onClick}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-full min-h-[64px] relative',
            'transition-all duration-200'
          )}
        >
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-cyan rounded-full"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}

          {/* Icon container - clean design, no gradients */}
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
              isActive
                ? 'bg-brand-cyan/20 text-brand-cyan'
                : 'text-gray-400'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>

          {/* Label */}
          <span
            className={cn(
              'text-[10px] font-medium font-diatype',
              isActive ? 'text-brand-cyan' : 'text-gray-500'
            )}
          >
            {item.label}
          </span>
        </motion.button>
      </Link>
    )
  }

  return (
    <>
      {/* Sticky Footer Navigation - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Main Navigation Bar */}
        <div className="bg-gray-950/98 backdrop-blur-xl border-t border-white/10 safe-bottom">
          <div className="grid grid-cols-5 gap-1 px-2 py-1">
            {/* Main navigation items */}
            {navConfig.mainItems.map((item) => (
              <NavButton key={item.href} item={item} />
            ))}

            {/* More button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full min-h-[64px] relative',
                'transition-all duration-200'
              )}
            >
              {/* Active indicator for more menu */}
              {showMoreMenu && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-cyan rounded-full"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}

              {/* Icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                  showMoreMenu
                    ? 'bg-brand-cyan/20 text-brand-cyan'
                    : 'text-gray-400'
                )}
              >
                {showMoreMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <MoreHorizontal className="w-5 h-5" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-medium font-diatype',
                  showMoreMenu ? 'text-brand-cyan' : 'text-gray-500'
                )}
              >
                More
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreMenu(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* More Menu Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-950/98 backdrop-blur-xl border-t border-white/10 rounded-t-3xl overflow-hidden"
              style={{ maxHeight: '70vh' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white font-gendy">More Options</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMoreMenu(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Menu Items */}
              <div className="overflow-y-auto px-4 py-4 space-y-2" style={{ maxHeight: 'calc(70vh - 80px)' }}>
                {navConfig.moreItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  const Icon = item.icon

                  return (
                    <Link key={item.href} href={item.href} onClick={() => setShowMoreMenu(false)}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'flex items-center gap-4 px-4 py-3 rounded-xl transition-all',
                          isActive
                            ? 'bg-brand-cyan/10 border border-brand-cyan/30'
                            : 'hover:bg-white/5'
                        )}
                      >
                        {/* Icon - clean design */}
                        <div
                          className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-lg transition-all',
                            isActive
                              ? 'bg-brand-cyan/20 text-brand-cyan'
                              : 'bg-white/5 text-gray-400'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Label */}
                        <span
                          className={cn(
                            'text-sm font-medium font-diatype',
                            isActive ? 'text-white' : 'text-gray-300'
                          )}
                        >
                          {item.label}
                        </span>
                      </motion.div>
                    </Link>
                  )
                })}

                {/* Logout button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowMoreMenu(false)
                    onLogout?.()
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 group-hover:bg-red-500/20 transition-all">
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-all" />
                  </div>
                  <span className="text-sm font-medium font-diatype text-gray-300 group-hover:text-red-400 transition-all">
                    Logout
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
