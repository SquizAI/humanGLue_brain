'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import {
  ArrowRight,
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  Check,
  AlertCircle,
  Target,
  Database,
  Code,
  Users,
  Shield,
  FileText,
  Send,
} from 'lucide-react'

type QuestionType = 'multiple-choice' | 'voice' | 'text' | 'scale'

interface Question {
  id: string
  dimension: string
  type: QuestionType
  question: string
  description?: string
  options?: string[]
  scaleMin?: number
  scaleMax?: number
  scaleMinLabel?: string
  scaleMaxLabel?: string
}

interface Answer {
  questionId: string
  type: QuestionType
  value: string | number
  voiceRecording?: Blob
  timestamp: Date
}

const assessmentQuestions: Question[] = [
  // Strategy Alignment Questions
  {
    id: 'sa1',
    dimension: 'Strategy Alignment',
    type: 'multiple-choice',
    question: 'How well defined is your organization\'s AI strategy?',
    description: 'This helps us understand the maturity of your strategic planning for AI initiatives.',
    options: [
      'No formal AI strategy exists',
      'AI strategy is being discussed but not documented',
      'Draft AI strategy exists but not approved by leadership',
      'Formal AI strategy approved with quarterly reviews',
      'Comprehensive AI strategy with clear KPIs, budget, and executive ownership',
    ],
  },
  {
    id: 'sa2',
    dimension: 'Strategy Alignment',
    type: 'voice',
    question: 'Describe your most successful AI initiative and how it aligned with business objectives.',
    description: 'Take 1-2 minutes to explain a specific AI project, its business goals, and measurable outcomes.',
  },
  {
    id: 'sa3',
    dimension: 'Strategy Alignment',
    type: 'scale',
    question: 'How would you rate executive understanding of AI capabilities and limitations?',
    scaleMin: 1,
    scaleMax: 10,
    scaleMinLabel: 'No understanding',
    scaleMaxLabel: 'Expert understanding',
  },
  {
    id: 'sa4',
    dimension: 'Strategy Alignment',
    type: 'text',
    question: 'What are your top 3 business objectives for AI in the next 12 months?',
    description: 'Be specific about outcomes, not just activities. Example: "Reduce customer churn by 15%" vs "Implement ML models"',
  },
  {
    id: 'sa5',
    dimension: 'Strategy Alignment',
    type: 'multiple-choice',
    question: 'How are AI projects prioritized in your organization?',
    options: [
      'No formal prioritization - teams work on what interests them',
      'Ad-hoc prioritization by department heads',
      'Prioritization based on resource availability',
      'Structured framework considering business value, feasibility, and alignment',
      'Rigorous portfolio management with ROI projections and regular reviews',
    ],
  },

  // Data Infrastructure Questions
  {
    id: 'di1',
    dimension: 'Data Infrastructure',
    type: 'multiple-choice',
    question: 'What best describes your current data architecture?',
    options: [
      'Data scattered across disconnected systems and spreadsheets',
      'Some centralized databases but significant data silos remain',
      'Centralized data warehouse with regular ETL processes',
      'Modern data lake or lakehouse with real-time data pipelines',
      'Advanced data mesh or fabric with self-serve analytics and AI-ready features',
    ],
  },
  {
    id: 'di2',
    dimension: 'Data Infrastructure',
    type: 'scale',
    question: 'What percentage of your critical business data is accessible for AI/ML use?',
    scaleMin: 0,
    scaleMax: 100,
    scaleMinLabel: '0%',
    scaleMaxLabel: '100%',
  },
  {
    id: 'di3',
    dimension: 'Data Infrastructure',
    type: 'text',
    question: 'Describe your biggest data quality challenges and how you\'re addressing them.',
    description: 'Consider accuracy, completeness, consistency, timeliness, and validity of your data.',
  },
  {
    id: 'di4',
    dimension: 'Data Infrastructure',
    type: 'multiple-choice',
    question: 'How mature are your data governance practices?',
    options: [
      'No formal data governance policies or practices',
      'Informal data ownership and quality checks',
      'Documented data governance policies but inconsistent enforcement',
      'Active data governance with clear ownership, quality monitoring, and compliance processes',
      'Enterprise-wide data governance with automated quality checks, lineage tracking, and regulatory compliance',
    ],
  },
  {
    id: 'di5',
    dimension: 'Data Infrastructure',
    type: 'voice',
    question: 'Walk us through how data flows from source systems to analytical outputs in your organization.',
    description: 'Explain your data pipelines, transformation processes, and any bottlenecks you experience.',
  },

  // Technical Capability Questions
  {
    id: 'tc1',
    dimension: 'Technical Capability',
    type: 'multiple-choice',
    question: 'What is the size and composition of your AI/ML team?',
    options: [
      'No dedicated AI/ML resources - relying on external consultants or vendors',
      '1-3 data scientists or ML engineers',
      '4-10 ML practitioners with some specialization',
      '10-25 ML team with specialized roles (ML engineers, data scientists, MLOps)',
      '25+ AI organization with research scientists, ML engineers, MLOps, and AI platform teams',
    ],
  },
  {
    id: 'tc2',
    dimension: 'Technical Capability',
    type: 'text',
    question: 'List the ML frameworks, tools, and platforms currently in use in your organization.',
    description: 'Include model training tools, deployment platforms, monitoring solutions, feature stores, etc.',
  },
  {
    id: 'tc3',
    dimension: 'Technical Capability',
    type: 'scale',
    question: 'How many ML models are currently running in production?',
    scaleMin: 0,
    scaleMax: 50,
    scaleMinLabel: '0',
    scaleMaxLabel: '50+',
  },
  {
    id: 'tc4',
    dimension: 'Technical Capability',
    type: 'voice',
    question: 'Describe your ML model development and deployment process from experimentation to production.',
    description: 'Cover your MLOps practices, testing, approval processes, and deployment automation.',
  },
  {
    id: 'tc5',
    dimension: 'Technical Capability',
    type: 'multiple-choice',
    question: 'How comprehensive is your production ML monitoring?',
    options: [
      'No monitoring - models run until someone notices a problem',
      'Basic logging and error tracking',
      'Performance metrics tracked manually or with dashboards',
      'Automated monitoring for model performance, data drift, and business metrics',
      'Comprehensive observability with automated alerts, root cause analysis, and auto-remediation',
    ],
  },

  // People & Culture Questions
  {
    id: 'pc1',
    dimension: 'People & Culture',
    type: 'scale',
    question: 'What percentage of your workforce has received AI literacy training?',
    scaleMin: 0,
    scaleMax: 100,
    scaleMinLabel: '0%',
    scaleMaxLabel: '100%',
  },
  {
    id: 'pc2',
    dimension: 'People & Culture',
    type: 'voice',
    question: 'How does your organization approach change management for AI initiatives?',
    description: 'Discuss how you prepare teams for AI adoption, address resistance, and ensure successful implementation.',
  },
  {
    id: 'pc3',
    dimension: 'People & Culture',
    type: 'multiple-choice',
    question: 'How would you characterize your organization\'s attitude toward AI?',
    options: [
      'Skeptical or resistant - AI is seen as a threat',
      'Cautiously interested but waiting for others to prove value',
      'Open to AI but lacking direction or resources',
      'Actively experimenting with AI across multiple departments',
      'AI-first culture with widespread adoption and innovation',
    ],
  },
  {
    id: 'pc4',
    dimension: 'People & Culture',
    type: 'text',
    question: 'What are your biggest challenges in attracting and retaining AI talent?',
    description: 'Consider compensation, career paths, technical challenges, culture, and competition.',
  },
  {
    id: 'pc5',
    dimension: 'People & Culture',
    type: 'multiple-choice',
    question: 'How do technical and business teams collaborate on AI initiatives?',
    options: [
      'Minimal collaboration - teams work in silos',
      'Occasional communication but limited partnership',
      'Regular meetings and check-ins between teams',
      'Embedded cross-functional teams with shared goals',
      'Deeply integrated collaboration with joint accountability for outcomes',
    ],
  },

  // Governance & Ethics Questions
  {
    id: 'ge1',
    dimension: 'Governance & Ethics',
    type: 'multiple-choice',
    question: 'Do you have formal AI ethics guidelines or principles?',
    options: [
      'No ethics guidelines exist',
      'Informal discussions about ethics but nothing documented',
      'Draft ethics principles under development',
      'Documented ethics principles communicated to AI teams',
      'Comprehensive ethics framework with required training, review processes, and enforcement',
    ],
  },
  {
    id: 'ge2',
    dimension: 'Governance & Ethics',
    type: 'voice',
    question: 'Describe how you identify and mitigate bias in your AI systems.',
    description: 'Cover your approach to bias detection, testing, and ongoing monitoring.',
  },
  {
    id: 'ge3',
    dimension: 'Governance & Ethics',
    type: 'scale',
    question: 'What percentage of AI projects undergo formal risk assessment before deployment?',
    scaleMin: 0,
    scaleMax: 100,
    scaleMinLabel: '0%',
    scaleMaxLabel: '100%',
  },
  {
    id: 'ge4',
    dimension: 'Governance & Ethics',
    type: 'text',
    question: 'How do you ensure AI systems are explainable and transparent to stakeholders?',
    description: 'Discuss model documentation, explainability techniques, and stakeholder communication.',
  },
  {
    id: 'ge5',
    dimension: 'Governance & Ethics',
    type: 'multiple-choice',
    question: 'How prepared is your organization for AI regulations (e.g., EU AI Act)?',
    options: [
      'Not tracking AI regulations or compliance requirements',
      'Aware of regulations but no action taken',
      'Initial assessment of regulatory requirements underway',
      'Active compliance program with gap analysis and remediation plan',
      'Fully compliant with existing regulations and tracking emerging requirements',
    ],
  },
]

