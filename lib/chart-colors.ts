/**
 * Chart Colors Utility
 *
 * WHITE-LABEL READY: All chart colors are defined as CSS variables in globals.css
 * and can be customized per-organization through the branding system.
 *
 * This utility provides easy access to chart colors for Recharts and other
 * charting libraries that require direct color values.
 *
 * Usage:
 * ```tsx
 * import { chartColors, getChartColor, chartTooltipStyle } from '@/lib/chart-colors'
 *
 * // In chart data:
 * const data = [
 *   { name: 'Series A', value: 100, color: chartColors.primary },
 *   { name: 'Series B', value: 80, color: chartColors.secondary },
 * ]
 *
 * // For Recharts components:
 * <Line stroke={chartColors.primary} />
 * <CartesianGrid stroke={chartColors.grid} />
 * <Tooltip contentStyle={chartTooltipStyle} />
 * ```
 */

// CSS variable getters for client-side use
// These functions read the actual CSS variable values at runtime
export function getCSSVariable(name: string): string {
  if (typeof window === 'undefined') {
    // Server-side fallback - return dark mode defaults
    return getServerFallback(name)
  }
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function getServerFallback(name: string): string {
  const fallbacks: Record<string, string> = {
    '--hg-chart-primary': '#8B5CF6',
    '--hg-chart-secondary': '#3B82F6',
    '--hg-chart-tertiary': '#10B981',
    '--hg-chart-quaternary': '#F59E0B',
    '--hg-chart-quinary': '#EF4444',
    '--hg-chart-cyan': '#06B6D4',
    '--hg-chart-grid': '#374151',
    '--hg-chart-axis': '#9CA3AF',
    '--hg-chart-tooltip-bg': '#1F2937',
    '--hg-chart-tooltip-border': '#374151',
    '--hg-chart-tooltip-text': '#F3F4F6',
  }
  return fallbacks[name] || '#888888'
}

/**
 * Static chart color values for server-side rendering and initial render
 * These use the dark mode defaults which work well on both light and dark backgrounds
 * For dynamic theme-aware colors, use the hook useChartColors() instead
 */
export const chartColors = {
  // Data series colors
  primary: '#8B5CF6',     // Purple - main data series
  secondary: '#3B82F6',   // Blue - secondary series
  tertiary: '#10B981',    // Green - positive/growth
  quaternary: '#F59E0B',  // Amber - warnings/attention
  quinary: '#EF4444',     // Red - negative/alerts
  cyan: '#06B6D4',        // Cyan - accent/brand

  // UI element colors (dark mode optimized for common dashboard use)
  grid: '#374151',
  axis: '#9CA3AF',
  tooltipBg: '#1F2937',
  tooltipBorder: '#374151',
  tooltipText: '#F3F4F6',
} as const

/**
 * Get chart colors dynamically from CSS variables
 * Use this in useEffect or event handlers where you need theme-aware colors
 */
export function getChartColors() {
  return {
    primary: getCSSVariable('--hg-chart-primary') || chartColors.primary,
    secondary: getCSSVariable('--hg-chart-secondary') || chartColors.secondary,
    tertiary: getCSSVariable('--hg-chart-tertiary') || chartColors.tertiary,
    quaternary: getCSSVariable('--hg-chart-quaternary') || chartColors.quaternary,
    quinary: getCSSVariable('--hg-chart-quinary') || chartColors.quinary,
    cyan: getCSSVariable('--hg-chart-cyan') || chartColors.cyan,
    grid: getCSSVariable('--hg-chart-grid') || chartColors.grid,
    axis: getCSSVariable('--hg-chart-axis') || chartColors.axis,
    tooltipBg: getCSSVariable('--hg-chart-tooltip-bg') || chartColors.tooltipBg,
    tooltipBorder: getCSSVariable('--hg-chart-tooltip-border') || chartColors.tooltipBorder,
    tooltipText: getCSSVariable('--hg-chart-tooltip-text') || chartColors.tooltipText,
  }
}

/**
 * Helper function to get a specific chart color by key
 */
export function getChartColor(key: keyof typeof chartColors): string {
  return chartColors[key]
}

/**
 * Color palette as an array for pie charts and other multi-series charts
 */
export const chartColorPalette = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
  chartColors.quinary,
  chartColors.cyan,
] as const

/**
 * Semantic color mapping for specific data types
 */
export const chartSemanticColors = {
  // Skill levels
  beginner: chartColors.quinary,      // Red
  intermediate: chartColors.quaternary, // Amber
  advanced: chartColors.tertiary,      // Green
  expert: chartColors.primary,         // Purple

  // Status indicators
  positive: chartColors.tertiary,      // Green
  negative: chartColors.quinary,       // Red
  warning: chartColors.quaternary,     // Amber
  neutral: chartColors.secondary,      // Blue
  highlight: chartColors.primary,      // Purple

  // Revenue streams
  courses: chartColors.primary,        // Purple
  workshops: chartColors.secondary,    // Blue
  consultations: chartColors.quaternary, // Amber

  // User metrics
  total: chartColors.secondary,        // Blue
  active: chartColors.tertiary,        // Green
  inactive: chartColors.axis,          // Gray

  // Completion status
  completed: chartColors.tertiary,     // Green
  inProgress: chartColors.quaternary,  // Amber
  notStarted: chartColors.axis,        // Gray
} as const

/**
 * Tooltip style object for Recharts
 * Apply this to Tooltip contentStyle prop
 */
export const chartTooltipStyle = {
  backgroundColor: chartColors.tooltipBg,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: '8px',
  padding: '8px 12px',
} as const

/**
 * Tooltip label style for Recharts
 */
export const chartTooltipLabelStyle = {
  color: chartColors.tooltipText,
  fontWeight: 600,
} as const

/**
 * Gradient definitions for area/line charts
 * Use these IDs in your chart defs section
 */
export const chartGradients = {
  primary: {
    id: 'colorPrimary',
    stops: [
      { offset: '5%', color: chartColors.primary, opacity: 0.3 },
      { offset: '95%', color: chartColors.primary, opacity: 0 },
    ],
  },
  secondary: {
    id: 'colorSecondary',
    stops: [
      { offset: '5%', color: chartColors.secondary, opacity: 0.3 },
      { offset: '95%', color: chartColors.secondary, opacity: 0 },
    ],
  },
  tertiary: {
    id: 'colorTertiary',
    stops: [
      { offset: '5%', color: chartColors.tertiary, opacity: 0.3 },
      { offset: '95%', color: chartColors.tertiary, opacity: 0 },
    ],
  },
} as const
