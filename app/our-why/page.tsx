'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navigation } from '@/components/organisms/Navigation'
import { Button } from '@/components/atoms'

// Figma asset URLs
const IMAGES = {
  mission: "https://www.figma.com/api/mcp/asset/5bd17b6a-c253-4280-a497-ad7431420ed8",
  vision: "https://www.figma.com/api/mcp/asset/602a81e6-de13-439a-9aac-bff201969048",
  ctaBackground: "https://www.figma.com/api/mcp/asset/3a054f7b-28fb-45e5-aa50-c1a3d646e748",
  synergy: "https://www.figma.com/api/mcp/asset/906b1364-f2ba-4de8-a9df-548a57e958a7",
  culture: "https://www.figma.com/api/mcp/asset/64e87b95-b8b9-4f9f-88ff-47d8b602f97d",
  adaptability: "https://www.figma.com/api/mcp/asset/90363467-c2bc-4b28-bd55-9b607a6e09b2",
  techStack: "https://www.figma.com/api/mcp/asset/276ffa2d-c910-41e2-8ff7-2dd898cd3c77",
  logo: "https://www.figma.com/api/mcp/asset/d4ff0288-3255-4e32-9e27-4fc1d5fd1da1",
}

// Circular progress component for statistics
function CircularProgress({
  percentage,
  description
}: {
  percentage: string
  description: string
}) {
  const numValue = parseFloat(percentage)
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-36 h-36 md:w-44 md:h-44 mb-4">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(97, 216, 254, 0.2)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#61d8fe"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 283" }}
            whileInView={{ strokeDasharray: `${numValue * 2.83} 283` }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl md:text-5xl font-normal text-[#61d8fe]">{percentage}</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-[260px]">
        {description}
      </p>
    </div>
  )
}

// Belief card component
function BeliefCard({
  title,
  description,
  imageSrc,
  delay = 0
}: {
  title: string
  description: string
  imageSrc: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="bg-[#544ae8] rounded-[40px] md:rounded-[60px] p-6 md:p-10 h-full"
    >
      <div className="bg-[#2d2d2d] h-20 md:h-24 rounded-full w-48 md:w-60 overflow-hidden mb-6 md:mb-8">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-xl md:text-3xl font-gendy text-white mb-3 md:mb-4 leading-tight">
        {title}
      </h3>
      <p className="text-white/80 text-base md:text-lg leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

// Difference card component
function DifferenceCard({
  title,
  description,
  delay = 0
}: {
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/[0.03] border border-[#475065] rounded-[40px] md:rounded-[60px] p-6 md:p-10"
    >
      <h3 className="text-xl md:text-3xl font-gendy text-[#61d8fe] mb-3 md:mb-4 leading-tight">
        {title}
      </h3>
      <p className="text-[#bdbdbd] text-base md:text-lg leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

export default function OurWhyPage() {
  return (
    <div className="min-h-screen bg-[#1d212a]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-20 md:pb-32 overflow-hidden bg-black">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[100px] xl:text-[119px] font-gendy text-white leading-[1.1] tracking-tight">
              Your competitor is moving 40% faster because their people know how to work with AI
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="py-12 md:py-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/[0.03] backdrop-blur-2xl border border-[#3e4658] rounded-[40px] md:rounded-[60px] p-6 md:p-12"
            >
              <div className="bg-[#2d2d2d] h-32 md:h-44 rounded-[60px] md:rounded-[90px] overflow-hidden mb-6 md:mb-8">
                <img
                  src={IMAGES.mission}
                  alt="Our Mission"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl md:text-4xl font-gendy text-[#61d8fe] mb-3 md:mb-4">
                Our Mission
              </h2>
              <p className="text-[#cecece] text-lg md:text-xl leading-relaxed">
                Make people and organizations unstoppable with AI by embedding adaptability at every level.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/[0.03] backdrop-blur-2xl border border-[#3e4658] rounded-[40px] md:rounded-[60px] p-6 md:p-12"
            >
              <div className="bg-[#343434] h-32 md:h-44 rounded-[100px] md:rounded-[200px] overflow-hidden mb-6 md:mb-8">
                <img
                  src={IMAGES.vision}
                  alt="Our Vision"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl md:text-4xl font-gendy text-[#61d8fe] mb-3 md:mb-4">
                Our Vision
              </h2>
              <p className="text-[#cecece] text-lg md:text-xl leading-relaxed">
                Build the adaptive economy: Where organizations win through human-AI synergy, not human-AI competition.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 md:py-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-[#3e4658] rounded-[40px] md:rounded-[60px] p-6 md:p-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 md:mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-gendy text-white leading-tight max-w-3xl">
                Most organizations will fail to adapt. Here&apos;s why
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
              <CircularProgress
                percentage="95%"
                description="95% of AI pilots fail—not because the technology doesn't work, but because people aren't ready"
              />
              <CircularProgress
                percentage="35%"
                description="75% of companies have adopted AI, but only 35% of employees know how to use it"
              />
              <CircularProgress
                percentage="67%"
                description="67% of your best people are already building AI solutions you don't know about"
              />
              <CircularProgress
                percentage="1%"
                description="Only 1% of companies have reached AI maturity—everyone else is still experimenting"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Gap Section */}
      <section className="py-12 md:py-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-[#3e4658] rounded-[40px] md:rounded-[60px] p-6 md:p-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 md:mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-gendy text-white leading-tight max-w-5xl">
                The gap between your AI roadmap and your people&apos;s reality isn&apos;t a challenge. It&apos;s a death sentence
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div>
                <h3 className="text-xl md:text-3xl text-white mb-4 md:mb-6">
                  The gap is widening and you&apos;ve tried everything:
                </h3>
                <ul className="space-y-3 md:space-y-4 text-[#bdbdbd] text-base md:text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-[#61d8fe] mt-1">•</span>
                    Training programs with 92% completion rates that change nothing
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#61d8fe] mt-1">•</span>
                    Pilots that work in one team but never scale
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#61d8fe] mt-1">•</span>
                    Consulting strategies that sit on shelves
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl md:text-3xl text-white mb-4 md:mb-6">
                  Meanwhile, Your best employees are updating LinkedIn, drawn to companies where AI makes them feel powerful, not obsolete.
                </h3>
                <p className="text-[#bdbdbd] text-base md:text-lg leading-relaxed">
                  The organizations that win won&apos;t have the most AI tools. They&apos;ll have people who adapt faster, think differently with AI, and combine technological fluency with irreplaceable human judgment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe Section */}
      <section className="py-12 md:py-24 bg-[#1b184f]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 md:mb-12 gap-4 md:gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-gendy text-white"
            >
              What we believe
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white text-base md:text-lg max-w-md"
            >
              Our core principles guide everything we do and how we help organizations transform.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <BeliefCard
              title="Human-AI Synergy Is The Future"
              description="AI is most powerful when it amplifies human capability. Organizations mastering this synergy will crush those who debate it."
              imageSrc={IMAGES.synergy}
              delay={0}
            />
            <BeliefCard
              title="Culture Eats Strategy for Breakfast"
              description="Your million-dollar AI strategy means nothing if your culture kills it. Transformation lives or dies at the water cooler and on Slack, not the boardroom."
              imageSrc={IMAGES.culture}
              delay={0.1}
            />
            <BeliefCard
              title="Adaptability is the Only Constant"
              description="In a world of exponential change, the ability to continuously learn, and unlearn, matters more than skills or degrees."
              imageSrc={IMAGES.adaptability}
              delay={0.2}
            />
            <BeliefCard
              title="Your Tech Stack is Worthless Unless People Get It"
              description="Technology is only as powerful as the humans who wield it. We bet on people first. Everything else follows."
              imageSrc={IMAGES.techStack}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Human Glue Difference Section */}
      <section className="py-12 md:py-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 md:mb-12 gap-4 md:gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-gendy text-white"
            >
              The Human Glue difference
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white text-base md:text-lg max-w-sm"
            >
              We don&apos;t deliver PowerPoints. We deliver transformation.
            </motion.p>
          </div>

          <div className="space-y-4 md:space-y-6">
            <DifferenceCard
              title="We Start With Truth, Not High-Priced Theater"
              description="We reveal what's actually happening in your organization through behavioral evidence. No sugar-coating. No politics. Just the reality that everyone knows but no one says out loud."
              delay={0}
            />
            <DifferenceCard
              title="We Find Your Hidden Champions"
              description="Your transformation is already happening. We just know where to look. While consultants bring 'best practices,' we scale the innovations your own people already built."
              delay={0.1}
            />
            <DifferenceCard
              title="We Measure What Matters"
              description="Forget satisfaction scores and completion rates. We track whether your people can actually work differently. Adaptability Index scores don't lie—behavior change does."
              delay={0.2}
            />
            <DifferenceCard
              title="We Make It Stick or We Don't Stop"
              description="23 touch-points per week. AI nudges. Human coaching. Peer networks. We embed new behaviors until using AI isn't an initiative anymore—it's just Tuesday."
              delay={0.3}
            />
            <DifferenceCard
              title="We Bet on Your People, Not What Worked at Google"
              description="Every organization's transformation is different because every organization's people are different. We amplify what's already working instead of forcing what worked somewhere else."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        {/* Background image with blur overlay */}
        <div className="absolute inset-0">
          <img
            src={IMAGES.ctaBackground}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-gendy text-[#1b1b1b] leading-tight">
                Most organizations will fail. Yours doesn&apos;t have to.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-[#1b1b1b] text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                What if you could see your organization as it really is, not as you think it is? What if you could find the innovations already working and scale them? What if transformation felt like evolution, not revolution?
              </p>
              <p className="text-[#1b1b1b] text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                Inquire about our Reality Gap Assessment, Adaptability Index or 3 R&apos;s framework for transformation and book a discovery call today.
              </p>
              <Link href="/contact">
                <Button
                  className="bg-[#1d212a] hover:bg-[#2d313a] text-white rounded-full px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-semibold"
                >
                  Schedule a Call
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 bg-black">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
            <div>
              <img
                src={IMAGES.logo}
                alt="HumanGlue"
                className="h-10 md:h-11 w-auto"
              />
            </div>
            <div className="text-white">
              <p className="font-bold mb-2">Made in Miami</p>
              <p className="text-gray-400">info@humanglue.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
