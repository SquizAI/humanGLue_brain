'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '../organisms/Navigation'
import { Footer } from '../organisms/Footer'
import { ArrowRight, Users, Target, TrendingUp, ChevronRight, Play } from 'lucide-react'
import Image from 'next/image'

export function FigmaLandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Blue Wave Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-600/20" />
          <svg className="absolute bottom-0 w-full h-auto" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill="url(#wave-gradient)" 
              fillOpacity="0.3"
              d="M0,96L48,106.7C96,117,192,139,288,154.7C384,171,480,181,576,170.7C672,160,768,128,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 container max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl lg:text-8xl font-bold mb-8">
                <span className="text-white">human</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">glue</span>
              </h1>
              
              <h2 className="text-3xl lg:text-4xl font-semibold mb-4">
                Disruption is already here.
              </h2>
              <h3 className="text-2xl lg:text-3xl text-gray-300 mb-8">
                What you do next matters.
              </h3>

              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2 group">
                <Play className="w-5 h-5" />
                <span>Play</span>
              </button>
            </motion.div>

            {/* Right Content - Welcome Message Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-8 border border-gray-800">
                <h3 className="text-xl font-semibold mb-4">Welcome to HMN</h3>
                <p className="text-gray-300 mb-4">
                  Prepare your company for the new world of work. AI is coming. Your team needs to be ready.
                </p>
                <p className="text-gray-400 text-sm">
                  Get started with our assessment →
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative py-20 bg-gray-900">
        <div className="container max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Beneath the buzzwords lies a hard truth. Work is breaking. So are the people doing it.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                value: "75%",
                label: "of respondents say they've always worked as hard as they do now but for less money now",
                color: "from-cyan-400 to-blue-500"
              },
              {
                value: "61%",
                label: "lack of trust/belief with CEO with workplace to understand how their work drives profit and company success",
                color: "from-gray-400 to-gray-500"
              },
              {
                value: "82%",
                label: "are reluctant to adopt GenAI tools. 37% are concerned about the reliability & accuracy and 35% trust concerns",
                color: "from-cyan-400 to-teal-500"
              },
              {
                value: "56%",
                label: "have lost trust in companies. Skepticism has led to withdrawal: quiet quitting and professional hesitancy",
                color: "from-blue-400 to-cyan-500"
              },
              {
                value: "25%",
                label: "95% of leaders agree executives have been forced to plan for the workforce of the future",
                color: "from-gray-400 to-gray-500"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-4 relative">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    {stat.value}
                  </div>
                  <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: stat.value }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full bg-gradient-to-r ${stat.color}`}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              <span className="text-white">Source:</span> It's not work it's productivity crisis.
              <br />
              11k professionals polled.
            </p>
          </div>
        </div>
      </section>

      {/* The HMN Solution */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950/30">
        <div className="container max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold mb-4">The HMN Solution</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our Adaptable Foundation blends diagnostic assessments, hands-on 
              leadership coaching, AI training, and adaptability bootcamps to transform 
              leaders and teams from AI-resistant to AI-ready transformers. Your strategy for the Human + AI Era.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Human + AI Dynamics",
                subtitle: "Strategic AI Integration",
                description: "Optimizing human talents with AI's vast computational power to create human-directed, AI-assisted synergy for transformative results.",
                gradient: "from-gray-800 to-gray-900",
                link: "Learn More →"
              },
              {
                title: "Performance + Belonging",
                subtitle: "Cultural Transformation",
                description: "Creating performance-focused teams where everyone feels valued, seen, and connected to drive innovation and exceptional business results.",
                gradient: "from-pink-900/20 to-cyan-900/20",
                link: "Learn More →"
              },
              {
                title: "Future-Proof Strategy",
                subtitle: "Adaptability Framework",
                description: "Building resilience through dynamic strategies that evolve with change, ensuring your people remain ahead of disruption.",
                gradient: "from-orange-900/20 to-red-900/20",
                link: "Learn More →"
              }
            ].map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-all`} />
                <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all h-full">
                  <h3 className="text-2xl font-bold mb-2">{solution.title}</h3>
                  <p className="text-blue-400 text-sm mb-4">+ {solution.subtitle}</p>
                  <p className="text-gray-300 mb-6">{solution.description}</p>
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                    {solution.link}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Adapt. Lead. Thrive. Section */}
      <section className="relative py-20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10">
        <div className="container max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-6xl font-bold mb-8">
              Adapt. Lead. Thrive.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              In a world transformed by AI, <span className="text-cyan-400">hmn</span> gives leaders
              and teams the edge, bridging them to drive progress,
              not just keep pace.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:shadow-xl transition-all">
              See how it works →
            </button>
          </motion.div>

          {/* Testimonial Avatars */}
          <div className="flex justify-center items-center gap-8 mt-12">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-500" />
            </div>
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-500" />
            </div>
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-500" />
            </div>
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                <span className="text-white">human</span>
                <span className="text-blue-400">glue</span>
              </h3>
            </div>
            <div className="text-gray-400">
              <p>94 Merrick Way Suite</p>
              <p>200, Miami, FL 33134</p>
              <p className="mt-4">+1 (877) 322-1029</p>
              <p>hello@humanglue.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}