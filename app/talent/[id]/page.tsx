import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TalentProfileDetail } from '@/components/talent/TalentProfileDetail'
import { mockTalent } from '@/lib/data/mock-talent'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const talent = mockTalent.find((t) => t.id === params.id)

  if (!talent) {
    return {
      title: 'Expert Not Found',
    }
  }

  return {
    title: `${talent.name} - ${talent.title} | Human Glue Talent`,
    description: talent.tagline,
    keywords: [
      talent.name,
      talent.title,
      ...talent.expertise,
      ...talent.focusAreas.industries,
      'transformation expert',
      'AI consultant',
    ],
    openGraph: {
      title: `${talent.name} - ${talent.title}`,
      description: talent.tagline,
      url: `https://humanglue.netlify.app/talent/${talent.id}`,
    },
  }
}

export default function TalentDetailPage({ params }: Props) {
  const talent = mockTalent.find((t) => t.id === params.id)

  if (!talent) {
    notFound()
  }

  return <TalentProfileDetail talent={talent} />
}

// Generate static params for all talent profiles
export function generateStaticParams() {
  return mockTalent.map((talent) => ({
    id: talent.id,
  }))
}
