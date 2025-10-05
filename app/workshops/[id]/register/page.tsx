import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WorkshopRegistration } from '@/components/workshops/WorkshopRegistration'
import { getWorkshopById, mockWorkshops } from '@/lib/data/mock-workshops'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const workshop = getWorkshopById(params.id)

  if (!workshop) {
    return {
      title: 'Workshop Not Found',
    }
  }

  return {
    title: `Register for ${workshop.title}`,
    description: `Complete your registration for ${workshop.title}. Secure your spot in this transformative workshop.`,
    robots: {
      index: false, // Don't index checkout pages
      follow: false,
    },
  }
}

export async function generateStaticParams() {
  return mockWorkshops.map((workshop) => ({
    id: workshop.id,
  }))
}

export default function RegisterPage({ params }: Props) {
  const workshop = getWorkshopById(params.id)

  if (!workshop) {
    notFound()
  }

  return <WorkshopRegistration workshop={workshop} />
}
