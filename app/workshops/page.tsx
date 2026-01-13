'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'
import { Footer } from '@/components/organisms/Footer'

export default function WorkshopsPage() {
  const workshopFeatures = [
    {
      title: 'Structured facilitation:',
      description: 'Full-day workshops with 15-25 diverse participants following our proven 6-phase methodology'
    },
    {
      title: 'Stakeholder alignment:',
      description: 'Bridge the gap between data insights and lived experiences to ensure buy-in at all levels'
    },
    {
      title: 'Priority setting:',
      description: 'Impact vs. effort mapping helps identify your top 3-5 transformation initiatives'
    },
    {
      title: 'Action planning:',
      description: 'Leave with clear 90-day roadmaps, assigned ownership, and success metrics'
    }
  ]

  const workshopTypes = [
    'Executive Sessions',
    'Virtual Formats',
    'Team Workshops',
    'Change Readiness',
    'Consensus Building'
  ]

  const toolboxCategories = [
    {
      title: 'Organizational Structure & Alignment',
      items: [
        'Organizational Network Analysis',
        'Role Clarity Framework',
        'Decision Rights Matrix',
        'Team Charter Builder'
      ]
    },
    {
      title: 'Leadership & Management Development',
      items: [
        'Leadership Capability Builder',
        '360 Feedback Tools',
        'Coaching Frameworks',
        'Performance Enablement'
      ]
    },
    {
      title: 'Employee Experience & Engagement',
      items: [
        'Journey Mapping Kit',
        'Pulse Survey Builder',
        'Recognition Framework',
        'Wellbeing Toolkit'
      ]
    },
    {
      title: 'Culture & Values Integration',
      items: [
        'Culture Definition Kit',
        'Values Activation Guide',
        'Behavior Change Tools',
        'Story Collection Framework'
      ]
    },
    {
      title: 'Change Management & Transformation',
      items: [
        'Change Readiness Assessment',
        'Communication Playbook',
        'Resistance Management',
        'Adoption Tracking'
      ]
    }
  ]

  const integrationSteps = [
    {
      title: 'Assess',
      description: 'AI reveals your organizational truth'
    },
    {
      title: 'Align',
      description: 'Workshops build consensus and commitment'
    },
    {
      title: 'Act',
      description: 'Toolbox enables sustainable change'
    }
  ]

  return (
    <div className="bg-[#1d212a] min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative h-[700px] md:h-[800px] lg:h-[947px] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 bg-black">
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
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Navigation */}
        <div className="relative z-20">
          <nav className="container max-w-7xl mx-auto px-6 h-[120px] flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/hmn_logo.png"
                alt="hmn"
                width={213}
                height={45}
                className="w-[180px] md:w-[213px]"
                priority
              />
            </Link>

            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/purpose">
                <div className="backdrop-blur-[12px] bg-white/20 rounded-full px-6 py-3 text-white text-sm font-semibold">
                  Purpose
                </div>
              </Link>
              <Link href="/approach">
                <div className="backdrop-blur-[12px] bg-white/20 rounded-full px-6 py-3 text-white text-sm font-semibold">
                  Approach
                </div>
              </Link>
              <Link href="/workshops">
                <div className="backdrop-blur-[12px] bg-white/20 border border-white rounded-full px-6 py-3 text-white text-sm font-semibold">
                  Workshops
                </div>
              </Link>
            </div>

            {/* CTA */}
            <Link href="/?chat=true" className="hidden md:block">
              <div className="backdrop-blur-[12px] bg-[#61d8fe] rounded-full px-6 py-3 text-black text-sm font-semibold">
                Schedule a Call
              </div>
            </Link>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container max-w-7xl mx-auto px-6 h-full flex items-center pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-[119px] font-normal text-white leading-[1] max-w-[1400px] font-gendy"
          >
            From AI-curious to AI-confident in one day.
          </motion.h1>
        </div>
      </section>

      {/* Strategic Workshops Section */}
      <section className="px-6 py-16 md:py-20">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#242830] border border-[rgba(0,0,3,0.89)] rounded-[40px] md:rounded-[60px] overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image */}
              <div className="relative h-[400px] md:h-[720px] overflow-hidden rounded-[30px] m-6 md:m-[70px] md:mr-0">
                <Image
                  src="/workshops/image 12.png"
                  alt="Strategic Workshop"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6 md:p-[70px] md:pl-8 flex flex-col justify-center">
                <h2 className="text-white text-3xl md:text-[48px] font-normal leading-tight md:leading-[50px] mb-6 font-gendy">
                  <span className="text-[#6edbfe]">Strategic Workshops:</span>
                  <br />
                  Turn Insights into Action
                </h2>

                <p className="text-white text-lg md:text-[22px] leading-relaxed md:leading-[34px] font-medium font-anuphan mb-8">
                  Every gap demands a different intervention. Here's how we close them:
                </p>

                {/* Checklist */}
                <div className="space-y-4">
                  {workshopFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 items-start"
                    >
                      <CheckCircle className="w-8 h-8 text-[#5ec16a] flex-shrink-0 mt-1" />
                      <p className="text-white font-anuphan">
                        <span className="font-bold text-lg md:text-[22px] leading-[34px]">{feature.title}</span>{' '}
                        <span className="text-base md:text-[18px] leading-[34px]">{feature.description}</span>
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Workshop Type Pills */}
          <div className="flex flex-wrap gap-3 mt-8 justify-center md:justify-end">
            {workshopTypes.map((type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="backdrop-blur-[12px] bg-white/5 border border-white/20 rounded-full px-5 py-3 text-white text-sm font-semibold"
              >
                {type}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The HMN Toolbox Section */}
      <section className="px-6 py-16 md:py-20">
        <div className="container max-w-7xl mx-auto">
          {/* Header */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-3xl md:text-[48px] font-normal leading-tight md:leading-[50px] font-gendy"
            >
              The hmn Toolbox
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white text-lg md:text-[22px] leading-relaxed md:leading-[34px] font-medium font-anuphan"
            >
              60+ practical tools organized into 5 categories to address every aspect of organizational transformation
            </motion.p>
          </div>

          {/* Toolbox Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {toolboxCategories.slice(0, 3).map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#242830] border border-[#3e4658] rounded-[40px] md:rounded-[60px] p-8 md:p-10 h-[337px] flex flex-col"
              >
                <h3 className="text-[#61d8fe] text-lg md:text-[22px] font-normal leading-tight md:leading-[30px] font-gendy mb-6">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li
                      key={item}
                      className="text-white/80 text-base md:text-[18px] leading-relaxed md:leading-[32px] font-medium font-anuphan list-disc ml-8"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Second Row - 2 Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {toolboxCategories.slice(3).map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index + 3) * 0.1 }}
                className="bg-[#242830] border border-[#3e4658] rounded-[40px] md:rounded-[60px] p-8 md:p-10 h-[337px] flex flex-col"
              >
                <h3 className="text-[#61d8fe] text-lg md:text-[22px] font-normal leading-tight md:leading-[30px] font-gendy mb-6">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li
                      key={item}
                      className="text-white/80 text-base md:text-[18px] leading-relaxed md:leading-[32px] font-medium font-anuphan list-disc ml-8"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Power of Integration Section */}
      <section className="px-6 py-16 md:py-20">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#242830] border border-[#3e4658] rounded-[40px] md:rounded-[60px] p-8 md:p-16 text-center"
          >
            <h2 className="text-white text-3xl md:text-[48px] font-normal leading-tight md:leading-[50px] font-gendy mb-6">
              The Power of Integration
            </h2>
            <p className="text-white text-lg md:text-[22px] leading-relaxed md:leading-[34px] font-medium font-anuphan max-w-[577px] mx-auto mb-12">
              Our solutions work together seamlessly to create a comprehensive transformation ecosystem.
            </p>

            {/* Integration Steps */}
            <div className="grid md:grid-cols-3 gap-8">
              {integrationSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="flex flex-col items-center"
                >
                  <h3 className="text-white text-2xl md:text-[34px] font-normal leading-[40px] font-gendy mb-4">
                    {step.title}
                  </h3>
                  <div className="bg-[#544ae8] border border-[#475065] rounded-full w-full max-w-[452px] h-[128px] flex items-center justify-center">
                    <p className="text-white text-lg md:text-[22px] leading-[34px] font-medium font-anuphan px-8 text-center">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
