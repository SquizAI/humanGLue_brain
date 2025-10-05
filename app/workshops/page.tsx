import { Metadata } from 'next'
import { WorkshopsCatalog } from '@/components/workshops/WorkshopsCatalog'

export const metadata: Metadata = {
  title: 'Workshops - Transform Your Skills for the AI Era',
  description:
    'Explore our comprehensive catalog of AI transformation workshops. Build adaptability, enhance coaching skills, and navigate the talent marketplace with expert-led training.',
  keywords: [
    'AI workshops',
    'transformation training',
    'leadership development',
    'coaching certification',
    'career development',
    'AI skills',
    'professional development',
  ],
  openGraph: {
    title: 'AI Transformation Workshops | Human Glue',
    description:
      'Master the skills needed to thrive in the AI era. Workshops on adaptability, coaching, and marketplace success.',
    url: 'https://humanglue.netlify.app/workshops',
    images: [
      {
        url: 'https://humanglue.netlify.app/og-workshops.png',
        width: 1200,
        height: 630,
        alt: 'Human Glue Workshops',
      },
    ],
  },
}

export default function WorkshopsPage() {
  return <WorkshopsCatalog />
}
