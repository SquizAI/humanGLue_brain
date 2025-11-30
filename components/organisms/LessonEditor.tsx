'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Save,
  Video,
  FileText,
  CheckCircle,
  Upload,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react'

interface Lesson {
  id: number
  type: 'video' | 'reading' | 'quiz'
  title: string
  duration: string
  completed?: boolean
  videoUrl?: string
  content?: string
  questions?: QuizQuestion[]
}

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface LessonEditorProps {
  lesson: Lesson | null
  isOpen: boolean
  onClose: () => void
  onSave: (lesson: Lesson) => void
}

export function LessonEditor({ lesson, isOpen, onClose, onSave }: LessonEditorProps) {
  const [formData, setFormData] = useState<Lesson>(
    lesson || {
      id: Date.now(),
      type: 'video',
      title: '',
      duration: '',
      videoUrl: '',
      content: '',
      questions: [],
    }
  )

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    onSave(formData)
    setIsSaving(false)
  }

  const addQuizQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...(formData.questions || []),
        {
          id: Date.now(),
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
        },
      ],
    })
  }

  const updateQuestion = (questionId: number, updates: Partial<QuizQuestion>) => {
    setFormData({
      ...formData,
      questions: formData.questions?.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    })
  }

  const deleteQuestion = (questionId: number) => {
    setFormData({
      ...formData,
      questions: formData.questions?.filter((q) => q.id !== questionId),
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                {formData.type === 'video' && (
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Video className="w-5 h-5 text-blue-400" />
                  </div>
                )}
                {formData.type === 'reading' && (
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                )}
                {formData.type === 'quiz' && (
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-white font-gendy">
                  {lesson ? 'Edit Lesson' : 'Create New Lesson'}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Lesson Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3 font-diatype">
                  Lesson Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'video' as const, icon: Video, label: 'Video' },
                    { type: 'reading' as const, icon: FileText, label: 'Reading' },
                    { type: 'quiz' as const, icon: CheckCircle, label: 'Quiz' },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, type })}
                      className={`p-4 rounded-xl border transition-all ${
                        formData.type === type
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-medium font-diatype">{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to AI Transformation"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder={
                    formData.type === 'video'
                      ? 'e.g., 12:30'
                      : formData.type === 'reading'
                      ? 'e.g., 10 min read'
                      : 'e.g., 5 questions'
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                />
              </div>

              {/* Video Lesson Fields */}
              {formData.type === 'video' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Video URL
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 mb-3 font-diatype">
                      Or upload a video file
                    </p>
                    <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all font-diatype">
                      Choose File
                    </button>
                  </div>
                </div>
              )}

              {/* Reading Lesson Fields */}
              {formData.type === 'reading' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                    Content
                  </label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your lesson content here..."
                    rows={12}
                    className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2 font-diatype">
                    Supports Markdown formatting
                  </p>
                </div>
              )}

              {/* Quiz Lesson Fields */}
              {formData.type === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-400 font-diatype">
                      Questions
                    </label>
                    <button
                      onClick={addQuizQuestion}
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all flex items-center gap-2 text-sm font-diatype"
                    >
                      <Plus className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>

                  {formData.questions?.map((question, qIndex) => (
                    <div
                      key={question.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <GripVertical className="w-5 h-5 text-gray-500 cursor-move mt-3" />
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) =>
                              updateQuestion(question.id, { question: e.target.value })
                            }
                            placeholder={`Question ${qIndex + 1}`}
                            className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                          />

                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === oIndex}
                                  onChange={() =>
                                    updateQuestion(question.id, { correctAnswer: oIndex })
                                  }
                                  className="w-4 h-4 text-cyan-500 focus:ring-cyan-500"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options]
                                    newOptions[oIndex] = e.target.value
                                    updateQuestion(question.id, { options: newOptions })
                                  }}
                                  placeholder={`Option ${oIndex + 1}`}
                                  className="flex-1 px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                                />
                              </div>
                            ))}
                          </div>

                          <input
                            type="text"
                            value={question.explanation || ''}
                            onChange={(e) =>
                              updateQuestion(question.id, { explanation: e.target.value })
                            }
                            placeholder="Explanation (optional)"
                            className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                          />
                        </div>
                        <button
                          onClick={() => deleteQuestion(question.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors mt-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!formData.questions || formData.questions.length === 0) && (
                    <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                      <CheckCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 font-diatype">
                        No questions yet. Click "Add Question" to get started.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-white/5">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all font-diatype"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving || !formData.title}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg transition-all flex items-center gap-2 font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Lesson'}
              </motion.button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
