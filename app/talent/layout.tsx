import { connection } from 'next/server'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function TalentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Force dynamic rendering for talent routes
  await connection()

  return <>{children}</>
}
