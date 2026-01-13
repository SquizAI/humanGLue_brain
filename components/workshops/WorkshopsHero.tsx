'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export function WorkshopsHero() {
  return (
    <div className="bg-[#1d212a]">
      {/* Hero Section with Video Background */}
      <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/gradient-bg.png"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/workshop.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Navigation */}
        <div className="relative z-20">
          <nav className="container max-w-7xl mx-auto px-6 h-[120px] flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/HumnaGlue_logo_white_blue.png"
                alt="HMN"
                width={213}
                height={45}
                className="w-[180px] md:w-[213px]"
                priority
              />
            </Link>

            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/purpose">
                <div className="backdrop-blur-md bg-white/20 rounded-full px-6 py-3 text-white text-sm font-semibold">
                  Purpose
                </div>
              </Link>
              <Link href="/approach">
                <div className="backdrop-blur-md bg-white/20 rounded-full px-6 py-3 text-white text-sm font-semibold">
                  Approach
                </div>
              </Link>
              <Link href="/workshops">
                <div className="backdrop-blur-md bg-white/20 border border-white rounded-full px-6 py-3 text-white text-sm font-semibold">
                  Workshops
                </div>
              </Link>
            </div>

            {/* CTA */}
            <Link href="/?chat=true" className="hidden md:block">
              <div className="backdrop-blur-md bg-[#61d8fe] rounded-full px-6 py-3 text-black text-sm font-semibold">
                Schedule a Call
              </div>
            </Link>
          </nav>
        </div>

        {/* Hero Content - Positioned higher */}
        <div className="relative z-10 container max-w-7xl mx-auto px-6 pt-32 md:pt-40 lg:pt-48">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-[100px] font-normal text-white leading-[1.1] max-w-[1200px] font-gendy"
          >
            Build AI fluency that actually sticks
          </motion.h1>
        </div>
      </section>

      {/* Workshop Philosophy Section */}
      <section className="py-12 md:py-20 px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="backdrop-blur-3xl bg-white/[0.03] border border-[#3e4658] rounded-[40px] md:rounded-[60px] p-8 md:p-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-3xl md:text-[48px] font-normal leading-tight md:leading-[50px] mb-8 font-gendy"
            >
              Workshops that transform, not just inform
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div>
                <p className="text-white text-xl md:text-[30px] leading-relaxed md:leading-[45px] font-anuphan">
                  Traditional training has a 90% forgetting rate within 30 days. Our workshops are different.
                </p>
              </div>
              <div>
                <p className="text-[#bdbdbd] text-lg md:text-[22px] leading-relaxed md:leading-[34px] font-medium font-anuphan mb-6">
                  We embed behavioral change through hands-on practice, real-world application, and 23 weekly touchpoints that ensure new skills become lasting habits.
                </p>
                <p className="text-[#bdbdbd] text-lg md:text-[22px] leading-relaxed md:leading-[34px] font-medium font-anuphan">
                  Every workshop is designed around one principle: People learn by doing, not watching.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Preview */}
      <section className="pb-12 md:pb-20 px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                pillar: 'Adaptability',
                color: 'blue',
                description: 'Master the skills that AI can\'t replace'
              },
              {
                pillar: 'Coaching',
                color: 'amber',
                description: 'Lead transformation at every level'
              },
              {
                pillar: 'Marketplace',
                color: 'cyan',
                description: 'Position yourself for the AI economy'
              }
            ].map((item, i) => (
              <motion.div
                key={item.pillar}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-[30px] p-6 md:p-8 ${
                  item.color === 'blue' ? 'bg-blue-500/20 border border-blue-500/30' :
                  item.color === 'amber' ? 'bg-amber-500/20 border border-amber-500/30' :
                  'bg-cyan-500/20 border border-cyan-500/30'
                }`}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
                  item.color === 'blue' ? 'bg-blue-500/30 text-blue-200' :
                  item.color === 'amber' ? 'bg-amber-500/30 text-amber-200' :
                  'bg-cyan-500/30 text-cyan-200'
                }`}>
                  {item.pillar}
                </div>
                <p className="text-white text-lg md:text-xl font-medium font-anuphan">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
