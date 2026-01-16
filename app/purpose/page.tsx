'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Footer } from '@/components/organisms/Footer'

// Circular Progress Component
function CircularProgress({
  percentage,
  label
}: {
  percentage: number
  label: string
}) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[180px] h-[180px]">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="rgba(97, 216, 254, 0.2)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#61d8fe"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-normal text-[#61d8fe] font-anuphan">
            {percentage}%
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-[#bdbdbd] text-lg leading-relaxed max-w-[260px] font-anuphan">
        {label}
      </p>
    </div>
  )
}

export default function PurposePage() {
  return (
    <div className="min-h-screen bg-[#1d212a]">
      {/* Hero Section with Video Background */}
      <section className="relative h-[937px] overflow-hidden">
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
            <source src="/purpose.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
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
                className="w-[100px] md:w-[120px] lg:w-[140px]"
                priority
              />
            </Link>

            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/purpose">
                <div className="backdrop-blur-md bg-white/20 border border-white rounded-full px-6 py-3 text-white text-sm font-semibold">
                  Purpose
                </div>
              </Link>
              <Link href="/approach">
                <div className="backdrop-blur-md bg-white/20 rounded-full px-6 py-3 text-white text-sm font-semibold">
                  Approach
                </div>
              </Link>
              <Link href="/workshops">
                <div className="backdrop-blur-md bg-white/20 rounded-full px-6 py-3 text-white text-sm font-semibold">
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

        {/* Hero Content */}
        <div className="relative z-10 container max-w-7xl mx-auto px-6 pt-40 md:pt-56">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-[119px] font-normal text-white leading-[1] max-w-[1400px] font-gendy"
          >
            The AI edge isn't budget. It's adaptability.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl lg:text-[32px] font-normal text-white/90 leading-[1.3] max-w-[1200px] font-anuphan mt-6"
          >
            Winners build AI-capable people — from the C-suite to the front line.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-6">
        <div className="container max-w-7xl mx-auto">
          {/* Different width cards: Mission ~38%, Vision ~62% */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mission Card - Narrower */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-2xl bg-white/[0.03] border border-[#3e4658] rounded-[40px] lg:rounded-[60px] p-8 lg:p-10 lg:w-[38%]"
            >
              {/* Pill-shaped Image Container */}
              <div className="w-full h-[170px] rounded-[85px] overflow-hidden mb-8">
                <Image
                  src="/purpose/photo-1590649681928-4b179f773bd5 1.png"
                  alt="Mission - Team collaboration"
                  width={424}
                  height={170}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-[#61d8fe] text-[28px] lg:text-[34px] font-normal leading-[1.2] font-gendy mb-3">
                Our Mission
              </h3>
              <p className="text-[#cecece] text-[18px] lg:text-[22px] leading-[1.5] lg:leading-[34px] font-medium font-anuphan">
                Make people and organizations unstoppable with AI by embedding adaptability at every level.
              </p>
            </motion.div>

            {/* Vision Card - Wider */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="backdrop-blur-2xl bg-white/[0.03] border border-[#3e4658] rounded-[40px] lg:rounded-[60px] p-8 lg:p-10 lg:w-[62%]"
            >
              {/* Pill-shaped Image Container */}
              <div className="w-full h-[164px] rounded-[82px] overflow-hidden mb-8">
                <Image
                  src="/purpose/Frame 2511.png"
                  alt="Vision - AI transformation"
                  width={757}
                  height={164}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-[#61d8fe] text-[28px] lg:text-[34px] font-normal leading-[1.2] font-gendy mb-3">
                Our Vision
              </h3>
              <p className="text-[#cecece] text-[18px] lg:text-[22px] leading-[1.5] lg:leading-[34px] font-medium font-anuphan">
                Build the adaptive economy: Where organizations win through human-AI synergy, not human-AI competition.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-6">
        <div className="container max-w-7xl mx-auto">
          {/* Section with glass card */}
          <div className="backdrop-blur-3xl bg-white/[0.03] border border-[#3e4658] rounded-[60px] p-12 md:p-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-4xl md:text-[48px] font-normal leading-[50px] mb-16 max-w-[729px] font-gendy"
            >
              Most organizations will fail to adapt. Here&apos;s why
            </motion.h2>

            {/* Circular Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <CircularProgress
                percentage={95}
                label="95% of AI pilots fail—not because the technology doesn't work, but because people aren't ready"
              />
              <CircularProgress
                percentage={35}
                label="75% of companies have adopted AI, but only 35% of employees know how to use it"
              />
              <CircularProgress
                percentage={67}
                label="67% of your best people are already building AI solutions you don't know about"
              />
              <CircularProgress
                percentage={1}
                label="Only 1% of companies have reached AI maturity—everyone else is still experimenting"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Transition Copy */}
      <section className="py-12 px-6">
        <div className="container max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/80 text-xl md:text-2xl leading-relaxed text-center font-anuphan italic"
          >
            We've seen this pattern across leaders, operators, and teams navigating real AI adoption — not just strategy decks.
          </motion.p>
        </div>
      </section>

      {/* Gap Section */}
      <section className="py-20 px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="backdrop-blur-3xl bg-white/[0.03] border border-[#3e4658] rounded-[60px] p-12 md:p-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-4xl md:text-[48px] font-normal leading-[50px] mb-12 font-gendy"
            >
              The gap between your AI roadmap and your people&apos;s reality isn&apos;t a challenge. It&apos;s a death sentence
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Left Column */}
              <div>
                <h3 className="text-white text-[30px] leading-[40px] mb-6 font-anuphan">
                  The gap is widening and you&apos;ve tried everything:
                </h3>
                <ul className="text-[#bdbdbd] text-[22px] leading-[34px] space-y-4 font-medium font-anuphan list-disc pl-8">
                  <li>Training programs with 92% completion rates that change nothing</li>
                  <li>Pilots that work in one team but never scale</li>
                  <li>Consulting strategies that sit on shelves</li>
                </ul>
              </div>

              {/* Right Column */}
              <div>
                <h3 className="text-white text-[30px] leading-[40px] mb-6 font-anuphan">
                  Meanwhile, Your best employees are updating LinkedIn, drawn to companies where AI makes them feel powerful, not obsolete.
                </h3>
                <p className="text-[#bdbdbd] text-[22px] leading-[34px] font-medium font-anuphan">
                  The organizations that win won&apos;t have the most AI tools. They&apos;ll have people who adapt faster, think differently with AI, and combine technological fluency with irreplaceable human judgment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe Section */}
      <section className="py-20 bg-[#1b184f]">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-4xl md:text-[48px] font-normal leading-[50px] font-gendy"
            >
              What we believe
            </motion.h2>
            <p className="text-white text-[22px] leading-[34px] max-w-[460px] mt-6 md:mt-0 font-medium font-anuphan">
              Our core principles guide everything we do and how we help organizations transform.
            </p>
          </div>

          {/* Belief Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[#544ae8] rounded-[60px] p-10 h-[470px]"
            >
              <div className="w-full h-[95px] bg-[#2d2d2d] rounded-[50px] overflow-hidden mb-8">
                <Image
                  src="/purpose/photo-1531297484001-80022131f5a1 1.png"
                  alt="Human-AI Synergy"
                  width={617}
                  height={95}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white text-[34px] leading-[40px] font-normal font-gendy mb-6">
                Human-AI Synergy Is The Future
              </h3>
              <p className="text-white/80 text-[22px] leading-[34px] font-medium font-anuphan">
                AI is most powerful when it amplifies human capability. Organizations mastering this synergy will crush those who debate it.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#544ae8] rounded-[60px] p-10 h-[470px]"
            >
              <div className="w-full h-[95px] bg-[#2d2d2d] rounded-[50px] overflow-hidden mb-8">
                <Image
                  src="/purpose/photo-1581090700227-1e37b190418e 2.png"
                  alt="Culture"
                  width={621}
                  height={95}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white text-[34px] leading-[40px] font-normal font-gendy mb-6">
                Culture Eats Strategy for Breakfast
              </h3>
              <p className="text-white/80 text-[22px] leading-[34px] font-medium font-anuphan">
                Your million-dollar AI strategy means nothing if your culture kills it. Transformation lives or dies at the water cooler and on Slack, not the boardroom.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#544ae8] rounded-[60px] p-10 h-[470px]"
            >
              <div className="w-full h-[95px] bg-[#2d2d2d] rounded-[50px] overflow-hidden mb-8">
                <Image
                  src="/purpose/image 9.png"
                  alt="Adaptability"
                  width={617}
                  height={95}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white text-[34px] leading-[40px] font-normal font-gendy mb-6">
                Adaptability is the Only Constant
              </h3>
              <p className="text-white/80 text-[22px] leading-[34px] font-medium font-anuphan">
                In a world of exponential change, the ability to continuously learn, and unlearn, matters more than skills or degrees.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#544ae8] rounded-[60px] p-10 h-[470px]"
            >
              <div className="w-full h-[95px] bg-[#2d2d2d] rounded-[50px] overflow-hidden mb-8">
                <Image
                  src="/purpose/image 10.png"
                  alt="Tech Stack"
                  width={621}
                  height={95}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white text-[34px] leading-[40px] font-normal font-gendy mb-6">
                Your Tech Stack is Worthless Unless People Get It
              </h3>
              <p className="text-white/80 text-[22px] leading-[34px] font-medium font-anuphan">
                Technology is only as powerful as the humans who wield it. We bet on people first. Everything else follows.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The HMN Difference Section */}
      <section className="py-20 bg-[#132e37]">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-baseline gap-4"
            >
              <span className="text-white text-4xl md:text-[48px] font-normal leading-[50px] font-gendy">The</span>
              <Image
                src="/hmn_logo.png"
                alt="hmn"
                width={120}
                height={35}
                className="h-12 w-auto translate-y-3"
              />
              <span className="text-white text-4xl md:text-[48px] font-normal leading-[50px] font-gendy">difference</span>
            </motion.div>
            <p className="text-white text-[22px] leading-[34px] max-w-[308px] mt-6 md:mt-0 font-medium font-anuphan">
              Our strategies don&apos;t sit on shelves.
            </p>
          </div>

          {/* Difference Cards */}
          <div className="space-y-6">
            {[
              {
                title: "We Start With Truth, Not High-Priced Theater",
                description: "We reveal what's actually happening in your organization through behavioral evidence. No sugar-coating. No politics. Just the reality that everyone knows but no one says out loud."
              },
              {
                title: "We Find Your Hidden Champions",
                description: "Your transformation is already happening. We just know where to look. While consultants bring \"best practices,\" we scale the innovations your own people already built."
              },
              {
                title: "We Measure What Matters",
                description: "Forget satisfaction scores and completion rates. We track whether your people can actually work differently. Adaptability Index scores don't lie—behavior change does."
              },
              {
                title: "We Make It Stick or We Don't Stop",
                description: "23 touch-points per week. AI nudges. Human coaching. Peer networks. We embed new behaviors until using AI isn't an initiative anymore—it's just Tuesday."
              },
              {
                title: "We Bet on Your People, Not What Worked at Google",
                description: "Every organization's transformation is different because every organization's people are different. We amplify what's already working instead of forcing what worked somewhere else."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#61d8fe] border border-[#475065] rounded-[60px] p-10 md:p-12"
              >
                <h3 className="text-[#1d212a] text-[34px] leading-[40px] font-normal font-gendy mb-4">
                  {item.title}
                </h3>
                <p className="text-[#1d212a] text-[22px] leading-[34px] font-medium font-anuphan max-w-[958px]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image - Gradient */}
        <div className="absolute inset-0">
          <Image
            src="/purpose/image 6.png"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>

        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-[#1b1b1b] text-5xl md:text-[110px] font-normal leading-[1] font-gendy mb-8">
                Most organizations will fail. Yours doesn&apos;t have to.
              </h2>
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-[#1b1b1b] text-[22px] leading-[34px] font-medium font-anuphan mb-8">
                What if you could see your organization as it really is, not as you think it is? What if you could find the innovations already working and scale them? What if transformation felt like evolution, not revolution?
              </p>
              <p className="text-[#1b1b1b] text-[22px] leading-[34px] font-medium font-anuphan mb-8">
                Inquire about our Reality Gap Assessment, Adaptability Index or GLUE framework for transformation and book a discovery call today.
              </p>
              <Link href="/?chat=true">
                <div className="inline-flex backdrop-blur-md bg-[#1d212a] rounded-full px-6 py-3 text-white text-sm font-semibold">
                  Schedule a Call
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
