import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WorkshopDetail } from '@/components/workshops/WorkshopDetail'
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
    title: `${workshop.title} | Workshops`,
    description: workshop.description,
    keywords: [
      workshop.pillar,
      workshop.level,
      ...workshop.tags,
      'AI workshop',
      'professional development',
    ],
    openGraph: {
      title: workshop.title,
      description: workshop.description,
      url: `https://humanglue.netlify.app/workshops/${workshop.id}`,
      images: [
        {
          url: `https://humanglue.netlify.app/og-workshop-${workshop.pillar}.png`,
          width: 1200,
          height: 630,
          alt: workshop.title,
        },
      ],
    },
  }
}

export async function generateStaticParams() {
  return mockWorkshops.map((workshop) => ({
    id: workshop.id,
  }))
}

export default function WorkshopPage({ params }: Props) {
  const workshop = getWorkshopById(params.id)

  if (!workshop) {
    notFound()
  }

  return <WorkshopDetail workshop={workshop} />
}
