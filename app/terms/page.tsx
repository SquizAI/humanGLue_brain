import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Human Glue',
  description: 'Terms of service for Human Glue AI transformation platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using Human Glue AI services, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use of Services</h2>
            <p className="text-gray-300">
              Our AI transformation services are provided for business use. You agree to use our services in compliance with all applicable laws and regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Privacy and Data</h2>
            <p className="text-gray-300">
              Your use of our services is also governed by our Privacy Policy. We are committed to protecting your data and maintaining confidentiality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Contact</h2>
            <p className="text-gray-300">
              For questions about these terms, please contact us at legal@humanglue.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 