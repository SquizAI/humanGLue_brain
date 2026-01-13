import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RequestEngagementForm } from '@/components/talent/RequestEngagementForm'
import { mockTalent } from '@/lib/data/mock-talent'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const talent = mockTalent.find((t) => t.id === params.id)

  if (!talent) {
    return {
      title: 'Request Engagement',
    }
  }

  return {
    title: `Request Engagement - ${talent.name} | HMN`,
    description: `Submit an engagement request to work with ${talent.name}, ${talent.title}`,
  }
}

export default function RequestEngagementPage({ params }: Props) {
  const talent = mockTalent.find((t) => t.id === params.id)

  if (!talent) {
    notFound()
  }

  return <RequestEngagementForm talent={talent} />
}
