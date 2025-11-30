/**
 * HumanGlue Design System
 * Manifesto-driven color palette, typography, and design tokens
 */

export const colors = {
  // Core Brand
  brand: {
    primary: '#2563EB',      // Trust blue
    accent: '#61D8FE',       // Brand cyan (was purple)
    success: '#10B981',      // Growth green
  },

  // Three Pillars
  pillars: {
    adaptability: {
      main: '#3B82F6',       // Engine blue
      light: '#60A5FA',
      dark: '#1D4ED8',
      gradient: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/50',
    },
    coaching: {
      main: '#F59E0B',       // Coaching gold/amber
      light: '#FBBF24',
      dark: '#D97706',
      gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/50',
    },
    marketplace: {
      main: '#22D3EE',       // Talent cyan (was purple)
      light: '#67E8F9',
      dark: '#06B6D4',
      gradient: 'from-cyan-500 to-cyan-600',
      glow: 'shadow-cyan-500/50',
    },
  },

  // Transformation States
  states: {
    fear: '#EF4444',         // Fear/risk red
    confidence: '#10B981',   // Confidence green
    embedding: '#F59E0B',    // Behavior change orange
    neutral: '#64748B',      // Neutral gray
  },

  // UI Grays
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Backgrounds
  bg: {
    primary: '#0F172A',      // Dark navy
    secondary: '#1E293B',
    card: '#1E293B',
    elevated: '#334155',
  },
}

export const typography = {
  // Manifesto Headlines - Bold, commanding
  manifesto: {
    hero: 'text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight',
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
    h3: 'text-2xl md:text-3xl lg:text-4xl font-bold',
  },

  // Section Headlines
  heading: {
    h1: 'text-4xl md:text-5xl font-bold',
    h2: 'text-3xl md:text-4xl font-bold',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    h5: 'text-lg md:text-xl font-semibold',
  },

  // Body Text
  body: {
    xl: 'text-xl leading-relaxed',
    lg: 'text-lg leading-relaxed',
    base: 'text-base leading-relaxed',
    sm: 'text-sm leading-normal',
  },

  // Special
  gradient: {
    blue: 'bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent',
    cyan: 'bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent',
    amber: 'bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent',
    brand: 'bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent',
  },
}

export const spacing = {
  section: {
    y: 'py-16 md:py-24 lg:py-32',
    ySmall: 'py-12 md:py-16 lg:py-20',
  },
  container: {
    base: 'container mx-auto px-6 md:px-8 lg:px-12',
    narrow: 'container max-w-4xl mx-auto px-6',
    wide: 'container max-w-7xl mx-auto px-6 md:px-8',
  },
}

export const effects = {
  // Shadows
  shadow: {
    sm: 'shadow-sm',
    base: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    glow: 'shadow-2xl shadow-blue-500/20',
  },

  // Gradients
  gradient: {
    primary: 'bg-gradient-to-br from-blue-600 to-cyan-600',
    secondary: 'bg-gradient-to-br from-cyan-600 to-teal-600',
    adaptability: 'bg-gradient-to-br from-blue-500 to-blue-600',
    coaching: 'bg-gradient-to-br from-amber-500 to-orange-600',
    marketplace: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    dark: 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900',
  },

  // Borders
  border: {
    base: 'border border-gray-700',
    light: 'border border-gray-600',
    gradient: 'border border-transparent bg-gradient-to-r from-blue-500 to-cyan-500',
  },

  // Backdrop
  backdrop: {
    blur: 'backdrop-blur-xl bg-white/5',
    blurDark: 'backdrop-blur-xl bg-black/20',
  },
}

export const animations = {
  // Hover states
  hover: {
    lift: 'transition-transform duration-300 hover:-translate-y-1',
    scale: 'transition-transform duration-300 hover:scale-105',
    glow: 'transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-500/30',
  },

  // Transitions
  transition: {
    fast: 'transition-all duration-150',
    base: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },
}

export const components = {
  // Card Variants
  card: {
    base: `${effects.backdrop.blur} ${effects.border.base} rounded-2xl p-6`,
    elevated: `${effects.backdrop.blur} ${effects.border.base} rounded-2xl p-8 ${effects.shadow.xl}`,
    pillar: (pillar: 'adaptability' | 'coaching' | 'marketplace') => {
      const pillarColors = colors.pillars[pillar]
      return `${effects.backdrop.blur} border-2 border-${pillar === 'adaptability' ? 'blue' : pillar === 'coaching' ? 'amber' : 'cyan'}-500/30 rounded-2xl p-8 hover:border-${pillar === 'adaptability' ? 'blue' : pillar === 'coaching' ? 'amber' : 'cyan'}-500/60 transition-all duration-300`
    },
  },

  // Button Variants
  button: {
    primary: `px-8 py-4 rounded-full font-semibold ${effects.gradient.primary} text-white ${animations.hover.scale} ${animations.transition.base}`,
    secondary: `px-8 py-4 rounded-full font-semibold border-2 border-white/20 ${effects.backdrop.blur} text-white hover:border-white/40 ${animations.transition.base}`,
    ghost: `px-6 py-3 rounded-lg font-medium text-white hover:bg-white/10 ${animations.transition.base}`,
    pillar: (pillar: 'adaptability' | 'coaching' | 'marketplace') => {
      const gradients = {
        adaptability: effects.gradient.adaptability,
        coaching: effects.gradient.coaching,
        marketplace: effects.gradient.marketplace,
      }
      return `px-8 py-4 rounded-full font-semibold ${gradients[pillar]} text-white ${animations.hover.scale} ${animations.transition.base}`
    },
  },

  // Badge Variants
  badge: {
    base: 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
    primary: `inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 border border-blue-500/20 text-blue-300`,
    success: `inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-500/10 border border-green-500/20 text-green-300`,
    warning: `inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300`,
  },
}

// Helper function to get pillar theme
export const getPillarTheme = (pillar: 'adaptability' | 'coaching' | 'marketplace') => {
  return {
    colors: colors.pillars[pillar],
    gradient: effects.gradient[pillar],
    card: components.card.pillar(pillar),
    button: components.button.pillar(pillar),
  }
}

// Metric display utilities
export const metrics = {
  // Fear to Confidence colors
  getConfidenceColor: (score: number) => {
    if (score < 30) return colors.states.fear
    if (score < 60) return colors.states.embedding
    return colors.states.confidence
  },

  // Adaptability score colors
  getAdaptabilityColor: (score: number) => {
    if (score < 40) return '#EF4444' // Low - Red
    if (score < 70) return '#F59E0B' // Medium - Amber
    return '#10B981' // High - Green
  },
}
