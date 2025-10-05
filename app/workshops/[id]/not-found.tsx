import { SearchX, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/utils/cn'
import { typography, spacing } from '@/lib/design-system'

export default function WorkshopNotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className={cn(spacing.container.narrow, 'text-center')}>
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-10 h-10 text-gray-500" />
        </div>

        {/* Message */}
        <h1 className={cn(typography.heading.h2, 'text-white mb-4')}>
          Workshop Not Found
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          The workshop you're looking for doesn't exist or has been removed.
        </p>

        {/* Actions */}
        <Link
          href="/workshops"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workshops
        </Link>
      </div>
    </div>
  )
}
