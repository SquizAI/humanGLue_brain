'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Footer } from '@/components/organisms/Footer'

export default function ApproachPage() {
  const evidenceStats = [
    { stat: '95%', percent: 95, description: '95% of AI pilots fail when human factors are ignored (MIT 2025)' },
    { stat: '40%', percent: 40, description: '40% faster time-to-hire for adaptable organizations (McKinsey)' },
    { stat: '3-5x', percent: null, description: '3-5x productivity gains where humans and AI truly partner (Multiple sources)' },
    { stat: '4.5M', percent: null, description: '$4.2M average cost of ignoring shadow AI risks (Industry average)' }
  ]

  const gapCards = [
    {
      title: 'When Strategy Meets Reality',
      gap: "73% of employees can't connect AI initiatives to their work",
      fix: 'Executive alignment workshops + Shadow AI scaling sessions',
      result: 'Strategy becomes capability, not PowerPoints'
    },
    {
      title: "When Leaders Aren't Leading",
      gap: "C-suite talks AI but can't demonstrate it",
      fix: 'AI amplification bootcamps + Decision velocity training',
      result: 'Leaders who drive transformation, not resist it'
    },
    {
      title: "When People Can't Keep Pace",
      gap: 'Top 10% thriving, bottom 50% drowning',
      fix: 'Role-specific mastery programs + Peer champion networks',
      result: 'Every employee becomes a competitive advantage'
    },
    {
      title: 'When Culture Kills Innovation',
      gap: 'Fear beats curiosity, resistance beats experimentation',
      fix: 'Psychological safety interventions + Behavior embedding',
      result: 'Culture that accelerates change instead of killing it'
    }
  ]

  const realityGaps = [
    {
      number: 'Gap #1: The Strategy Delusion',
      description: "Leaders think AI vision is clear. Reality: 73% of employees can't connect AI initiatives to their role and only 25% of leaders see meaningful return on their AI investments"
    },
    {
      number: 'Gap #2: The Shadow AI Economy',
      description: 'Leaders see IT efficiency. Reality: Shadow AI costs $4.2M per breach and wastes 30-40% of IT spending —at the same time, Shadow AI use represents 60% of your actual AI innovation, but it remains invisible to leadership.'
    },
    {
      number: 'Gap #3: The Adaptability Chasm',
      description: "Leaders think everyone's learning equally. Reality: Only 6% of employees feel very comfortable using AI and the top 10% of talent is getting recruited away."
    }
  ]

  const gapClosingPoints = [
    'Evidence over opinions - Behavioral interviews reveal what people actually do, not what they say',
    'Capability building over checkbox training - 23 weekly touchpoints embed real behavior change',
    'Bottom-up innovation over top-down mandates - Scale the 67% of innovation already happening in shadows',
    'Measured transformation over magical thinking - Adaptability scores prove progress or we pivot'
  ]

  const industryQuotes = [
    {
      source: 'McKinsey Global Institute (2025):',
      quote: "Organizations combining AI with structured human oversight achieve 73% better outcomes. It's not about the technology—it's about adaptability."
    },
    {
      source: 'Boston Consulting Group AI Radar (2025):',
      quote: '75% of executives rank AI as top priority, but only 25% report meaningful value. The gap? Human readiness.'
    },
    {
      source: 'Deloitte Future of Work (2025):',
      quote: 'Companies prioritizing skills over degrees see 30% higher productivity in first 6 months. Adaptability beats credentials.'
    },
    {
      source: 'Forrester AI Predictions (2024):',
      quote: '60% of employees will use shadow AI tools. Organizations that surface and scale these innovations will dominate.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#1d212a]">
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
            <source src="/approach.mp4" type="video/mp4" />
          </video>
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
                <div className="backdrop-blur-[11.9px] bg-white/20 rounded-full px-[21px] py-[18px] text-white text-sm font-semibold">
                  Purpose
                </div>
              </Link>
              <Link href="/approach">
                <div className="backdrop-blur-[11.9px] bg-white/20 border border-white rounded-full px-[21px] py-[18px] text-white text-sm font-semibold">
                  Approach
                </div>
              </Link>
              <Link href="/workshops">
                <div className="backdrop-blur-[11.9px] bg-white/20 rounded-full px-[21px] py-[18px] text-white text-sm font-semibold">
                  Workshops
                </div>
              </Link>
            </div>

            {/* CTA */}
            <a href="https://calendly.com/alex-behmn/discovery-call" target="_blank" rel="noopener noreferrer" className="hidden md:block">
              <div className="backdrop-blur-[11.9px] bg-[#61d8fe] rounded-full px-[23px] py-[18px] text-black text-sm font-semibold">
                Schedule a Call
              </div>
            </a>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container max-w-7xl mx-auto px-6 flex items-center h-full pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-[119px] font-normal text-white leading-[1] max-w-[1400px] font-gendy"
          >
            Transformation without truth is just high-priced theater
          </motion.h1>
        </div>
      </section>

      {/* The Evidence Is Clear Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="backdrop-blur-2xl bg-white/[0.03] border border-[#3e4658] rounded-[60px] p-12 md:p-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-3xl md:text-[48px] font-normal leading-[50px] font-gendy mb-12"
            >
              The evidence is clear
            </motion.h2>

            <div className="flex flex-wrap justify-between gap-8 mb-16">
              {evidenceStats.map((item, i) => {
                const radius = 80
                const circumference = 2 * Math.PI * radius
                const strokeDashoffset = item.percent
                  ? circumference * (1 - item.percent / 100)
                  : circumference

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center flex-1 min-w-[200px]"
                  >
                    <div className="relative w-[180px] h-[180px] mx-auto mb-4">
                      {/* SVG Gradient Circle */}
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                        <defs>
                          <linearGradient id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#61d8fe" />
                            <stop offset="100%" stopColor="#544ae8" />
                          </linearGradient>
                        </defs>
                        {/* Background circle */}
                        <circle
                          cx="90"
                          cy="90"
                          r={radius}
                          fill="none"
                          stroke="#3e4658"
                          strokeWidth="8"
                        />
                        {/* Progress circle with gradient */}
                        {item.percent && (
                          <circle
                            cx="90"
                            cy="90"
                            r={radius}
                            fill="none"
                            stroke={`url(#gradient-${i})`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                          />
                        )}
                      </svg>
                      {/* Center text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-[#61d8fe] text-3xl md:text-[48px] font-normal font-anuphan">
                          {item.stat}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#bdbdbd] text-lg leading-[26px] font-anuphan max-w-[260px] mx-auto">
                      {item.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-2xl md:text-[48px] font-normal leading-[50px] font-gendy mb-12"
            >
              We measure the gaps that kill transformations. Then close them.
            </motion.h3>
          </div>
        </div>
      </section>

      {/* Our Methodology Section */}
      <section className="pb-16 md:pb-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="backdrop-blur-2xl bg-white/[0.03] border border-[#3e4658] rounded-[60px] p-12 md:p-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-3xl md:text-[48px] font-normal leading-[50px] font-gendy mb-12"
            >
              How we drive business outcomes
            </motion.h2>

            {/* Methodology Buttons */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {['Find', 'Validate', 'Scale'].map((label, i) => (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#544ae8] border border-[#475065] rounded-[100px] px-12 md:px-16 py-6 md:py-8 text-white text-2xl md:text-[34px] font-normal font-gendy flex-1 md:flex-none md:w-[300px] lg:w-[400px]"
                >
                  {label}
                </motion.button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-white text-xl md:text-[30px] leading-[36px] md:leading-[45px] font-anuphan">
                  Every failed AI transformation has the same root cause: The gap between leadership assumptions and organizational reality.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-[#bdbdbd] text-lg md:text-[22px] leading-[28px] md:leading-[34px] font-anuphan mb-4">
                  While others impose top-down solutions, we surface bottom-up innovations. While others measure sentiment, we measure capability. While others promise change, we embed it.
                </p>
                <p className="text-[#bdbdbd] text-lg md:text-[22px] leading-[28px] md:leading-[34px] font-anuphan">
                  The difference: We bet on your people, not what worked at Google.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Purple Section - Assessment Cards */}
      <section className="bg-[#1b184f] py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-white text-3xl md:text-[48px] font-normal leading-[50px] font-gendy mb-4">
              Your AI Transformation Has a Blind Spot. We&apos;ll Show You Where.
            </h2>
            <p className="text-white text-[30px] leading-[50px] font-anuphan">
              Every failed AI transformation has the same root cause: The gap between leadership assumptions and organizational reality.
            </p>
          </motion.div>

          {/* Reality Gap Assessment Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#544ae8] rounded-[60px] p-8 md:p-12 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-[412px] flex-shrink-0">
                <div className="rounded-[40px] overflow-hidden h-[369px]">
                  <Image
                    src="/approach/image 11.png"
                    alt="Reality Gap Assessment"
                    width={570}
                    height={380}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-2xl md:text-[28px] font-normal font-gendy mb-2">
                  Reality Gap Assessment<span className="text-[14px]">™</span>
                </h3>
                <p className="text-white/90 text-sm md:text-base font-medium font-anuphan mb-2 italic">
                  Uncover the disconnects between leadership intent and organizational execution (so you stop investing in initiatives that won't scale).
                </p>
                <p className="text-white text-base md:text-lg font-medium font-anuphan mb-4">
                  The Truth About Your AI Readiness
                </p>
                <p className="text-white/80 text-sm md:text-base leading-[26px] font-medium font-anuphan mb-3">
                  Parallel 45-minute interviews with C-suite and employees reveal:
                </p>
                <ul className="text-white/80 text-sm md:text-base leading-[26px] font-medium font-anuphan space-y-1 list-disc list-inside">
                  <li>The Strategy-Reality Delta - Where leadership confidence meets ground truth</li>
                  <li>Shadow AI Economy - 67% of innovation happens without your knowledge</li>
                  <li>ROI Validation - Which AI investments will actually deliver vs. expensive experiments</li>
                  <li>Initiative Alignment - Why pilots succeed in isolation but fail at scale</li>
                  <li>Competitive Blind Spots - Where rivals are already 3-6 months ahead</li>
                </ul>
                <p className="text-white/80 text-sm md:text-base leading-[26px] font-medium font-anuphan mt-3">
                  Output: Actual proof of gaps that determines your entire transformation strategy
                </p>
              </div>
            </div>
          </motion.div>

          {/* Adaptability Index Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#544ae8] rounded-[60px] p-8 md:p-12 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-[412px] flex-shrink-0">
                <div className="rounded-[40px] overflow-hidden h-[450px] md:h-[536px]">
                  <Image
                    src="/approach/image 13.png"
                    alt="Adaptability Index"
                    width={804}
                    height={536}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-2xl md:text-[28px] font-normal font-gendy mb-2">
                  Adaptability Index<span className="text-[14px]">™</span>
                </h3>
                <p className="text-white/90 text-sm md:text-base font-medium font-anuphan mb-2 italic">
                  Measure actual workforce readiness and capability — not self-reported comfort — so you know who will drive your transformation.
                </p>
                <p className="text-white text-base md:text-lg font-medium font-anuphan mb-4">
                  The organizations that measure and manage human adaptability win. Period.
                </p>
                <p className="text-white/80 text-sm md:text-base leading-[26px] font-medium font-anuphan mb-3">
                  15-minute AI-led conversation to measure what people can do, not what they say they can do:
                </p>
                <ul className="text-white/80 text-sm md:text-base leading-[26px] font-medium font-anuphan space-y-1 list-disc list-inside">
                  <li>Learning Velocity - Speed from &quot;I don&apos;t know&quot; to &quot;I can use this&quot;</li>
                  <li>Cognitive Flexibility - Ability to abandon old ways for new possibilities</li>
                  <li>Technological Fluency - Actual AI effectiveness, not just usage</li>
                  <li>Resilience &amp; Recovery - Bouncing forward when AI fails</li>
                  <li>Collaborative Agility - Human + AI synergy in fluid teams</li>
                </ul>
                <p className="text-white/80 text-sm md:text-base leading-[26px] font-medium font-anuphan mt-3">
                  Key difference: We ask &quot;tell me about the last time you...&quot; not &quot;rate yourself 1-5&quot;
                </p>
                <p className="text-white/80 text-sm md:text-base leading-[26px] font-medium font-anuphan mt-3">
                  Output:
                </p>
                <ul className="text-white/80 text-sm md:text-base leading-[26px] font-medium font-anuphan space-y-1 list-disc list-inside">
                  <li>Individual capability scores (0-100)</li>
                  <li>Talent segmentation: Champions (15%) → Rising Stars (30%) → Developing (40%) → At Risk (15%)</li>
                  <li>Quarterly tracking proves whether transformation is actually working</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* GLUE Transformation System Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#544ae8] rounded-[60px] p-8 md:p-12"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-[412px] flex-shrink-0">
                {/* GLUE 3D Pyramid Visual */}
                <div className="relative h-[350px] md:h-[400px] flex items-center justify-center">
                  <Image
                    src="/approach/glue_pyramid.png"
                    alt="GLUE Transformation Pyramid"
                    width={412}
                    height={400}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-2xl md:text-[28px] font-normal font-gendy mb-2">
                  GLUE Transformation System<span className="text-[14px]">™</span>
                </h3>
                <p className="text-white/90 text-sm md:text-base font-medium font-anuphan mb-2 italic">
                  A staged execution model that turns gaps into capability and delivers ongoing change, not just a "done for now" report.
                </p>
                <p className="text-white text-base md:text-lg font-medium font-anuphan mb-4">
                  From Diagnosis to Market Domination
                </p>
                <ol className="text-white/80 text-sm md:text-base leading-[26px] font-medium font-anuphan space-y-2 list-decimal list-inside">
                  <li>GROW (Weeks 1-4) Build foundation through targeted bootcamps and safe experimentation</li>
                  <li>LEVERAGE (Weeks 5-8) Create breakthrough moments where AI multiplies human capability 3-5x</li>
                  <li>UNITE (Weeks 9-12) Activate networks that spread transformation organically</li>
                  <li>EVOLVE (Weeks 13-16+) Embed continuous evolution that keeps you ahead</li>
                </ol>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* From Gaps to Transformation Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12 gap-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-3xl md:text-[48px] font-normal leading-[50px] font-gendy"
            >
              From Gaps to Transformation
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white text-[22px] leading-[34px] font-medium font-anuphan max-w-[424px]"
            >
              Every gap demands a different intervention. Here&apos;s how we close them:
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {gapCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-[#3e4658] rounded-[60px] p-10"
              >
                <h3 className="text-white text-[34px] font-normal font-gendy mb-6">
                  {card.title}
                </h3>
                <p className="text-white/80 text-[22px] leading-[34px] font-medium font-anuphan">
                  <span className="font-bold underline">Gap:</span> {card.gap}{' '}
                  <span className="font-bold underline">Fix:</span> {card.fix}{' '}
                  <span className="font-bold underline">Result:</span> {card.result}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The hmn Difference Section */}
      <section className="py-12">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-3xl md:text-[48px] font-normal leading-[50px] font-gendy"
            >
              The hmn Difference
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white text-[22px] leading-[34px] font-medium font-anuphan max-w-[392px] md:text-right"
            >
              23 weekly touch-points ensure change sticks after consultants leave.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Teal Section - The 3 Reality Gaps */}
      <section className="bg-[#132e37] py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white text-3xl md:text-[48px] font-normal leading-[50px] font-gendy mb-12"
          >
            The 3 Reality Gaps We Always Find
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {realityGaps.map((gap, i) => (
              <motion.div
                key={gap.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#61d8fe] border border-[#3e4658] rounded-[60px] p-10 h-[451px]"
              >
                <h3 className="text-black text-[34px] font-normal font-gendy leading-[40px] mb-6">
                  {gap.number}
                </h3>
                <p className="text-black/80 text-[22px] leading-[34px] font-medium font-anuphan">
                  {gap.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* We Close These Gaps Through */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#61d8fe] rounded-[60px] p-10"
          >
            <h3 className="text-black text-[34px] font-normal font-gendy mb-6">
              We Close These Gaps Through:
            </h3>
            <ul className="space-y-2">
              {gapClosingPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-black/80 text-[22px]">•</span>
                  <p className="text-black/80 text-[22px] leading-[34px] font-medium font-anuphan">
                    {point}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* What Industry Leaders Know Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white text-3xl md:text-[48px] font-normal leading-[50px] font-gendy mb-12"
          >
            What Industry Leaders Know
          </motion.h2>

          <div className="space-y-6">
            {industryQuotes.map((quote, i) => (
              <motion.div
                key={quote.source}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-[#475065] rounded-[60px] p-10"
              >
                <p className="text-[#61d8fe] text-[34px] font-normal font-gendy mb-4">
                  {quote.source}
                </p>
                <p className="text-[#bdbdbd] text-[22px] leading-[34px] font-medium font-anuphan">
                  &ldquo;{quote.quote}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="py-12">
        <div className="container max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white text-3xl md:text-[48px] font-normal leading-[50px] font-gendy"
          >
            Conclusion: The future belongs to the adaptable.
          </motion.h2>
        </div>
      </section>

      {/* The Clock Is Running CTA Section */}
      <section className="relative h-[732px] overflow-hidden">
        {/* Full Width Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/approach/image 6.png"
            alt="Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 backdrop-blur-[9px] bg-white/[0.17]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 container max-w-7xl mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between py-16"
        >
          <div className="md:w-1/2">
            <h2 className="text-[#1b1b1b] text-5xl md:text-[109px] font-normal leading-[1] font-gendy">
              The Clock Is Running
            </h2>
          </div>
          <div className="md:w-1/2 md:pl-12">
            <p className="text-[#1b1b1b] text-[22px] leading-[34px] font-medium font-anuphan mb-4">
              Every Week You Wait:
            </p>
            <ul className="space-y-2 mb-8">
              {[
                'Competitors extend their lead',
                'Innovation happens without you',
                'Talent explores other options',
                'Transformation gets harder'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#1b1b1b] text-[22px] leading-[34px] font-medium font-anuphan">
                  <span>•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[#1b1b1b] text-[22px] leading-[34px] font-medium font-anuphan mb-4">
              The organizations that face reality first, win first.
            </p>
            <p className="text-[#1b1b1b] text-[22px] leading-[34px] font-medium font-anuphan mb-8">
              Let&apos;s get started!
            </p>
            <a href="https://calendly.com/alex-behmn/discovery-call" target="_blank" rel="noopener noreferrer">
              <button className="backdrop-blur-[11.9px] bg-[#1d212a] text-white rounded-full px-[23px] py-[18px] text-sm font-semibold hover:bg-[#1d212a]/90 transition-colors">
                Schedule a Call
              </button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
