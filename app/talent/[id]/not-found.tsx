import Link from 'next/link'
import { UserX } from 'lucide-react'

export default function TalentNotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-6">
          <UserX className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Expert Not Found
        </h2>
        <p className="text-gray-400 mb-8">
          We couldn't find the expert you're looking for. They may have been removed or the link is incorrect.
        </p>
        <Link href="/talent">
          <button className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
            Browse all experts
          </button>
        </Link>
      </div>
    </div>
  )
}
