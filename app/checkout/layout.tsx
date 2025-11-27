import { connection } from 'next/server'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Force dynamic rendering for this route
  await connection()

  return <>{children}</>
}
