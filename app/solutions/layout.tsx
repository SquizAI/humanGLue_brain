import { connection } from 'next/server'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function SolutionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Force dynamic rendering for solutions route
  await connection()

  return <>{children}</>
}
