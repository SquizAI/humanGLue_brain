import { cn } from '@/utils/cn'
import { spacing } from '@/lib/design-system'

export default function WorkshopsLoading() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Skeleton */}
      <section className={cn('bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900', spacing.section.y)}>
        <div className={spacing.container.wide}>
          <div className="text-center max-w-4xl mx-auto">
            <div className="h-8 w-64 bg-gray-800 rounded-full mx-auto mb-6 animate-pulse"></div>
            <div className="h-16 w-full bg-gray-800 rounded-2xl mb-6 animate-pulse"></div>
            <div className="h-24 w-full bg-gray-800 rounded-2xl mb-8 animate-pulse"></div>
            <div className="flex justify-center gap-4">
              <div className="h-6 w-32 bg-gray-800 rounded-full animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-800 rounded-full animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-800 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 py-6">
        <div className={spacing.container.wide}>
          <div className="flex gap-4 items-center justify-between">
            <div className="h-12 w-96 bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-12 w-32 bg-gray-800 rounded-xl animate-pulse"></div>
              <div className="h-12 w-24 bg-gray-800 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className={spacing.section.y}>
        <div className={spacing.container.wide}>
          <div className="h-6 w-48 bg-gray-800 rounded mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-gray-800 border border-gray-700 p-8 animate-pulse"
              >
                <div className="h-6 w-32 bg-gray-700 rounded-full mb-4"></div>
                <div className="h-8 w-full bg-gray-700 rounded-lg mb-3"></div>
                <div className="h-20 w-full bg-gray-700 rounded-lg mb-6"></div>
                <div className="h-16 w-full bg-gray-700 rounded-lg mb-6"></div>
                <div className="h-32 w-full bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
