import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Human Glue',
  description: 'Privacy policy for Human Glue AI transformation platform',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-gray-300">
              We collect information you provide directly to us, including name, email, company information, and professional details to deliver personalized AI transformation insights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300">
              We use your information to provide AI readiness assessments, generate personalized recommendations, and communicate with you about our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
            <p className="text-gray-300">
              We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or misuse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Contact Us</h2>
            <p className="text-gray-300">
              For privacy-related questions, please contact us at privacy@humanglue.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 