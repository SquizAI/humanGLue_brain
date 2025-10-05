import { Metadata } from 'next'
import { WhyWeExist } from './components/WhyWeExist'

export const metadata: Metadata = {
  title: 'Why We Exist - The Biggest Risk Isn\'t AI, It\'s People Left Behind',
  description: 'Work is evolving faster than humans can keep up. Change management is broken. Employees are unsure if they fit in an AI-driven future. HumanGlue solves the real problem: helping people adapt, or companies fall behind.',
  keywords: [
    'change management crisis',
    'AI transformation challenges',
    'workforce adaptation',
    'digital transformation failure',
    'employee uncertainty',
    'talent retention',
    'organizational change',
    'future of work problem',
    'transformation that sticks',
    'people-first change',
  ],
  openGraph: {
    title: 'Why We Exist | The Biggest Risk Isn\'t AI, It\'s People Left Behind',
    description: 'Work is evolving faster than humans can keep up. Discover why traditional change management is broken and how HumanGlue creates lasting transformation.',
    url: 'https://humanglue.netlify.app/why-we-exist',
    images: [
      {
        url: 'https://humanglue.netlify.app/og-why-we-exist.png',
        width: 1200,
        height: 630,
        alt: 'Why We Exist - HumanGlue',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Biggest Risk Isn\'t AI, It\'s People Left Behind',
    description: 'Work is evolving faster than humans can keep up. Traditional change management is broken. See why HumanGlue exists.',
  },
}

export default function WhyWeExistPage() {
  return <WhyWeExist />
}
