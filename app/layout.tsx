import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ChatProvider } from '../lib/contexts/ChatContext'
import { PWARegister } from '../components/PWARegister'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Human Glue - AI-Powered Organizational Transformation',
    template: '%s | Human Glue'
  },
  description: 'Transform your organization with Human Glue\'s AI-powered assessment tools, strategic workshops, and comprehensive transformation toolbox. Strengthen the human connections that drive performance.',
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
  authors: [{ name: 'Human Glue' }],
  creator: 'Human Glue',
  publisher: 'Human Glue',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://humanglue.netlify.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Human Glue - AI-Powered Organizational Transformation',
    description: 'Transform your organization with AI-powered insights. Strengthen the human connections that drive performance, innovation, and resilience.',
    url: 'https://humanglue.netlify.app',
    siteName: 'Human Glue',
    images: [
      {
        url: 'https://humanglue.netlify.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Human Glue - Transforming Organizations with AI',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Human Glue - AI-Powered Organizational Transformation',
    description: 'Transform your organization with AI-powered insights. Strengthen human connections that drive performance.',
    images: ['https://humanglue.netlify.app/twitter-image.png'],
    creator: '@humanglue',
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
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
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
    <html lang="en" className="dark">
      <head>
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Human Glue',
              url: 'https://humanglue.netlify.app',
              logo: 'https://humanglue.netlify.app/logo.png',
              description: 'AI-powered organizational transformation platform',
              sameAs: [
                'https://twitter.com/humanglue',
                'https://linkedin.com/company/humanglue',
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
              name: 'Human Glue AI Assistant',
              url: 'https://humanglue.netlify.app',
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
        {/* iOS specific - Updated to modern standards */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        {/* PWA meta tags */}
        <meta name="application-name" content="Human Glue" />
        <meta name="apple-mobile-web-app-title" content="Human Glue" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white antialiased`}>
        <ChatProvider>
          {children}
          <PWARegister />
        </ChatProvider>
      </body>
    </html>
  )
}