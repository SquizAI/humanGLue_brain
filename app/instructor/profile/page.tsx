'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Camera,
  Upload,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  Award,
  Briefcase,
  GraduationCap,
  Globe,
  Linkedin,
  Twitter,
  Youtube,
  Github,
  Link as LinkIcon,
  Users,
  Star,
  DollarSign,
  BookOpen,
  Shield,
  Calendar,
  MapPin,
  Clock,
  Languages,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { cn } from '@/utils/cn'
import Image from 'next/image'

// Mock initial data
const MOCK_PROFILE = {
  avatar: '/HG_icon.png',
  coverPhoto: '',
  name: 'Dr. Sarah Mitchell',
  title: 'AI Transformation Expert & Executive Coach',
  bio: 'Passionate about empowering professionals to thrive in the AI era. With over 15 years of experience in organizational psychology and AI implementation, I help leaders and teams navigate digital transformation with confidence and clarity.',
  expertise: ['AI Strategy', 'Change Management', 'Leadership Development', 'Organizational Psychology', 'Digital Transformation'],
  yearsExperience: 15,
  totalStudents: 2847,
  languages: ['English', 'Spanish', 'French'],
  timezone: 'America/New_York',
  education: [
    { degree: 'Ph.D. in Organizational Psychology', institution: 'Stanford University', year: '2010' },
    { degree: 'M.S. in Computer Science', institution: 'MIT', year: '2005' },
  ],
  certifications: [
    { name: 'Certified Executive Coach', issuer: 'International Coach Federation', date: '2015', credentialId: 'ICF-12345' },
    { name: 'AI Ethics Certification', issuer: 'AI Ethics Institute', date: '2022', credentialId: 'AEI-67890' },
  ],
  workExperience: [
    { company: 'Tech Innovators Inc.', role: 'Chief Learning Officer', duration: '2018 - Present' },
    { company: 'Global Consulting Group', role: 'Senior Change Management Consultant', duration: '2012 - 2018' },
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/sarahmitchell',
    twitter: 'https://twitter.com/sarahmitchell',
    website: 'https://sarahmitchell.com',
    youtube: '',
    github: '',
    custom: [],
  },
  stats: {
    totalCourses: 12,
    totalStudents: 2847,
    averageRating: 4.9,
    totalRevenue: '$127,450',
  },
  verified: true,
}

