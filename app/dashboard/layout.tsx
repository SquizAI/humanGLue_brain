import { connection } from 'next/server'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Force dynamic rendering for dashboard routes
  await connection()

  return <>{children}</>
}
