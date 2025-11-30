'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Clock,
  Eye,
  EyeOff,
  Share2,
  Settings,
  PlayCircle,
  PauseCircle,
  SkipForward,
  CheckCircle,
  AlertCircle,
  Send,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Hand,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'

interface Student {
  id: string
  name: string
  avatar: string
  status: 'active' | 'away' | 'offline'
  progress: number
  handRaised: boolean
  lastActive: string
}

interface Message {
  id: string
  studentId: string
  studentName: string
  message: string
  timestamp: Date
  type: 'question' | 'comment' | 'answer'
}

export default function TeachLessonPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [isLive, setIsLive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [showChat, setShowChat] = useState(true)
  const [showStudents, setShowStudents] = useState(true)
  const [message, setMessage] = useState('')
  const [currentSlide, setCurrentSlide] = useState(1)
  const totalSlides = 12

  // Mock data
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      status: 'active',
      progress: 85,
      handRaised: true,
      lastActive: 'Now',
    },
    {
      id: '2',
      name: 'Michael Torres',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      status: 'active',
      progress: 92,
      handRaised: false,
      lastActive: 'Now',
    },
    {
      id: '3',
      name: 'Emily Watson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      status: 'away',
      progress: 78,
      handRaised: false,
      lastActive: '2 min ago',
    },
  ])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      studentId: '1',
      studentName: 'Sarah Chen',
      message: 'Can you explain the difference between supervised and unsupervised learning again?',
      timestamp: new Date(Date.now() - 5 * 60000),
      type: 'question',
    },
    {
      id: '2',
      studentId: '2',
      studentName: 'Michael Torres',
      message: 'Great explanation! This makes so much more sense now.',
      timestamp: new Date(Date.now() - 3 * 60000),
      type: 'comment',
    },
  ])

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        studentId: 'instructor',
        studentName: 'Dr. Lee (You)',
        message: message,
        timestamp: new Date(),
        type: 'answer',
      }
      setMessages([...messages, newMessage])
      setMessage('')
    }
  }

  const handleStartLive = () => {
    setIsLive(true)
  }

  const handleEndLive = () => {
    const confirmed = confirm('Are you sure you want to end this live session?')
    if (confirmed) {
      setIsLive(false)
    }
  }

  const activeStudents = students.filter((s) => s.status === 'active')
  const raisedHands = students.filter((s) => s.handRaised)

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(`/instructor/courses/${courseId}`)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-diatype">Back to Course</span>
                </button>

                <div className="h-8 w-px bg-white/10" />

                <div>
                  <h1 className="text-xl font-bold text-white font-gendy">
                    Module 1: The Architecture of Intelligence
                  </h1>
                  <p className="text-sm text-gray-400 font-diatype">Lesson 3 of 9</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Live Status */}
                {isLive && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-red-300 font-diatype">LIVE</span>
                  </div>
                )}

                {/* Active Students */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-semibold text-green-300 font-diatype">
                    {activeStudents.length} Active
                  </span>
                </div>

                {/* Raised Hands */}
                {raisedHands.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full">
                    <Hand className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-300 font-diatype">
                      {raisedHands.length} Hand{raisedHands.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Controls */}
                {!isLive ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartLive}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg transition-all flex items-center gap-2 font-diatype font-semibold"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Start Live Session
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEndLive}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg transition-all flex items-center gap-2 font-diatype"
                  >
                    <PauseCircle className="w-4 h-4" />
                    End Session
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6 p-6 h-[calc(100vh-120px)]">
          {/* Lesson Content - Main Area */}
          <div className="col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col">
            {/* Content Area */}
            <div className="flex-1 relative bg-gray-900">
              {/* Placeholder for lesson content - could be slides, video, etc. */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-24 h-24 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2 font-gendy">
                    Lesson Content Area
                  </h3>
                  <p className="text-gray-400 font-diatype">
                    Present slides, videos, or screen share here
                  </p>
                  <div className="mt-6 text-sm text-gray-500 font-diatype">
                    Slide {currentSlide} of {totalSlides}
                  </div>
                </div>
              </div>

              {/* Slide Navigation Overlay */}
              {isLive && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-800/90 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10">
                  <button
                    onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
                    disabled={currentSlide === 1}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4 text-white" />
                  </button>

                  <span className="text-white font-semibold font-diatype min-w-[80px] text-center">
                    {currentSlide} / {totalSlides}
                  </span>

                  <button
                    onClick={() => setCurrentSlide(Math.min(totalSlides, currentSlide + 1))}
                    disabled={currentSlide === totalSlides}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipForward className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            {isLive && (
              <div className="bg-gray-800/50 border-t border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-lg transition-all ${
                        isMuted
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`p-3 rounded-lg transition-all ${
                        !isVideoOn
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isVideoOn ? (
                        <VideoIcon className="w-5 h-5" />
                      ) : (
                        <VideoOff className="w-5 h-5" />
                      )}
                    </button>

                    <button className="p-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2 font-diatype">
                      <Download className="w-4 h-4" />
                      Export Notes
                    </button>

                    <button className="p-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Students & Chat */}
          <div className="col-span-4 flex flex-col gap-4 h-full">
            {/* Students Panel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col h-1/2">
              <div className="bg-gray-800/50 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-semibold text-white font-diatype">
                    Students ({students.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowStudents(!showStudents)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {showStudents ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              {showStudents && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                            student.status === 'active'
                              ? 'bg-green-500'
                              : student.status === 'away'
                              ? 'bg-amber-500'
                              : 'bg-gray-500'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium truncate font-diatype">
                            {student.name}
                          </p>
                          {student.handRaised && (
                            <Hand className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 font-diatype">
                            {student.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Panel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col h-1/2">
              <div className="bg-gray-800/50 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-white font-diatype">
                    Q&A ({messages.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {showChat ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              {showChat && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.type === 'question'
                            ? 'bg-cyan-500/10 border border-cyan-500/20'
                            : msg.type === 'answer'
                            ? 'bg-blue-500/10 border border-blue-500/20'
                            : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <div
                            className={`p-1 rounded ${
                              msg.type === 'question'
                                ? 'bg-cyan-500/20'
                                : msg.type === 'answer'
                                ? 'bg-blue-500/20'
                                : 'bg-gray-500/20'
                            }`}
                          >
                            {msg.type === 'question' ? (
                              <AlertCircle className="w-3 h-3 text-cyan-400" />
                            ) : msg.type === 'answer' ? (
                              <CheckCircle className="w-3 h-3 text-blue-400" />
                            ) : (
                              <MessageSquare className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white font-diatype">
                              {msg.studentName}
                            </p>
                            <p className="text-xs text-gray-400 font-diatype">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 font-diatype">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-800/50 border-t border-white/10 p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your response..."
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="p-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