export default function InstructorProfilePage() {
  const router = useRouter()
  const { userData } = useChat()
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState(MOCK_PROFILE)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!userData?.isInstructor) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData?.isInstructor) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const updateProfile = (updates: Partial<typeof profile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    setHasChanges(false)
    setEditingField(null)
    showSuccessToast('Profile updated successfully!')
  }

  const handleCancel = () => {
    setProfile(MOCK_PROFILE)
    setHasChanges(false)
    setEditingField(null)
  }

  const showSuccessToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const addExpertiseTag = (tag: string) => {
    if (tag && !profile.expertise.includes(tag)) {
      updateProfile({ expertise: [...profile.expertise, tag] })
    }
  }

  const removeExpertiseTag = (tag: string) => {
    updateProfile({ expertise: profile.expertise.filter(t => t !== tag) })
  }

  const addEducation = () => {
    updateProfile({
      education: [...profile.education, { degree: '', institution: '', year: '' }]
    })
  }

  const updateEducation = (index: number, updates: Partial<typeof profile.education[0]>) => {
    const newEducation = [...profile.education]
    newEducation[index] = { ...newEducation[index], ...updates }
    updateProfile({ education: newEducation })
  }

  const removeEducation = (index: number) => {
    updateProfile({ education: profile.education.filter((_, i) => i !== index) })
  }

  const addCertification = () => {
    updateProfile({
      certifications: [...profile.certifications, { name: '', issuer: '', date: '', credentialId: '' }]
    })
  }

  const updateCertification = (index: number, updates: Partial<typeof profile.certifications[0]>) => {
    const newCertifications = [...profile.certifications]
    newCertifications[index] = { ...newCertifications[index], ...updates }
    updateProfile({ certifications: newCertifications })
  }

  const removeCertification = (index: number) => {
    updateProfile({ certifications: profile.certifications.filter((_, i) => i !== index) })
  }

  const addWorkExperience = () => {
    updateProfile({
      workExperience: [...profile.workExperience, { company: '', role: '', duration: '' }]
    })
  }

  const updateWorkExperience = (index: number, updates: Partial<typeof profile.workExperience[0]>) => {
    const newExperience = [...profile.workExperience]
    newExperience[index] = { ...newExperience[index], ...updates }
    updateProfile({ workExperience: newExperience })
  }

  const removeWorkExperience = (index: number) => {
    updateProfile({ workExperience: profile.workExperience.filter((_, i) => i !== index) })
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="ml-[280px] transition-all duration-300">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header with Actions */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Instructor Profile</h1>
                <p className="text-gray-400 font-diatype">Manage your public instructor profile</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium font-diatype transition-all flex items-center gap-2",
                    isPreviewMode
                      ? "bg-white/10 text-white border border-white/20"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  )}
                >
                  {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
                </motion.button>
              </div>
            </div>

            {/* Cover Photo Section */}
            <div className="relative h-48 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-t-2xl overflow-hidden border border-white/10 border-b-0">
              {profile.coverPhoto ? (
                <Image src={profile.coverPhoto} alt="Cover" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]" />
              )}
              {!isPreviewMode && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-xl rounded-xl text-white hover:bg-black/70 transition-all"
                >
                  <Camera className="w-5 h-5" />
                </motion.button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  // Handle cover photo upload
                  showSuccessToast('Cover photo uploaded!')
                }}
              />
            </div>

            {/* Profile Header */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-b-2xl p-8 mb-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-gray-950 bg-gray-900">
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {profile.verified && (
                    <div className="absolute -top-2 -right-2 p-2 bg-blue-500 rounded-full border-4 border-gray-950">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {!isPreviewMode && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                    </motion.button>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      // Handle avatar upload
                      showSuccessToast('Avatar updated!')
                    }}
                  />
                </div>

                {/* Name & Title */}
                <div className="flex-1">
                  {editingField === 'name' && !isPreviewMode ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      onBlur={() => setEditingField(null)}
                      className="text-3xl font-bold text-white bg-white/5 border border-white/20 rounded-lg px-4 py-2 mb-2 w-full font-gendy"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-white font-gendy">{profile.name}</h2>
                      {!isPreviewMode && (
                        <button
                          onClick={() => setEditingField('name')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  )}

                  {editingField === 'title' && !isPreviewMode ? (
                    <input
                      type="text"
                      value={profile.title}
                      onChange={(e) => updateProfile({ title: e.target.value })}
                      onBlur={() => setEditingField(null)}
                      className="text-lg text-gray-300 bg-white/5 border border-white/20 rounded-lg px-4 py-2 w-full font-diatype"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-lg text-gray-300 font-diatype">{profile.title}</p>
                      {!isPreviewMode && (
                        <button
                          onClick={() => setEditingField('title')}
                          className="p-1 hover:bg-white/10 rounded transition-all"
                        >
                          <Edit2 className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400 font-diatype">{profile.yearsExperience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 font-diatype">{profile.totalStudents.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-amber-400" />
                      <span className="text-gray-400 font-diatype">{profile.languages.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio Section */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white font-gendy">About Me</h3>
                    {!isPreviewMode && editingField !== 'bio' && (
                      <button
                        onClick={() => setEditingField('bio')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  {editingField === 'bio' && !isPreviewMode ? (
                    <div>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => updateProfile({ bio: e.target.value })}
                        className="w-full h-32 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-gray-300 font-diatype resize-none"
                        placeholder="Tell students about yourself..."
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingField(null)}
                          className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 font-diatype"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 font-diatype"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 leading-relaxed font-diatype">{profile.bio}</p>
                  )}
                </div>

                {/* Expertise Tags */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 font-gendy">Expertise</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <AnimatePresence>
                      {profile.expertise.map((tag) => (
                        <motion.div
                          key={tag}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 font-diatype"
                        >
                          <span>{tag}</span>
                          {!isPreviewMode && (
                            <button
                              onClick={() => removeExpertiseTag(tag)}
                              className="hover:text-purple-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  {!isPreviewMode && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add expertise tag..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addExpertiseTag(e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype placeholder:text-gray-500"
                      />
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white font-gendy">Education</h3>
                    </div>
                    {!isPreviewMode && (
                      <button
                        onClick={addEducation}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          {!isPreviewMode ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(index, { degree: e.target.value })}
                                placeholder="Degree"
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                              />
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => updateEducation(index, { institution: e.target.value })}
                                placeholder="Institution"
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                              />
                              <input
                                type="text"
                                value={edu.year}
                                onChange={(e) => updateEducation(index, { year: e.target.value })}
                                placeholder="Year"
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold text-white font-diatype">{edu.degree}</p>
                              <p className="text-gray-400 font-diatype">{edu.institution}</p>
                              <p className="text-sm text-gray-500 font-diatype">{edu.year}</p>
                            </div>
                          )}
                        </div>
                        {!isPreviewMode && (
                          <button
                            onClick={() => removeEducation(index)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xl font-semibold text-white font-gendy">Certifications</h3>
                    </div>
                    {!isPreviewMode && (
                      <button
                        onClick={addCertification}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          {!isPreviewMode ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={cert.name}
                                onChange={(e) => updateCertification(index, { name: e.target.value })}
                                placeholder="Certification name"
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                              />
                              <input
                                type="text"
                                value={cert.issuer}
                                onChange={(e) => updateCertification(index, { issuer: e.target.value })}
                                placeholder="Issuer"
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={cert.date}
                                  onChange={(e) => updateCertification(index, { date: e.target.value })}
                                  placeholder="Date"
                                  className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                                />
                                <input
                                  type="text"
                                  value={cert.credentialId}
                                  onChange={(e) => updateCertification(index, { credentialId: e.target.value })}
                                  placeholder="Credential ID"
                                  className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold text-white font-diatype">{cert.name}</p>
                              <p className="text-gray-400 font-diatype">{cert.issuer}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span className="font-diatype">{cert.date}</span>
                                <span className="font-diatype">ID: {cert.credentialId}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {!isPreviewMode && (
                          <button
                            onClick={() => removeCertification(index)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Experience */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-amber-400" />
                      <h3 className="text-xl font-semibold text-white font-gendy">Work Experience</h3>
                    </div>
                    {!isPreviewMode && (
                      <button
                        onClick={addWorkExperience}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {profile.workExperience.map((work, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          {!isPreviewMode ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={work.role}
                                onChange={(e) => updateWorkExperience(index, { role: e.target.value })}
                                placeholder="Role/Title"
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                              />
                              <input
                                type="text"
                                value={work.company}
                                onChange={(e) => updateWorkExperience(index, { company: e.target.value })}
                                placeholder="Company"
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                              />
                              <input
                                type="text"
                                value={work.duration}
                                onChange={(e) => updateWorkExperience(index, { duration: e.target.value })}
                                placeholder="Duration (e.g., 2018 - Present)"
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold text-white font-diatype">{work.role}</p>
                              <p className="text-gray-400 font-diatype">{work.company}</p>
                              <p className="text-sm text-gray-500 font-diatype">{work.duration}</p>
                            </div>
                          )}
                        </div>
                        {!isPreviewMode && (
                          <button
                            onClick={() => removeWorkExperience(index)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Stats & Links */}
              <div className="space-y-6">
                {/* Teaching Statistics */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 font-gendy">Teaching Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 font-diatype">Courses</span>
                      </div>
                      <span className="text-white font-semibold font-diatype">{profile.stats.totalCourses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400 font-diatype">Students</span>
                      </div>
                      <span className="text-white font-semibold font-diatype">{profile.stats.totalStudents.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span className="text-gray-400 font-diatype">Avg Rating</span>
                      </div>
                      <span className="text-white font-semibold font-diatype">{profile.stats.averageRating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400 font-diatype">Revenue</span>
                      </div>
                      <span className="text-white font-semibold font-diatype">{profile.stats.totalRevenue}</span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 font-gendy">Social Links</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'text-blue-400' },
                      { key: 'twitter', icon: Twitter, label: 'Twitter', color: 'text-sky-400' },
                      { key: 'website', icon: Globe, label: 'Website', color: 'text-green-400' },
                      { key: 'youtube', icon: Youtube, label: 'YouTube', color: 'text-red-400' },
                      { key: 'github', icon: Github, label: 'GitHub', color: 'text-purple-400' },
                    ].map(({ key, icon: Icon, label, color }) => (
                      <div key={key} className="flex items-center gap-3">
                        <Icon className={cn("w-5 h-5", color)} />
                        {!isPreviewMode ? (
                          <input
                            type="url"
                            value={profile.socialLinks[key as keyof typeof profile.socialLinks] as string}
                            onChange={(e) => updateProfile({
                              socialLinks: { ...profile.socialLinks, [key]: e.target.value }
                            })}
                            placeholder={`${label} URL`}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm font-diatype placeholder:text-gray-500"
                          />
                        ) : (
                          profile.socialLinks[key as keyof typeof profile.socialLinks] && (
                            <a
                              href={profile.socialLinks[key as keyof typeof profile.socialLinks] as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-300 hover:text-white text-sm font-diatype truncate"
                            >
                              {label}
                            </a>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 font-gendy">Additional Info</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block font-diatype">Time Zone</label>
                      {!isPreviewMode ? (
                        <select
                          value={profile.timezone}
                          onChange={(e) => updateProfile({ timezone: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                        >
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                        </select>
                      ) : (
                        <p className="text-white font-diatype">{profile.timezone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save/Cancel Bar */}
            <AnimatePresence>
              {hasChanges && !isPreviewMode && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                >
                  <div className="bg-gray-900 border border-white/20 rounded-2xl shadow-2xl p-4 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-amber-400">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span className="font-medium font-diatype">Unsaved changes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        className="px-6 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 font-diatype"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 font-diatype disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
                  className="fixed top-8 right-8 z-50"
                >
                  <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium font-diatype">{toastMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
