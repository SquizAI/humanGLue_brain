import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Human Glue',
  description: 'Terms of service for Human Glue AI transformation platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-gray-400 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to HumanGlue. By accessing or using our AI transformation platform, services, and related offerings (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              These Terms apply to all visitors, users, and others who access or use the Services, including but not limited to individual users, team administrators, enterprise clients, instructors, and partners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Services</h2>
            <p className="text-gray-300 leading-relaxed">
              HumanGlue provides an AI-powered platform for organizational transformation, including:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>AI Maturity Assessments and personalized readiness reports</li>
              <li>Educational courses and learning paths</li>
              <li>AI-powered advisory and consultation services</li>
              <li>Team analytics and progress tracking</li>
              <li>Workshops and training programs</li>
              <li>Strategic planning tools and resources</li>
              <li>Community forums and support</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We reserve the right to modify, suspend, or discontinue any part of the Services at any time, with or without notice, for any reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. User Accounts and Registration</h2>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">3.1 Account Creation</h3>
            <p className="text-gray-300 leading-relaxed">
              To access certain features of our Services, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">3.2 Account Eligibility</h3>
            <p className="text-gray-300 leading-relaxed">
              You must be at least 18 years old to create an account and use our Services. By creating an account, you represent that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">3.3 Business Accounts</h3>
            <p className="text-gray-300 leading-relaxed">
              If you create an account on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms, and "you" and "your" will refer to both you as an individual and the organization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Subscription Plans and Billing</h2>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">4.1 Subscription Tiers</h3>
            <p className="text-gray-300 leading-relaxed">
              We offer multiple subscription tiers (Individual, Team, Enterprise) with varying features and pricing. Current pricing and features are available on our Pricing page.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">4.2 Payment Terms</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>All fees are non-refundable except as required by law or as explicitly stated in these Terms</li>
              <li>You authorize us to charge your payment method for all fees incurred</li>
              <li>Prices may change upon 30 days' notice to you</li>
              <li>Failed payments may result in service suspension or termination</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">4.3 Free Trials</h3>
            <p className="text-gray-300 leading-relaxed">
              We may offer free trial periods. At the end of the trial, you will be automatically charged unless you cancel before the trial ends. We reserve the right to modify or cancel free trial offers at any time.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">4.4 Cancellation and Refunds</h3>
            <p className="text-gray-300 leading-relaxed">
              You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. We offer a 30-day money-back guarantee for new subscriptions. Refund requests must be submitted within 30 days of initial purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. User Conduct and Acceptable Use</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree not to use the Services to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Share false, misleading, or deceptive information</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the Services or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Services</li>
              <li>Upload viruses, malware, or other malicious code</li>
              <li>Scrape, crawl, or index the Services through automated means</li>
              <li>Resell or redistribute access to the Services without authorization</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Services</li>
              <li>Use the Services for competitive analysis or to build competing products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Intellectual Property Rights</h2>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">6.1 Our Content</h3>
            <p className="text-gray-300 leading-relaxed">
              All content, features, and functionality of the Services, including but not limited to text, graphics, logos, icons, images, audio, video, software, and data compilations, are the exclusive property of HumanGlue or its licensors and are protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">6.2 Your Content</h3>
            <p className="text-gray-300 leading-relaxed">
              You retain all rights to content you submit, upload, or provide through the Services ("User Content"). By providing User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content solely to provide and improve our Services.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">6.3 Feedback</h3>
            <p className="text-gray-300 leading-relaxed">
              Any feedback, suggestions, or ideas you provide about our Services become our property, and we may use them without obligation to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Privacy and Data Protection</h2>
            <p className="text-gray-300 leading-relaxed">
              Your use of the Services is subject to our Privacy Policy, which describes how we collect, use, and protect your personal information. By using our Services, you consent to the collection and use of information as described in our Privacy Policy.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              We implement industry-standard security measures to protect your data, including encryption, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Third-Party Services and Links</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Services may contain links to third-party websites or services that are not owned or controlled by HumanGlue. We are not responsible for the content, privacy policies, or practices of third-party sites. We encourage you to review the terms and privacy policies of any third-party services you access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Disclaimers and Limitations of Liability</h2>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">9.1 Service Provided "As Is"</h3>
            <p className="text-gray-300 leading-relaxed">
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">9.2 No Professional Advice</h3>
            <p className="text-gray-300 leading-relaxed">
              The Services, including AI-powered recommendations and assessments, are for informational and educational purposes only and do not constitute professional, legal, financial, or business advice. You should consult appropriate professionals before making business decisions.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">9.3 Limitation of Liability</h3>
            <p className="text-gray-300 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, HUMANGLUE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Indemnification</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree to indemnify, defend, and hold harmless HumanGlue and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from your use of the Services, your violation of these Terms, or your violation of any rights of another party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We may suspend or terminate your access to the Services at any time, with or without cause or notice, including if you violate these Terms. Upon termination:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Your right to use the Services immediately ceases</li>
              <li>You must stop all use of our Services and delete any downloaded content</li>
              <li>We may delete your account and User Content</li>
              <li>Provisions that should survive termination will continue to apply</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              You may export your data before termination. After account deletion, your data will be retained for 90 days before permanent deletion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">12. Dispute Resolution and Arbitration</h2>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">12.1 Governing Law</h3>
            <p className="text-gray-300 leading-relaxed">
              These Terms are governed by the laws of the State of Delaware, United States, without regard to its conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">12.2 Arbitration Agreement</h3>
            <p className="text-gray-300 leading-relaxed">
              Any dispute arising from these Terms or the Services shall be resolved through binding arbitration in accordance with the American Arbitration Association's rules, except that either party may seek injunctive relief in court.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">12.3 Class Action Waiver</h3>
            <p className="text-gray-300 leading-relaxed">
              You agree to bring claims only in your individual capacity and not as part of any class or representative action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">13. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We may modify these Terms at any time. We will notify you of material changes by email or through the Services. Your continued use of the Services after changes become effective constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">14. General Provisions</h2>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">14.1 Entire Agreement</h3>
            <p className="text-gray-300 leading-relaxed">
              These Terms constitute the entire agreement between you and HumanGlue regarding the Services and supersede all prior agreements.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">14.2 Severability</h3>
            <p className="text-gray-300 leading-relaxed">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">14.3 No Waiver</h3>
            <p className="text-gray-300 leading-relaxed">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">14.4 Assignment</h3>
            <p className="text-gray-300 leading-relaxed">
              You may not assign or transfer these Terms without our prior written consent. We may assign our rights and obligations without restriction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">15. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              For questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-6 bg-black/50 rounded-lg border border-gray-800">
              <p className="text-gray-300">HumanGlue Inc.</p>
              <p className="text-gray-300">Email: legal@humanglue.ai</p>
              <p className="text-gray-300">Support: support@humanglue.ai</p>
              <p className="text-gray-300 mt-2">Website: <a href="https://humanglue.ai" className="text-cyan-400 hover:text-cyan-300 transition-colors">https://humanglue.ai</a></p>
            </div>
          </section>

          <section className="border-t border-gray-800 pt-8 mt-8">
            <p className="text-sm text-gray-500 italic">
              By using HumanGlue's Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
