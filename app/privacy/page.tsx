import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Human Glue',
  description: 'Privacy policy for Human Glue AI transformation platform',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-gray-400 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              At HumanGlue, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI transformation platform and services. Please read this privacy policy carefully. By using our Services, you agree to the collection and use of information in accordance with this policy.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              If you do not agree with the terms of this privacy policy, please do not access or use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3 text-gray-200">2.1 Information You Provide to Us</h3>
            <p className="text-gray-300 leading-relaxed">
              We collect information that you voluntarily provide when you:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li><strong>Register for an account:</strong> Name, email address, password, company name, job title, phone number</li>
              <li><strong>Complete assessments:</strong> Company information, industry, size, location, revenue, challenges, goals, and AI readiness data</li>
              <li><strong>Enroll in courses:</strong> Learning preferences, progress data, completion status</li>
              <li><strong>Participate in workshops:</strong> Attendance records, feedback, participation data</li>
              <li><strong>Use our chat features:</strong> Conversation history, questions, and responses</li>
              <li><strong>Contact support:</strong> Support tickets, correspondence, feedback</li>
              <li><strong>Make payments:</strong> Billing information, payment method details (processed securely through third-party payment processors)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">2.2 Information Collected Automatically</h3>
            <p className="text-gray-300 leading-relaxed">
              When you use our Services, we automatically collect certain information about your device and how you interact with our Services:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li><strong>Device information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Usage data:</strong> Pages visited, features used, time spent, click patterns, search queries</li>
              <li><strong>Technical data:</strong> Log files, error reports, performance metrics</li>
              <li><strong>Cookies and tracking:</strong> Session data, preferences, analytics information</li>
              <li><strong>Location data:</strong> Approximate location based on IP address</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">2.3 Information from Third Parties</h3>
            <p className="text-gray-300 leading-relaxed">
              We may receive information about you from:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Business partners and affiliates</li>
              <li>Payment processors (transaction confirmations)</li>
              <li>Analytics providers (usage statistics)</li>
              <li>Marketing platforms (campaign effectiveness)</li>
              <li>Public databases and social media platforms (when you connect accounts)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed">
              We use your information to provide, maintain, and improve our Services. Specifically, we use your information to:
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">3.1 Service Delivery</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Create and manage your account</li>
              <li>Generate personalized AI maturity assessments and recommendations</li>
              <li>Provide course content and track your learning progress</li>
              <li>Facilitate workshop enrollment and participation</li>
              <li>Enable AI advisor chat functionality</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related communications (confirmations, updates, technical notices)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">3.2 Personalization and Improvement</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Customize your experience based on your profile and preferences</li>
              <li>Recommend relevant courses, workshops, and resources</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Develop new features and services</li>
              <li>Train and improve our AI models (using aggregated, anonymized data)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">3.3 Communications</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Send you newsletters and marketing communications (with your consent)</li>
              <li>Notify you about new features, courses, or workshops</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Conduct surveys and gather feedback</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">3.4 Security and Compliance</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Monitor and analyze trends and usage patterns</li>
              <li>Comply with legal obligations and enforce our Terms of Service</li>
              <li>Protect our rights, privacy, safety, and property</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. How We Share Your Information</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">4.1 Service Providers</h3>
            <p className="text-gray-300 leading-relaxed">
              We share information with third-party service providers who perform services on our behalf:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Cloud hosting providers (data storage and computing)</li>
              <li>Payment processors (billing and transactions)</li>
              <li>Email service providers (communications)</li>
              <li>Analytics platforms (usage insights)</li>
              <li>Customer support tools (help desk)</li>
              <li>AI model providers (Claude by Anthropic for natural language processing)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">4.2 Business Transfers</h3>
            <p className="text-gray-300 leading-relaxed">
              If we are involved in a merger, acquisition, or sale of assets, your information may be transferred. We will provide notice before your information is transferred and becomes subject to a different privacy policy.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">4.3 Legal Requirements</h3>
            <p className="text-gray-300 leading-relaxed">
              We may disclose your information if required by law or in response to valid requests by public authorities (e.g., court orders, subpoenas, or government regulations).
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">4.4 With Your Consent</h3>
            <p className="text-gray-300 leading-relaxed">
              We may share your information for other purposes with your explicit consent, such as:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Team administrators can view team members' progress and analytics</li>
              <li>Public profiles or achievements (if you opt in)</li>
              <li>Participation in case studies or testimonials (with your permission)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using SSL/TLS</li>
              <li><strong>Data encryption at rest:</strong> Sensitive data is encrypted in our databases</li>
              <li><strong>Access controls:</strong> Strict authentication and authorization mechanisms</li>
              <li><strong>Regular security audits:</strong> Periodic vulnerability assessments and penetration testing</li>
              <li><strong>Employee training:</strong> Regular security awareness training for our team</li>
              <li><strong>Incident response:</strong> Established procedures for detecting and responding to security incidents</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Specifically:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li><strong>Active accounts:</strong> We retain your data while your account is active</li>
              <li><strong>Deleted accounts:</strong> After account deletion, we retain data for 90 days to allow recovery, then permanently delete it</li>
              <li><strong>Legal requirements:</strong> Some data may be retained longer to comply with legal, tax, or accounting requirements</li>
              <li><strong>Aggregated data:</strong> We may retain anonymized, aggregated data indefinitely for analytics and research</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Your Privacy Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">7.1 Access and Portability</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Request a copy of your personal information</li>
              <li>Export your data in a machine-readable format</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">7.2 Correction and Deletion</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Update or correct inaccurate information</li>
              <li>Request deletion of your personal information (subject to legal requirements)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">7.3 Consent and Marketing</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Withdraw consent for processing your information</li>
              <li>Opt out of marketing communications (unsubscribe link in all marketing emails)</li>
              <li>Manage cookie preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">7.4 Restriction and Objection</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Request restriction of processing in certain circumstances</li>
              <li>Object to processing based on legitimate interests</li>
            </ul>

            <p className="text-gray-300 leading-relaxed mt-6">
              To exercise any of these rights, please contact us at privacy@humanglue.ai. We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to collect information about your browsing activities:
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">8.1 Types of Cookies We Use</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Essential cookies:</strong> Required for the platform to function (authentication, security)</li>
              <li><strong>Performance cookies:</strong> Analyze how you use our Services to improve performance</li>
              <li><strong>Functional cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics cookies:</strong> Understand usage patterns and measure effectiveness</li>
              <li><strong>Marketing cookies:</strong> Deliver relevant advertisements (with your consent)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">8.2 Managing Cookies</h3>
            <p className="text-gray-300 leading-relaxed">
              You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Third-Party Links and Services</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Services may contain links to third-party websites, services, or applications. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child without parental consent, we will take steps to delete that information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">11. International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from your country. We ensure that such transfers comply with applicable data protection laws through:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Standard contractual clauses approved by regulatory authorities</li>
              <li>Adequacy decisions by relevant authorities</li>
              <li>Your explicit consent</li>
              <li>Appropriate safeguards to protect your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">12. AI and Machine Learning</h2>
            <p className="text-gray-300 leading-relaxed">
              We use AI and machine learning to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Generate personalized assessments and recommendations</li>
              <li>Power our AI advisor chat functionality</li>
              <li>Analyze organizational data to provide insights</li>
              <li>Improve our Services through pattern recognition</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We use third-party AI services (such as Claude by Anthropic) to process certain data. We ensure these providers maintain appropriate security and privacy standards and only process data as necessary to provide our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">13. California Privacy Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Right to know what personal information is collected, used, shared, or sold</li>
              <li>Right to delete personal information (subject to exceptions)</li>
              <li>Right to opt-out of the sale of personal information (we do not sell your information)</li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@humanglue.ai.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">14. European Privacy Rights (GDPR)</h2>
            <p className="text-gray-300 leading-relaxed">
              If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including those outlined in Section 7, plus:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Right to lodge a complaint with a supervisory authority</li>
              <li>Right to object to automated decision-making</li>
              <li>Right to appoint a representative to handle privacy matters</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Our lawful bases for processing your information include: consent, contract performance, legal obligations, and legitimate interests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">15. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Posting the updated policy on our website</li>
              <li>Sending an email notification to your registered email address</li>
              <li>Displaying a prominent notice within our Services</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Your continued use of our Services after the effective date constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">16. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="mt-4 p-6 bg-black/50 rounded-lg border border-gray-800">
              <p className="text-gray-300 font-semibold mb-2">HumanGlue Inc.</p>
              <p className="text-gray-300">Privacy Team</p>
              <p className="text-gray-300">Email: <a href="mailto:privacy@humanglue.ai" className="text-cyan-400 hover:text-cyan-300 transition-colors">privacy@humanglue.ai</a></p>
              <p className="text-gray-300">Data Protection Officer: <a href="mailto:dpo@humanglue.ai" className="text-cyan-400 hover:text-cyan-300 transition-colors">dpo@humanglue.ai</a></p>
              <p className="text-gray-300 mt-2">Website: <a href="https://humanglue.ai" className="text-cyan-400 hover:text-cyan-300 transition-colors">https://humanglue.ai</a></p>
            </div>
            <p className="text-gray-300 leading-relaxed mt-6">
              We are committed to resolving privacy-related complaints and concerns. We will respond to your inquiry within 30 days.
            </p>
          </section>

          <section className="border-t border-gray-800 pt-8 mt-8">
            <p className="text-sm text-gray-500 italic">
              By using HumanGlue's Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
