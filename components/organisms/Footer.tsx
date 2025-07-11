'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Brain, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Twitter,
  ArrowRight,
  Calendar
} from 'lucide-react'
import { useChat } from '../../lib/contexts/ChatContext'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { userData } = useChat()

  const footerLinks = {
    solutions: [
      { name: 'AI Assessment Tool', href: '/solutions' },
      { name: 'Strategic Workshops', href: '/solutions' },
      { name: 'Human Glue Toolbox', href: '/solutions' }
    ],
    company: [
      { name: 'Our Solutions', href: '/solutions' },
      { name: 'Our Process', href: '/process' },
      { name: 'Results', href: '/results' },
      { name: 'Start Chat', href: '/#chat' }
    ],
    resources: [
      { name: 'Case Studies', href: '/results' },
      { name: 'Schedule Demo', href: '/#chat' },
      { name: 'Get Started', href: '/#chat' },
      { name: 'Contact Us', href: '/#chat' }
    ]
  }

  return (
    <footer className="relative bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
      {/* CTA Section */}
      <div className="border-b border-gray-800">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 md:p-12 border border-blue-500/20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {userData?.name 
                    ? `${userData.name}, Ready to Transform Your Organization?`
                    : 'Ready to Transform Your Organization?'
                  }
                </h3>
                <p className="text-gray-300 mb-6">
                  {userData?.name
                    ? `Continue with our AI-powered assessment to uncover your organization's hidden potential.`
                    : 'Start with our AI-powered assessment to uncover your organization\'s hidden potential.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/#chat">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all inline-flex items-center gap-2"
                    >
                      Schedule a Demo
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <Link href="/process">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all inline-flex items-center gap-2"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
                >
                  <Brain className="w-16 h-16 text-blue-400" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">Human Glue</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-sm">
              Strengthening the human connections that drive organizational performance, innovation, and resilience.
            </p>
            <div className="space-y-3">
              <a href="mailto:info@humanglue.com" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
                <span>info@humanglue.com</span>
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
                <span>+1 (234) 567-890</span>
              </a>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Solutions</h4>
            <ul className="space-y-2">
              {footerLinks.solutions.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} Human Glue. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <div className="flex items-center gap-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 