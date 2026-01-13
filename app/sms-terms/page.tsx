import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SMS Terms & Conditions | HMN',
  description: 'SMS messaging terms and conditions for HMN AI transformation platform',
}

export default function SMSTermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          SMS Terms & Conditions
        </h1>
        <p className="text-gray-400 mb-12">Last updated: November 29, 2025</p>

        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          {/* Opt-In Consent Section */}
          <section className="p-6 bg-gray-900/50 rounded-xl border border-cyan-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">SMS Opt-In Consent</h2>
            <p className="text-gray-300 leading-relaxed">
              By providing your mobile phone number and opting in to receive SMS messages from HMN, you expressly consent to receive recurring automated text messages from HMN at the mobile number you provided. Your consent is not required as a condition of purchasing any goods or services.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-white">By texting START or providing your phone number through our platform, you agree:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>I consent to receive recurring automated SMS messages from HMN</li>
              <li>I understand message frequency may vary based on my account activity</li>
              <li>I understand that message and data rates may apply</li>
              <li>I can opt out at any time by texting STOP</li>
              <li>I can get help by texting HELP or contacting support@hmnglue.com</li>
            </ul>
          </section>

          {/* Message Types */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Types of Messages You May Receive</h2>
            <p className="text-gray-300 leading-relaxed">
              When you opt in to HMN SMS communications, you may receive:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li><strong>Account notifications:</strong> Login alerts, security codes, password resets</li>
              <li><strong>Assessment reminders:</strong> Upcoming assessment deadlines and completion notices</li>
              <li><strong>Appointment reminders:</strong> Scheduled coaching sessions and workshop reminders</li>
              <li><strong>Service updates:</strong> Important updates about your subscription or account</li>
              <li><strong>Coaching communications:</strong> Messages from your assigned transformation coach</li>
            </ul>
          </section>

          {/* Message Frequency */}
          <section className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-white">Message Frequency</h2>
            <p className="text-gray-300 leading-relaxed">
              Message frequency varies based on your account activity and preferences. You may receive up to <strong className="text-white">10 messages per month</strong> depending on:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li>Number of scheduled coaching sessions</li>
              <li>Assessment completion timelines</li>
              <li>Account security events</li>
              <li>Enrolled workshops and courses</li>
            </ul>
          </section>

          {/* STOP Instructions */}
          <section className="p-6 bg-red-900/20 rounded-xl border border-red-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">How to Opt Out (STOP)</h2>
            <p className="text-gray-300 leading-relaxed">
              You can opt out of SMS messages at any time by:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li><strong className="text-white">Texting STOP</strong> to any message you receive from us</li>
              <li>Updating your notification preferences in your account settings</li>
              <li>Contacting us at <a href="mailto:support@hmnglue.com" className="text-cyan-400 hover:text-cyan-300">support@hmnglue.com</a></li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              After texting STOP, you will receive one final confirmation message. You will no longer receive SMS messages from HMN unless you opt back in by texting START.
            </p>
          </section>

          {/* HELP Instructions */}
          <section className="p-6 bg-blue-900/20 rounded-xl border border-blue-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Need Help? (HELP)</h2>
            <p className="text-gray-300 leading-relaxed">
              For assistance with SMS messages:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li><strong className="text-white">Text HELP</strong> to receive support information</li>
              <li>Email us at <a href="mailto:support@hmnglue.com" className="text-cyan-400 hover:text-cyan-300">support@hmnglue.com</a></li>
              <li>Call us at <a href="tel:+15106170294" className="text-cyan-400 hover:text-cyan-300">(510) 617-0294</a></li>
            </ul>
          </section>

          {/* Data Rates */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Message and Data Rates</h2>
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-amber-400">Message and data rates may apply.</strong> Standard messaging rates from your wireless carrier may apply to messages you send and receive. Please check with your mobile carrier for details on your plan.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              HMN does not charge for SMS messages, but your carrier may charge you based on your mobile plan.
            </p>
          </section>

          {/* Carrier Support */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Supported Carriers</h2>
            <p className="text-gray-300 leading-relaxed">
              Our SMS service is supported on all major US carriers including AT&T, Verizon, T-Mobile, Sprint, and most regional carriers. Some carriers may not support all message types.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Privacy & Data Protection</h2>
            <p className="text-gray-300 leading-relaxed">
              We take your privacy seriously. Your phone number and SMS opt-in status are protected under our <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>. We will:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4 ml-4">
              <li><strong>Never sell</strong> your phone number to third parties</li>
              <li><strong>Never share</strong> your number for marketing purposes outside of HMN</li>
              <li><strong>Only use</strong> your number for the purposes described in this policy</li>
              <li><strong>Protect</strong> your data with industry-standard security measures</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              For complete details on how we handle your information, please review our full <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about our SMS messaging program:
            </p>
            <div className="mt-4 p-6 bg-black/50 rounded-lg border border-gray-800">
              <p className="text-gray-300 font-semibold mb-2">HMN Inc.</p>
              <p className="text-gray-300">Email: <a href="mailto:support@hmnglue.com" className="text-cyan-400 hover:text-cyan-300">support@hmnglue.com</a></p>
              <p className="text-gray-300">Phone: <a href="tel:+15106170294" className="text-cyan-400 hover:text-cyan-300">(510) 617-0294</a></p>
              <p className="text-gray-300 mt-2">Website: <a href="https://hmnglue.com" className="text-cyan-400 hover:text-cyan-300">https://hmnglue.com</a></p>
            </div>
          </section>

          {/* Quick Reference */}
          <section className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Quick Reference</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/30 rounded-lg">
                <p className="text-lg font-semibold text-white mb-2">To Opt Out</p>
                <p className="text-gray-300">Text <span className="font-mono bg-red-900/30 px-2 py-1 rounded text-red-300">STOP</span></p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <p className="text-lg font-semibold text-white mb-2">For Help</p>
                <p className="text-gray-300">Text <span className="font-mono bg-blue-900/30 px-2 py-1 rounded text-blue-300">HELP</span></p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <p className="text-lg font-semibold text-white mb-2">To Opt Back In</p>
                <p className="text-gray-300">Text <span className="font-mono bg-green-900/30 px-2 py-1 rounded text-green-300">START</span></p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <p className="text-lg font-semibold text-white mb-2">Support Email</p>
                <p className="text-gray-300"><a href="mailto:support@hmnglue.com" className="text-cyan-400">support@hmnglue.com</a></p>
              </div>
            </div>
          </section>

          {/* Terms Agreement */}
          <section className="border-t border-gray-800 pt-8 mt-8">
            <p className="text-gray-300 leading-relaxed">
              By opting in to receive SMS messages from HMN, you acknowledge that you have read, understood, and agree to these SMS Terms & Conditions, our <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">Terms of Service</Link>, and our <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
