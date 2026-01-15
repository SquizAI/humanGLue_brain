'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Mail,
  MapPin,
  Linkedin,
  Twitter
} from 'lucide-react'
import { useBranding } from '../../lib/contexts/BrandingContext'

export function Footer() {
  const { branding } = useBranding()

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
      { name: 'Client Portal', href: '/dashboard' },
      { name: 'Contact Us', href: 'mailto:hello@behmn.com' }
    ]
  }

  return (
    <footer className="relative bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
      {/* Main Footer */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Image
                src="/hmn_logo.png"
                alt="hmn"
                width={100}
                height={30}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-300 mb-6 max-w-sm font-diatype leading-relaxed">
              The glue that binds AI capabilities with human adaptability. We help organizations embed behavioral change at every level to thrive in continuous transformation.
            </p>
            <div className="space-y-3">
              <a href="mailto:hello@behmn.com" className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors font-diatype">
                <Mail className="w-5 h-5" />
                <span>hello@behmn.com</span>
              </a>
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
                  <Link href={link.href} className="text-gray-300 hover:text-cyan-400 transition-colors font-diatype text-sm">
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
                  <Link href={link.href} className="text-gray-300 hover:text-cyan-400 transition-colors font-diatype text-sm">
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
                  <Link href={link.href} className="text-gray-300 hover:text-cyan-400 transition-colors font-diatype text-sm">
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
              © 2026 behmn. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors font-diatype">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors font-diatype">
                Terms of Service
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 cursor-not-allowed opacity-50" aria-label="LinkedIn (coming soon)">
                  <Linkedin className="w-5 h-5" />
                </span>
                <span className="text-gray-500 cursor-not-allowed opacity-50" aria-label="Twitter (coming soon)">
                  <Twitter className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 