import './globals.css'
import type { Metadata } from 'next'
import { Inter, Anuphan } from 'next/font/google'
import { Providers } from '../components/Providers'

const inter = Inter({ subsets: ['latin'] })
const anuphan = Anuphan({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-anuphan',
})

// Force dynamic rendering for all pages to support React Context
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export const metadata: Metadata = {
  title: {
    default: 'HMN - AI-Powered Organizational Transformation',
    template: '%s | HMN'
  },
  description: 'Transform your organization with HMN\'s AI-powered assessment tools, strategic workshops, and comprehensive transformation toolbox. Strengthen the human connections that drive performance.',
  keywords: [
    'organizational transformation',
    'AI assessment',
    'workplace culture',
    'employee engagement',
    'leadership development',
    'change management',
    'organizational development',
    'HR technology',
    'workplace analytics',
    'team performance'
  ],
  authors: [{ name: 'HMN' }],
  creator: 'HMN',
  publisher: 'HMN',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://behmn.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'HMN - AI-Powered Organizational Transformation',
    description: 'Transform your organization with AI-powered insights. Strengthen the human connections that drive performance, innovation, and resilience.',
    url: 'https://behmn.com',
    siteName: 'HMN',
    images: [
      {
        url: 'https://behmn.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HMN - Transforming Organizations with AI',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HMN - AI-Powered Organizational Transformation',
    description: 'Transform your organization with AI-powered insights. Strengthen human connections that drive performance.',
    images: ['https://behmn.com/twitter-image.png'],
    creator: '@behmn',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/HG_icon.png', type: 'image/png' },
      { url: '/HG_icon.png', sizes: '16x16', type: 'image/png' },
      { url: '/HG_icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/HG_icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/HG_icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/HG_icon.png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/HG_icon.png',
      },
    ],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'HMN',
              url: 'https://behmn.com',
              logo: 'https://behmn.com/hmn_logo.png',
              description: 'AI-powered organizational transformation platform',
              sameAs: [
                'https://twitter.com/behmn',
                'https://linkedin.com/company/behmn',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-XXX-XXX-XXXX',
                contactType: 'customer service',
                areaServed: 'US',
                availableLanguage: ['en'],
              },
            }),
          }}
        />
        {/* Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'HMN AI Assistant',
              url: 'https://behmn.com',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '127',
              },
            }),
          }}
        />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* Theme color */}
        <meta name="theme-color" content="#1e293b" />
        {/* Viewport - Optimized for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        {/* iOS specific */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        {/* PWA meta tags */}
        <meta name="application-name" content="HMN" />
        <meta name="apple-mobile-web-app-title" content="HMN" />
      </head>
      <body className={`${inter.className} ${anuphan.variable} bg-gray-50 dark:bg-black text-gray-900 dark:text-white antialiased transition-colors duration-300`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}