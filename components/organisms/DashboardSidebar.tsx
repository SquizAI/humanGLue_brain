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
  FileText,
  BookOpen,
  BarChart3,
  ClipboardList,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  Award,
  Target,
  ChevronLeft,
  Menu,
  Bookmark,
  Calendar,
  Edit,
  Shield,
  Database,
  Globe,
  DollarSign,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CartIcon } from '@/components/molecules/CartIcon'
import { CartDrawer } from '@/components/organisms/CartDrawer'
import { MobileDashboardNav } from '@/components/organisms/MobileDashboardNav'
import { useSocial } from '@/lib/contexts/SocialContext'
import { useChat } from '@/lib/contexts/ChatContext'

export interface DashboardSidebarProps {
  className?: string
  onLogout?: () => void
}

// CLIENT NAVIGATION (Regular User)
const clientMainNavItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Your transformation dashboard',
  },
  {
    href: '/dashboard/assessments',
    label: 'Assessments',
    icon: ClipboardList,
    description: 'View your AI readiness results',
    badge: 'New',
  },
]

const clientLearningItems = [
  {
    href: '/dashboard/learning',
    label: 'Courses',
    icon: PlayCircle,
    description: 'Masterclass-quality learning',
  },
  {
    href: '/dashboard/workshops',
    label: 'Live Workshops',
    icon: Video,
    description: 'Expert-led sessions',
  },
  {
    href: '/dashboard/resources',
    label: 'Resources',
    icon: BookOpen,
    description: 'Guides & frameworks',
  },
  {
    href: '/dashboard/saved',
    label: 'Saved Items',
    icon: Bookmark,
    description: 'Your bookmarked content',
  },
]

const clientMeetingItems = [
  {
    href: '/dashboard/meetings',
    label: 'AI Meeting Assistant',
    icon: Video,
    description: 'Record & transcribe meetings',
    badge: 'AI',
  },
]

const clientTalentItems = [
  {
    href: '/dashboard/talent',
    label: 'Expert Network',
    icon: Users,
    description: 'Staff augmentation',
  },
]

const clientInsightsItems = [
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Track your progress',
  },
]

const clientAccountItems = [
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: User,
    description: 'Manage your account',
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Preferences & billing',
  },
]

// INSTRUCTOR NAVIGATION (Teacher)
const instructorMainNavItems = [
  {
    href: '/instructor',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Instructor dashboard',
  },
  {
    href: '/instructor/courses',
    label: 'My Courses',
    icon: PlayCircle,
    description: 'Manage your courses',
  },
  {
    href: '/instructor/courses/new',
    label: 'Create Course',
    icon: Edit,
    description: 'Build a new course',
    badge: 'New',
  },
]

const instructorWorkshopItems = [
  {
    href: '/instructor/workshops',
    label: 'My Workshops',
    icon: Video,
    description: 'Manage workshops',
  },
  {
    href: '/instructor/workshops/new',
    label: 'Schedule Workshop',
    icon: Calendar,
    description: 'Plan a live session',
  },
]

const instructorStudentItems = [
  {
    href: '/instructor/students',
    label: 'Students',
    icon: Users,
    description: 'View enrollments',
  },
  {
    href: '/instructor/analytics',
    label: 'Course Analytics',
    icon: BarChart3,
    description: 'Track engagement',
  },
]

const instructorAccountItems = [
  {
    href: '/instructor/profile',
    label: 'Profile',
    icon: User,
    description: 'Instructor profile',
  },
  {
    href: '/instructor/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Preferences',
  },
]

// ADMIN NAVIGATION (Platform Administrator)
const adminMainNavItems = [
  {
    href: '/admin',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Platform overview',
  },
  {
    href: '/admin/users',
    label: 'User Management',
    icon: Users,
    description: 'Manage all users',
  },
  {
    href: '/admin/organizations',
    label: 'Organizations',
    icon: Globe,
    description: 'Manage companies',
  },
]

