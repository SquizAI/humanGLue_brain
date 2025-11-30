'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Video,
  FileText,
  Lightbulb,
  ChevronRight,
  Copy,
  Check,
  Loader2,
  BookOpen,
  Calendar,
  Users,
  Target,
  Zap,
} from 'lucide-react'

interface AICourseBuilderProps {
  onGenerate: (course: GeneratedCourse) => void
}

interface GeneratedCourse {
  title: string
  description: string
  category: string
  level: string
  duration: string
  learningOutcomes: string[]
  modules: Module[]
  thumbnail?: string
  suggestedPrice?: number
}

interface Module {
  title: string
  description: string
  lessons: Lesson[]
}

interface Lesson {
  type: 'video' | 'reading' | 'quiz' | 'assignment'
  title: string
  duration: string
  content?: string
  videoScript?: string
}

export function AICourseBuilder({ onGenerate }: AICourseBuilderProps) {
  const [step, setStep] = useState<'ideate' | 'generate' | 'refine'>('ideate')
  const [prompt, setPrompt] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [learningGoals, setLearningGoals] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null)
  const [selectedModule, setSelectedModule] = useState<number | null>(null)

  const handleIdeate = async () => {
    setIsGenerating(true)
    setStep('generate')

    // Simulate AI ideation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockCourse: GeneratedCourse = {
      title: 'AI Transformation for Executive Leaders',
      description:
        'A comprehensive course designed to help executives understand and implement AI strategies in their organizations.',
      category: 'AI Adoption & Strategy',
      level: 'Executive',
      duration: '8 weeks',
      learningOutcomes: [
        'Understand the fundamentals of AI and its business applications',
        'Develop a comprehensive AI transformation roadmap',
        'Identify and prioritize high-impact AI use cases',
        'Build AI-ready teams and foster an innovation culture',
        'Measure and communicate AI ROI to stakeholders',
      ],
      modules: [
        {
          title: 'Module 1: AI Fundamentals for Business Leaders',
          description: 'Introduction to AI concepts and their business implications',
          lessons: [
            {
              type: 'video',
              title: 'Welcome & Course Overview',
              duration: '8:30',
              videoScript:
                'Welcome script covering course structure, expectations, and key outcomes...',
            },
            {
              type: 'video',
              title: 'AI Landscape: Current State and Future Trends',
              duration: '15:20',
              videoScript:
                'Explore the current AI landscape, key technologies, and emerging trends...',
            },
            {
              type: 'reading',
              title: 'AI Glossary: Essential Terms Every Executive Should Know',
              duration: '12 min read',
              content:
                '# AI Glossary\n\n## Machine Learning\nA subset of AI that enables systems to learn from data...',
            },
            {
              type: 'quiz',
              title: 'AI Fundamentals Knowledge Check',
              duration: '10 questions',
            },
          ],
        },
        {
          title: 'Module 2: Building Your AI Strategy',
          description: 'Strategic framework for AI adoption and implementation',
          lessons: [
            {
              type: 'video',
              title: 'Strategic AI Framework: The 4-Phase Approach',
              duration: '18:45',
              videoScript:
                'Introduction to the 4-phase AI adoption framework: Assess, Pilot, Scale, Optimize...',
            },
            {
              type: 'video',
              title: 'Use Case Identification and Prioritization',
              duration: '16:20',
            },
            {
              type: 'assignment',
              title: 'Create Your AI Use Case Matrix',
              duration: '2 hours',
            },
          ],
        },
        {
          title: 'Module 3: Implementation and Change Management',
          description: 'Practical strategies for successful AI implementation',
          lessons: [
            {
              type: 'video',
              title: 'Building AI-Ready Teams',
              duration: '14:30',
            },
            {
              type: 'video',
              title: 'Managing Organizational Resistance',
              duration: '17:15',
            },
            {
              type: 'reading',
              title: 'Change Management Playbook',
              duration: '20 min read',
            },
          ],
        },
      ],
      suggestedPrice: 499,
    }

    setGeneratedCourse(mockCourse)
    setIsGenerating(false)
    setStep('refine')
  }

  const handleGenerateImage = async (moduleIndex?: number) => {
    // Simulate AI image generation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    alert(
      moduleIndex !== undefined
        ? `Generating image for ${generatedCourse?.modules[moduleIndex].title}...`
        : 'Generating course thumbnail...'
    )
  }

  const handleGenerateVideoScript = async (moduleIndex: number, lessonIndex: number) => {
    // Simulate AI video script generation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const lesson = generatedCourse?.modules[moduleIndex].lessons[lessonIndex]
    alert(`Generating enhanced video script for "${lesson?.title}"...`)
  }

  const handleRegenerateModule = async (moduleIndex: number) => {
    // Simulate regenerating a specific module
    await new Promise((resolve) => setTimeout(resolve, 1500))
    alert(`Regenerating Module ${moduleIndex + 1}...`)
  }

  const handleUseCourse = () => {
    if (generatedCourse) {
      onGenerate(generatedCourse)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3 font-gendy">
            AI Course Builder
          </h1>
          <p className="text-gray-400 text-lg font-diatype">
            Let AI help you design and build your course from scratch
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { id: 'ideate', label: 'Ideate', icon: Lightbulb },
            { id: 'generate', label: 'Generate', icon: Wand2 },
            { id: 'refine', label: 'Refine', icon: Zap },
          ].map((s, index) => {
            const Icon = s.icon
            const isActive = s.id === step
            const isCompleted =
              (s.id === 'ideate' && step !== 'ideate') ||
              (s.id === 'generate' && step === 'refine')

            return (
              <div key={s.id} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50'
                        : isCompleted
                        ? 'bg-green-500/20 border-2 border-green-500'
                        : 'bg-gray-800 border-2 border-gray-700'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-green-400" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          isActive ? 'text-white' : 'text-gray-500'
                        }`}
                      />
                    )}
                  </div>
                  <p
                    className={`text-sm mt-2 font-diatype ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
                {index < 2 && (
                  <ChevronRight className="w-5 h-5 text-gray-600 -mt-6" />
                )}
              </div>
            )
          })}
        </div>

        {/* Ideate Step */}
        {step === 'ideate' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
          >
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2 font-gendy">
                <Lightbulb className="w-5 h-5 text-cyan-400" />
                What course do you want to create?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., I want to create a course that teaches executives how to implement AI in their organizations, covering strategy, use cases, and change management..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-3 flex items-center gap-2 font-gendy">
                  <Users className="w-5 h-5 text-blue-400" />
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., C-suite executives, business leaders"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-3 flex items-center gap-2 font-gendy">
                  <Target className="w-5 h-5 text-green-400" />
                  Primary Learning Goals
                </label>
                <input
                  type="text"
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  placeholder="e.g., Build AI strategy, identify use cases"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleIdeate}
              disabled={!prompt}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              Generate Course with AI
            </motion.button>
          </motion.div>
        )}

        {/* Generate Step */}
        {step === 'generate' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
          >
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3 font-gendy">
              Generating Your Course...
            </h2>
            <p className="text-gray-400 font-diatype">
              AI is creating your course structure, modules, and lesson plans
            </p>
          </motion.div>
        )}

        {/* Refine Step */}
        {step === 'refine' && generatedCourse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Course Overview */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2 font-gendy">
                    {generatedCourse.title}
                  </h2>
                  <p className="text-gray-300 font-diatype">
                    {generatedCourse.description}
                  </p>
                </div>
                <button
                  onClick={() => handleGenerateImage()}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all flex items-center gap-2 font-diatype"
                >
                  <ImageIcon className="w-4 h-4" />
                  Generate Thumbnail
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1 font-diatype">Category</p>
                  <p className="text-white font-semibold font-diatype">
                    {generatedCourse.category}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1 font-diatype">Level</p>
                  <p className="text-white font-semibold font-diatype">
                    {generatedCourse.level}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1 font-diatype">Duration</p>
                  <p className="text-white font-semibold font-diatype">
                    {generatedCourse.duration}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1 font-diatype">
                    Suggested Price
                  </p>
                  <p className="text-white font-semibold font-diatype">
                    ${generatedCourse.suggestedPrice}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-white font-semibold mb-3 font-gendy">
                  Learning Outcomes
                </p>
                <ul className="space-y-2">
                  {generatedCourse.learningOutcomes.map((outcome, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-gray-300 font-diatype"
                    >
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white font-gendy">
                Course Modules
              </h3>

              {generatedCourse.modules.map((module, moduleIndex) => (
                <div
                  key={moduleIndex}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                >
                  <div className="p-6 bg-white/5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-2 font-gendy">
                          {module.title}
                        </h4>
                        <p className="text-gray-400 font-diatype">
                          {module.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGenerateImage(moduleIndex)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Generate module image"
                        >
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleRegenerateModule(moduleIndex)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Regenerate module"
                        >
                          <Wand2 className="w-4 h-4 text-cyan-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-white/5">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4"
                      >
                        {lesson.type === 'video' && (
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <Video className="w-4 h-4 text-blue-400" />
                          </div>
                        )}
                        {lesson.type === 'reading' && (
                          <div className="p-2 rounded-lg bg-cyan-500/20">
                            <FileText className="w-4 h-4 text-cyan-400" />
                          </div>
                        )}
                        {lesson.type === 'quiz' && (
                          <div className="p-2 rounded-lg bg-green-500/20">
                            <Check className="w-4 h-4 text-green-400" />
                          </div>
                        )}
                        {lesson.type === 'assignment' && (
                          <div className="p-2 rounded-lg bg-amber-500/20">
                            <BookOpen className="w-4 h-4 text-amber-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <h5 className="text-white font-medium font-diatype">
                            {lesson.title}
                          </h5>
                          <p className="text-xs text-gray-500 font-diatype">
                            {lesson.duration}
                          </p>
                        </div>

                        {lesson.type === 'video' && (
                          <button
                            onClick={() =>
                              handleGenerateVideoScript(moduleIndex, lessonIndex)
                            }
                            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all text-xs font-diatype"
                          >
                            Generate Script
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('ideate')}
                className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all font-diatype"
              >
                Start Over
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUseCourse}
                className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-diatype"
              >
                <Check className="w-5 h-5" />
                Use This Course
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
