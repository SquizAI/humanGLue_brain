'use client'

export default function TestImagesPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Test</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl mb-4">Direct img tags (no Next.js Image)</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2">OG Image:</p>
                <img src="/og-image.png" alt="OG Image" className="border border-gray-600" />
              </div>
              <div>
                <p className="mb-2">Twitter Image:</p>
                <img src="/twitter-image.png" alt="Twitter Image" className="border border-gray-600" />
              </div>
              <div>
                <p className="mb-2">Logo:</p>
                <img src="/logo.png" alt="Logo" className="border border-gray-600 max-w-xs" />
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl mb-4">Check if images load</h2>
            <p>If you can see the images above, the files are being served correctly.</p>
            <p>If not, there may be an issue with the build or deployment.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 