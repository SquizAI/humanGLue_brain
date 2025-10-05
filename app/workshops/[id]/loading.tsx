import { cn } from '@/utils/cn'
import { spacing } from '@/lib/design-system'

export default function WorkshopDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Skeleton */}
      <section className={cn('bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900', spacing.section.y)}>
        <div className={spacing.container.wide}>
          <div className="h-6 w-32 bg-gray-800 rounded mb-8 animate-pulse"></div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2">
              <div className="flex gap-3 mb-6">
                <div className="h-8 w-32 bg-gray-800 rounded-full animate-pulse"></div>
                <div className="h-8 w-32 bg-gray-800 rounded-full animate-pulse"></div>
                <div className="h-8 w-32 bg-gray-800 rounded-full animate-pulse"></div>
              </div>

              <div className="h-16 w-full bg-gray-800 rounded-2xl mb-6 animate-pulse"></div>
              <div className="h-32 w-full bg-gray-800 rounded-2xl mb-8 animate-pulse"></div>

              <div className="flex gap-3 mb-8">
                <div className="h-10 w-24 bg-gray-800 rounded-xl animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-800 rounded-xl animate-pulse"></div>
              </div>

              <div className="h-20 w-full bg-gray-800 rounded-2xl mb-8 animate-pulse"></div>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="h-24 bg-gray-800 rounded-xl animate-pulse"></div>
                <div className="h-24 bg-gray-800 rounded-xl animate-pulse"></div>
                <div className="h-24 bg-gray-800 rounded-xl animate-pulse"></div>
              </div>

              <div className="h-64 w-full bg-gray-800 rounded-2xl animate-pulse"></div>
            </div>

            {/* Right Column - Sticky Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl bg-gray-800 border border-gray-700 p-8 animate-pulse">
                <div className="h-12 w-32 bg-gray-700 rounded mb-6"></div>
                <div className="h-16 w-full bg-gray-700 rounded-xl mb-6"></div>
                <div className="h-48 w-full bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
