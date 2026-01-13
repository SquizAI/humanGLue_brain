import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Approach - Find, Validate, Scale Your AI Transformation',
  description:
    'We measure the gaps that kill transformations, then close them. Reality Gap Assessment™, Adaptability Index™, and the GLUE Transformation System™ for sustainable AI adoption.',
  keywords: [
    'AI transformation methodology',
    'Reality Gap Assessment',
    'Adaptability Index',
    'GLUE Transformation System',
    'organizational transformation',
    'AI readiness assessment',
    'change management',
    'digital transformation',
  ],
  openGraph: {
    title: 'Our Approach | HMN',
    description:
      'Transformation without truth is just high-priced theater. Discover our proven methodology for closing the gap between AI strategy and organizational reality.',
    url: 'https://humanglue.netlify.app/approach',
    images: [
      {
        url: 'https://humanglue.netlify.app/og-approach.png',
        width: 1200,
        height: 630,
        alt: 'HMN Approach',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ApproachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
