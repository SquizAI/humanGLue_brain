import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'gendy': ['Gendy', 'sans-serif'],
        'diatype': ['ABCDiatype', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'brand': {
          'cyan': '#61D8FE',
          'cyan': '#61D8FE', // Legacy - now points to cyan
          'dark': '#1D212A',
          'gray': '#4D4D4D',
          'light': '#F2F2F2',
          // Dynamic branding colors (set via CSS variables by BrandingInjector)
          'primary': 'var(--color-primary, #3b82f6)',
          'secondary': 'var(--color-secondary, #22d3ee)', // Changed from purple to cyan
          'accent': 'var(--color-accent, #10b981)',
        },
        'humanglue-blue': '#4285F4',
        'humanglue-green': '#34A853',
        'humanglue-yellow': '#FBBC05',
        'humanglue-red': '#EA4335',
        'humanglue-cyan': '#61D8FE', // Replaced purple
        'neon': {
          'blue': 'rgb(0, 149, 255)',
          'cyan': 'rgb(97, 216, 254)', // Now cyan
          'pink': 'rgb(255, 0, 128)',
          'cyan': 'rgb(97, 216, 254)',
          'green': 'rgb(0, 255, 128)',
        },
        'glass': {
          'white': 'rgba(255, 255, 255, 0.05)',
          'dark': 'rgba(0, 0, 0, 0.3)',
        },
        // White-label dynamic colors
        // Use these for components that should adapt to organization branding
        'org-primary': 'var(--color-primary, #3b82f6)',
        'org-secondary': 'var(--color-secondary, #8b5cf6)',
        'org-accent': 'var(--color-accent, #10b981)',
      },
      animation: {
        'typing': 'typing 1.5s steps(30, end) infinite',
        'blink': 'blink 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
export default config