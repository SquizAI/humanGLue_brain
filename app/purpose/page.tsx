'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Heart,
  Target,
  Compass,
  Users,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Brain,
  Zap,
  TrendingUp,
  Shield,
  Rocket,
  Award,
  Globe,
} from 'lucide-react'
import { Navigation } from '@/components/organisms/Navigation'
import { Footer } from '@/components/organisms/Footer'
import { Button } from '@/components/atoms'
import { AskAIButton } from '@/components/molecules'

export default function PurposePage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Animated Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 mb-6">
              <Heart className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300 font-diatype">Our Why</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-gendy leading-tight">
              We Exist to
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Unlock Human Potential
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-diatype max-w-3xl mx-auto leading-relaxed">
              In the age of AI, the organizations that thrive will not just adopt technology—they will build cultures where humans and AI amplify each other to achieve the impossible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
            >
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-6">
                <Target className="w-8 h-8 text-cyan-400" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 font-gendy">Our Mission</h2>

              <p className="text-lg text-gray-300 leading-relaxed font-diatype">
                To be the glue that binds AI capabilities with human adaptability, enabling organizations to thrive in constant transformation by embedding behavioral change at every level—from the boardroom to the frontline.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
            >
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-6">
                <Compass className="w-8 h-8 text-blue-400" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 font-gendy">Our Vision</h2>

              <p className="text-lg text-gray-300 leading-relaxed font-diatype">
                A world where every organization has the adaptability to turn AI readiness into lasting competitive advantage—where technology empowers people, not replaces them, and where change is embraced as the ultimate growth opportunity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-gendy">
              The AI Transformation Gap
            </h2>
            <p className="text-xl text-gray-400 font-diatype leading-relaxed">
              Companies are spending billions on AI technology, but 70% of transformations fail—not because of technology, but because people are not ready to change how they work.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                stat: '70%',
                title: 'Transformations Fail',
                description: 'Most AI initiatives fail to deliver ROI due to cultural resistance and lack of organizational readiness',
                icon: <TrendingUp className="w-6 h-6" />,
              },
              {
                stat: '$100B+',
                title: 'Wasted Annually',
                description: 'Organizations waste billions on AI tools that employees will not adopt because change management was an afterthought',
                icon: <Zap className="w-6 h-6" />,
              },
              {
                stat: '18-36mo',
                title: 'Time to Value',
                description: 'Traditional change management takes too long in fast-moving markets where AI moves at the speed of innovation',
                icon: <Shield className="w-6 h-6" />,
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center hover:border-red-500/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]"
              >
                <div className="inline-flex p-3 rounded-lg bg-red-500/10 text-red-400 mb-4">
                  {stat.icon}
                </div>

                <div className="text-5xl font-bold text-white mb-2 font-gendy">{stat.stat}</div>
                <h3 className="text-xl font-semibold text-white mb-2 font-gendy">{stat.title}</h3>
                <p className="text-gray-400 font-diatype leading-relaxed">{stat.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Ask AI about the problem */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <AskAIButton
              topic="AI Transformation Challenges"
              question="Why do 70% of AI transformations fail and how does HumanGlue solve this?"
              context={{ page: 'purpose', data: { section: 'transformation-gap' } }}
              variant="floating"
              label="Ask AI Why Most Transformations Fail"
            />
          </motion.div>
        </div>
      </section>

      {/* Our Beliefs */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-gendy">
              What We Believe
            </h2>
            <p className="text-xl text-gray-400 font-diatype max-w-3xl mx-auto">
              Our core principles guide everything we do and how we help organizations transform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: 'Human-AI Synergy is the Future',
                description: 'AI is most powerful when it amplifies human capability rather than replacing it. Organizations that master this synergy will dominate their markets and create unprecedented value.',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Culture Eats Strategy for Breakfast',
                description: 'No technology can succeed in a culture resistant to change. Lasting transformation requires embedding new behaviors at every organizational level, from executives to frontline teams.',
              },
              {
                icon: <Lightbulb className="w-8 h-8" />,
                title: 'Adaptability is the Only Constant',
                description: 'In a world of exponential change, the ability to continuously learn, unlearn, and relearn is more valuable than any specific skill or knowledge you possess today.',
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: 'People Before Technology',
                description: 'Technology is only as valuable as the humans who adopt it. We start with people, culture, and readiness—then build the technical solutions that accelerate transformation.',
              },
            ].map((belief, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-8 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
              >
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-6">
                  {belief.icon}
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 font-gendy">
                  {belief.title}
                </h3>

                <p className="text-gray-300 leading-relaxed font-diatype">
                  {belief.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Ask AI about beliefs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <AskAIButton
              topic="HumanGlue Philosophy"
              question="What makes your approach to AI transformation different from other consultants?"
              context={{ page: 'purpose', data: { section: 'beliefs' } }}
              variant="default"
              label="Learn About Our Approach"
            />
            <AskAIButton
              topic="Culture Change"
              question="How do you embed behavioral change in organizations?"
              context={{ page: 'purpose', data: { section: 'beliefs' } }}
              variant="inline"
              label="Ask about culture transformation"
            />
          </motion.div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/10 via-transparent to-cyan-950/10" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-gendy">
              The Human Glue Difference
            </h2>
            <p className="text-xl text-gray-400 font-diatype max-w-3xl mx-auto leading-relaxed">
              We do not just consult—we embed ourselves in your transformation journey, becoming the connective tissue between your vision and execution
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                title: 'AI-Powered Insights',
                description: 'We use advanced AI to reveal patterns and gaps humans might miss, giving you an objective, data-driven view of your organizational readiness and transformation opportunities.',
              },
              {
                title: 'Human-Centered Design',
                description: 'Every solution is designed with the end user in mind, ensuring adoption and sustainable behavior change that sticks long after we leave your organization.',
              },
              {
                title: 'Behavior Embedding Focus',
                description: 'We do not just train—we embed new capabilities through deliberate practice, reinforcement, and cultural integration that becomes part of your organizational DNA.',
              },
              {
                title: 'Continuous Evolution',
                description: 'Transformation is not a one-time event. We build systems and capabilities that adapt as your organization evolves, ensuring you stay ahead of the curve.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 font-gendy">{item.title}</h3>
                  <p className="text-gray-300 font-diatype leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Ask AI about the approach */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <AskAIButton
              topic="Human Glue Methodology"
              question="Can you explain how the Human Glue Difference works in practice with real examples?"
              context={{ page: 'purpose', data: { section: 'approach' } }}
              variant="default"
              label="See How We Work"
              size="lg"
            />
          </motion.div>
        </div>
      </section>

      {/* Why Now */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-gendy">
              Why This Matters Now
            </h2>
            <p className="text-xl text-gray-400 font-diatype max-w-3xl mx-auto">
              The AI revolution is not coming—it is already here. The question is: will your organization lead or follow?
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Rocket className="w-8 h-8" />,
                title: 'Speed of Change',
                description: 'AI capabilities are doubling every 6 months. Organizations that cannot adapt quickly will be left behind by more agile competitors.',
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Competitive Advantage',
                description: 'Early adopters who successfully integrate AI are seeing 3-5x productivity gains and capturing market share from slower competitors.',
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: 'Talent Expectations',
                description: 'Top talent expects to work with cutting-edge technology. Organizations stuck in old ways of working are losing their best people.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
              >
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-gendy">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed font-diatype">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl rounded-3xl border border-white/10 p-12 md:p-16 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-gendy">
                Ready to Transform Your Organization?
              </h2>

              <p className="text-xl text-gray-300 mb-8 font-diatype leading-relaxed">
                Partner with us to build an AI-ready culture where people and technology thrive together. Start with our free assessment to understand where you stand and what is possible.
              </p>

              {/* Ask AI option */}
              <div className="mb-6">
                <AskAIButton
                  topic="Getting Started"
                  question="I'm interested in HumanGlue - what are my options to get started and what should I expect?"
                  context={{ page: 'purpose', data: { section: 'cta' } }}
                  variant="inline"
                  label="Not sure? Ask AI for guidance"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/?chat=true">
                  <Button variant="gradient" size="lg" className="shadow-lg">
                    Start Free Assessment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="secondary" size="lg">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