export default function NewAssessmentPage() {
  const router = useRouter()
  const { userData } = useChat()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [currentScale, setCurrentScale] = useState<number>(5)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [assessmentCompleted, setAssessmentCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!userData || !userData.authenticated) {
      router.push('/login')
    }
  }, [userData, router])

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const currentQuestion = assessmentQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100

  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'Strategy Alignment':
        return Target
      case 'Data Infrastructure':
        return Database
      case 'Technical Capability':
        return Code
      case 'People & Culture':
        return Users
      case 'Governance & Ethics':
        return Shield
      default:
        return FileText
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
      }

      audio.play()
      setIsPlaying(true)
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleNext = () => {
    // Save current answer
    const answer: Answer = {
      questionId: currentQuestion.id,
      type: currentQuestion.type,
      value: currentQuestion.type === 'scale' ? currentScale : currentAnswer,
      voiceRecording: currentQuestion.type === 'voice' ? audioBlob || undefined : undefined,
      timestamp: new Date(),
    }

    setAnswers([...answers, answer])

    // Reset current answer state
    setCurrentAnswer('')
    setCurrentScale(5)
    setAudioBlob(null)
    setRecordingDuration(0)

    // Move to next question or complete
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      completeAssessment()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      // Load previous answer if exists
      const prevAnswer = answers[currentQuestionIndex - 1]
      if (prevAnswer) {
        if (prevAnswer.type === 'scale') {
          setCurrentScale(prevAnswer.value as number)
        } else {
          setCurrentAnswer(prevAnswer.value as string)
        }
        if (prevAnswer.voiceRecording) {
          setAudioBlob(prevAnswer.voiceRecording)
        }
      }
    }
  }

  const completeAssessment = async () => {
    setIsSubmitting(true)

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // In a real app, this would send answers to backend for processing
    // For now, we'll just redirect to a mock assessment result
    const assessmentId = '1' // Would be generated by backend

    setAssessmentCompleted(true)

    setTimeout(() => {
      router.push(`/dashboard/assessments/${assessmentId}`)
    }, 2000)
  }

  const canProceed = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return currentAnswer !== ''
      case 'text':
        return currentAnswer.trim().length > 10
      case 'voice':
        return audioBlob !== null
      case 'scale':
        return true
      default:
        return false
    }
  }

  if (!userData || !userData.authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!assessmentStarted) {
    return (
      <div className="min-h-screen bg-gray-950">
        <DashboardSidebar onLogout={handleLogout} />

        <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all min-h-screen flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 font-gendy">
              AI Maturity Assessment
            </h1>

            <p className="text-xl text-gray-300 mb-8 font-diatype">
              This comprehensive assessment will evaluate your organization's AI readiness across 5 key dimensions
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {['Strategy Alignment', 'Data Infrastructure', 'Technical Capability', 'People & Culture', 'Governance & Ethics'].map((dimension, index) => {
                const Icon = getDimensionIcon(dimension)
                return (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <Icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-300 font-diatype">{dimension}</p>
                  </div>
                )
              })}
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-white mb-3 font-gendy">What to Expect:</h3>
              <ul className="space-y-2 text-sm text-gray-300 font-diatype">
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span><strong>30 questions</strong> across 5 dimensions of AI maturity</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span><strong>Multiple formats:</strong> Multiple choice, voice recordings, written responses, and rating scales</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span><strong>20-30 minutes</strong> to complete (take your time - quality answers = better insights)</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span><strong>Comprehensive report</strong> with scores, insights, and strategic recommendations</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span><strong>Industry benchmarks</strong> to see how you compare to peers</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={() => router.push('/dashboard/assessments')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => setAssessmentStarted(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 font-diatype"
              >
                Start Assessment
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (assessmentCompleted) {
    return (
      <div className="min-h-screen bg-gray-950">
        <DashboardSidebar onLogout={handleLogout} />

        <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all min-h-screen flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 font-gendy">
              Assessment Complete!
            </h1>

            <p className="text-xl text-gray-300 mb-8 font-diatype">
              We're analyzing your responses and generating your comprehensive AI maturity report...
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>

            <p className="text-sm text-gray-400 font-diatype">
              Redirecting to your results...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  const DimensionIcon = getDimensionIcon(currentQuestion.dimension)

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        {/* Progress Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <DimensionIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white font-gendy">{currentQuestion.dimension}</h2>
                  <p className="text-sm text-gray-400 font-diatype">
                    Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 font-diatype">{Math.round(progress)}% Complete</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>
          </div>
        </header>

        {/* Question Content */}
        <main className="p-8 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
            >
              <h1 className="text-3xl font-bold text-white mb-4 font-gendy">
                {currentQuestion.question}
              </h1>

              {currentQuestion.description && (
                <p className="text-gray-400 mb-8 font-diatype">
                  {currentQuestion.description}
                </p>
              )}

              {/* Multiple Choice */}
              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentAnswer(option)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all font-diatype ${
                        currentAnswer === option
                          ? 'bg-purple-500/20 border-purple-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          currentAnswer === option ? 'border-purple-500 bg-purple-500' : 'border-gray-500'
                        }`}>
                          {currentAnswer === option && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span>{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Voice Recording */}
              {currentQuestion.type === 'voice' && (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                    {!audioBlob ? (
                      <div className="text-center">
                        <motion.button
                          onClick={isRecording ? stopRecording : startRecording}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                            isRecording
                              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                              : 'bg-gradient-to-br from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/50'
                          } transition-all`}
                        >
                          {isRecording ? (
                            <Square className="w-10 h-10 text-white" />
                          ) : (
                            <Mic className="w-10 h-10 text-white" />
                          )}
                        </motion.button>

                        <p className="text-xl font-semibold text-white mb-2 font-gendy">
                          {isRecording ? 'Recording...' : 'Click to Start Recording'}
                        </p>

                        {isRecording && (
                          <p className="text-2xl text-red-400 font-mono font-semibold">
                            {formatDuration(recordingDuration)}
                          </p>
                        )}

                        {!isRecording && (
                          <p className="text-sm text-gray-400 font-diatype">
                            Speak clearly and take your time
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <motion.button
                            onClick={isPlaying ? pauseRecording : playRecording}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                          >
                            {isPlaying ? (
                              <Pause className="w-7 h-7 text-white" />
                            ) : (
                              <Play className="w-7 h-7 text-white ml-1" />
                            )}
                          </motion.button>
                        </div>

                        <p className="text-lg text-white mb-2 font-gendy">
                          Recording saved ({formatDuration(recordingDuration)})
                        </p>

                        <motion.button
                          onClick={() => {
                            setAudioBlob(null)
                            setRecordingDuration(0)
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-sm text-gray-400 hover:text-white transition-colors font-diatype"
                        >
                          Re-record
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {!audioBlob && (
                    <div className="flex items-start gap-3 text-sm text-gray-400 font-diatype">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>
                        Your browser will ask for microphone permission. Click "Allow" to continue.
                        Your recording is processed locally and securely transmitted.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Text Input */}
              {currentQuestion.type === 'text' && (
                <div className="space-y-4">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors font-diatype resize-none"
                  />
                  <p className="text-sm text-gray-400 font-diatype">
                    {currentAnswer.length} characters (minimum 10 characters)
                  </p>
                </div>
              )}

              {/* Scale */}
              {currentQuestion.type === 'scale' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-white mb-4 font-gendy">
                      {currentScale}
                    </div>
                  </div>

                  <div className="px-4">
                    <input
                      type="range"
                      min={currentQuestion.scaleMin}
                      max={currentQuestion.scaleMax}
                      value={currentScale}
                      onChange={(e) => setCurrentScale(parseInt(e.target.value))}
                      className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(59, 130, 246) ${
                          ((currentScale - (currentQuestion.scaleMin || 0)) /
                          ((currentQuestion.scaleMax || 10) - (currentQuestion.scaleMin || 0))) * 100
                        }%, rgba(255,255,255,0.1) ${
                          ((currentScale - (currentQuestion.scaleMin || 0)) /
                          ((currentQuestion.scaleMax || 10) - (currentQuestion.scaleMin || 0))) * 100
                        }%, rgba(255,255,255,0.1) 100%)`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm font-diatype">
                    <span className="text-gray-400">{currentQuestion.scaleMinLabel}</span>
                    <span className="text-gray-400">{currentQuestion.scaleMaxLabel}</span>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
                <motion.button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  whileHover={currentQuestionIndex > 0 ? { scale: 1.05 } : {}}
                  whileTap={currentQuestionIndex > 0 ? { scale: 0.95 } : {}}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all font-diatype ${
                    currentQuestionIndex === 0
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </motion.button>

                <motion.button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  whileHover={canProceed() ? { scale: 1.05 } : {}}
                  whileTap={canProceed() ? { scale: 0.95 } : {}}
                  className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all font-diatype ${
                    canProceed()
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentQuestionIndex === assessmentQuestions.length - 1 ? (
                    <>
                      Submit Assessment
                      <Send className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
