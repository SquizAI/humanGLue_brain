'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
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
      { name: 'AI Maturity Assessment', href: '/?chat=true' },
      { name: 'Workshops & Training', href: '/solutions' },
      { name: 'View All Solutions', href: '/solutions' }
    ],
    company: [
      { name: 'Our Purpose', href: '/purpose' },
      { name: 'Our Solutions', href: '/solutions' },
      { name: 'Sign Up', href: '/signup' },
      { name: 'Login', href: '/login' }
    ],
    resources: [
      { name: 'Start Free Assessment', href: '/?chat=true' },
      { name: 'Schedule Demo', href: '/?chat=true' },
      { name: 'Client Portal', href: '/dashboard' },
      { name: 'Contact Us', href: 'mailto:info@humanglue.ai' }
    ]
  }

  return (
    <footer className="relative bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
      {/* CTA Section */}
      <div className="border-b border-gray-800">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-8 md:p-12 border border-purple-500/20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 font-gendy">
                  {userData?.name
                    ? `${userData.name}, Ready to Transform Your Organization?`
                    : 'Ready to Transform Your Organization?'
                  }
                </h3>
                <p className="text-gray-300 mb-6 font-diatype leading-relaxed">
                  {userData?.name
                    ? `Continue with our AI-powered assessment to uncover your organization's hidden potential.`
                    : 'Start with our AI-powered assessment to uncover your organization\'s hidden potential.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/?chat=true">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-purple-500/50 font-diatype"
                    >
                      Schedule a Demo
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <Link href="/purpose">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 hover:border-purple-500/30 transition-all inline-flex items-center gap-2 font-diatype"
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
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center"
                >
                  <Image
                    src="/favcon_HG.png"
                    alt="Human Glue Logo"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
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
              <Image
                src="/favcon_HG.png"
                alt="Human Glue Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-2xl font-bold text-white font-gendy">Human Glue</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-sm font-diatype leading-relaxed">
              The glue that binds AI capabilities with human adaptability. We help organizations embed behavioral change at every level to thrive in continuous transformation.
            </p>
            <div className="space-y-3">
              <a href="mailto:info@humanglue.ai" className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors font-diatype">
                <Mail className="w-5 h-5" />
                <span>info@humanglue.ai</span>
              </a>
              <Link href="/?chat=true" className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors font-diatype">
                <Calendar className="w-5 h-5" />
                <span>Schedule a Demo</span>
              </Link>
              <div className="flex items-center gap-3 text-gray-300 font-diatype">
                <MapPin className="w-5 h-5" />
                <span>Miami, FL</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-gendy">Solutions</h4>
            <ul className="space-y-2">
              {footerLinks.solutions.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-purple-400 transition-colors font-diatype text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 font-gendy">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-purple-400 transition-colors font-diatype text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 font-gendy">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-purple-400 transition-colors font-diatype text-sm">
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
            <div className="text-gray-400 text-sm font-diatype">
              © {currentYear} Human Glue AI. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-gray-400 hover:text-purple-400 text-sm transition-colors font-diatype">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-purple-400 text-sm transition-colors font-diatype">
                Terms of Service
              </Link>
              <div className="flex items-center gap-4">
                <a href="https://linkedin.com/company/humanglue" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://twitter.com/humanglue" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors" aria-label="Twitter">
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