const adminContentItems = [
  {
    href: '/admin/courses',
    label: 'Course Management',
    icon: PlayCircle,
    description: 'Manage all courses',
  },
  {
    href: '/admin/workshops',
    label: 'Workshop Management',
    icon: Video,
    description: 'Manage all workshops',
  },
  {
    href: '/admin/assessments',
    label: 'Assessment Templates',
    icon: ClipboardList,
    description: 'Manage assessments',
  },
]

const adminSystemItems = [
  {
    href: '/admin/analytics',
    label: 'Platform Analytics',
    icon: BarChart3,
    description: 'System-wide metrics',
  },
  {
    href: '/admin/payments',
    label: 'Payments & Billing',
    icon: DollarSign,
    description: 'Revenue tracking',
  },
  {
    href: '/admin/database',
    label: 'Database',
    icon: Database,
    description: 'Data management',
  },
]

const adminAccountItems = [
  {
    href: '/admin/settings',
    label: 'Platform Settings',
    icon: Settings,
    description: 'System configuration',
  },
]

export function DashboardSidebar({ className, onLogout }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { savedCount } = useSocial()
  const { userData } = useChat()

  // Determine user role from userData OR pathname as fallback
  const isAdminFromData = userData?.isAdmin || userData?.role === 'admin' || userData?.userType === 'admin'
  const isInstructorFromData = userData?.isInstructor || userData?.role === 'instructor' || userData?.userType === 'instructor'

  // Fallback: detect role from pathname if userData is empty
  const isAdminFromPath = pathname?.startsWith('/admin')
  const isInstructorFromPath = pathname?.startsWith('/instructor')

  const isAdmin = isAdminFromData || isAdminFromPath
  const isInstructor = isInstructorFromData || isInstructorFromPath

  // Debug logging
  console.log('[DashboardSidebar] pathname:', pathname)
  console.log('[DashboardSidebar] isAdminFromData:', isAdminFromData)
  console.log('[DashboardSidebar] isAdminFromPath:', isAdminFromPath)
  console.log('[DashboardSidebar] isInstructorFromData:', isInstructorFromData)
  console.log('[DashboardSidebar] isInstructorFromPath:', isInstructorFromPath)
  console.log('[DashboardSidebar] FINAL isAdmin:', isAdmin)
  console.log('[DashboardSidebar] FINAL isInstructor:', isInstructor)

  // Get portal title and navigation based on role
  const getPortalConfig = () => {
    if (isAdmin) {
      return {
        title: 'Admin Portal',
        sections: [
          { title: 'Dashboard', items: adminMainNavItems },
          { title: 'Content', items: adminContentItems },
          { title: 'System', items: adminSystemItems },
          { title: 'Settings', items: adminAccountItems },
        ],
        showCart: false,
        showUpgrade: false,
      }
    } else if (isInstructor) {
      return {
        title: 'Instructor Portal',
        sections: [
          { title: 'Dashboard', items: instructorMainNavItems },
          { title: 'Workshops', items: instructorWorkshopItems },
          { title: 'Students', items: instructorStudentItems },
          { title: 'Account', items: instructorAccountItems },
        ],
        showCart: false,
        showUpgrade: false,
      }
    } else {
      return {
        title: 'Client Portal',
        sections: [
          { title: 'Dashboard', items: clientMainNavItems },
          { title: 'Learning', items: clientLearningItems },
          { title: 'Meetings', items: clientMeetingItems },
          { title: 'Talent', items: clientTalentItems },
          { title: 'Insights', items: clientInsightsItems },
          { title: 'Account', items: clientAccountItems },
        ],
        showCart: true,
        showUpgrade: true,
      }
    }
  }

  const portalConfig = getPortalConfig()

  // Update CSS variable for sidebar width
  useEffect(() => {
    const sidebarWidth = isCollapsed ? '80px' : '280px'
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth)

    return () => {
      document.documentElement.style.setProperty('--sidebar-width', '280px')
    }
  }, [isCollapsed])

  const NavSection = ({
    title,
    items,
  }: {
    title: string
    items: any[]
  }) => (
    <div className="mb-8">
      {!isCollapsed && (
        <div className="px-6 mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-diatype">
            {title}
          </h3>
        </div>
      )}
      <div className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'relative group rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl'
                    : 'hover:bg-white/5'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30" />
                )}

                <div className={cn(
                  "relative flex items-center gap-3 py-3",
                  isCollapsed ? "px-2 justify-center" : "px-3"
                )}>
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg transition-all',
                      isActive
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-medium font-diatype',
                            isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          )}
                        >
                          {item.label}
                        </span>
                        {'badge' in item && item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full font-diatype">
                            {item.badge}
                          </span>
                        )}
                        {/* Show saved count badge for Saved Items */}
                        {item.href === '/dashboard/saved' && savedCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-full font-diatype">
                            {savedCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 font-diatype">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {!isCollapsed && (
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 transition-all',
                        isActive
                          ? 'text-purple-400 opacity-100'
                          : 'text-gray-600 opacity-0 group-hover:opacity-100'
                      )}
                    />
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <motion.aside
        initial={{ x: isCollapsed ? -80 : -280 }}
        animate={{
          x: 0,
          width: isCollapsed ? 80 : 280
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'hidden lg:block fixed left-0 top-0 bottom-0 bg-gray-950/95 backdrop-blur-xl border-r border-white/10 z-40',
          className
        )}
      >
      <div className="flex flex-col h-full">
        {/* Logo & Toggle */}
        <div className={cn(
          "py-6 border-b border-white/10 flex items-center",
          isCollapsed ? "px-4 justify-center flex-col gap-3" : "px-6 justify-between"
        )}>
          <Link href={isAdmin ? "/admin" : isInstructor ? "/instructor" : "/dashboard"} className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
              title={isCollapsed ? "Human Glue" : undefined}
            >
              <Image
                src="/HG_icon.png"
                alt="Human Glue"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </motion.div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white font-gendy">Human Glue</h1>
                <p className="text-xs text-gray-500 font-diatype">{portalConfig.title}</p>
              </div>
            )}
          </Link>

          {/* Toggle Button */}
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all",
              isCollapsed && "w-full justify-center"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {/* Navigation - Role-based sections */}
        <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {portalConfig.sections.map((section) => (
            <NavSection key={section.title} title={section.title} items={section.items} />
          ))}
        </div>

        {/* Cart & Upgrade Section - Only for clients */}
        {(portalConfig.showCart || portalConfig.showUpgrade) && (
          <div className="border-t border-white/10">
            {/* Cart Button */}
            {portalConfig.showCart && (
              <div className={cn("p-4", isCollapsed && "px-2")}>
                <CartIcon
                  className={cn(
                    "w-full",
                    isCollapsed ? "justify-center" : ""
                  )}
                  variant={isCollapsed ? "compact" : "default"}
                />
              </div>
            )}

            {/* Upgrade Card */}
            {portalConfig.showUpgrade && !isCollapsed && (
              <div className="px-4 pb-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-xl border border-purple-500/30 p-4"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]" />

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-purple-400" />
                      <h3 className="text-sm font-semibold text-white font-gendy">Upgrade to Pro</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 font-diatype">
                      Unlock advanced analytics and unlimited workshops
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-purple-500/50 font-diatype"
                    >
                      Upgrade Now
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <div className={cn("p-4 border-t border-white/10", isCollapsed && "px-2")}>
          <motion.button
            whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 group-hover:bg-red-500/10 transition-all">
              <LogOut className="w-5 h-5 group-hover:text-red-400" />
            </div>
            {!isCollapsed && (
              <span className="text-sm font-medium font-diatype">Logout</span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </motion.aside>

      {/* Mobile Navigation - Shown on mobile only */}
      <MobileDashboardNav onLogout={onLogout} />
    </>
  )
}
