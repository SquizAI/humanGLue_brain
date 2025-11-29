'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Briefcase, Award, Link as LinkIcon, Save, Upload } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useRouter } from 'next/navigation'

// Trust middleware protection - no need for client-side auth checks
// Middleware already validates access before page loads

export default function ExpertProfilePage() {
  const router = useRouter()
  const [hasChanges, setHasChanges] = useState(false)
  const [profile, setProfile] = useState({
    fullName: 'Demo Expert',
    professionalTitle: 'AI Transformation Consultant',
    tagline: 'Helping organizations unlock the power of AI',
    bio: 'Experienced AI transformation consultant with over 10 years of experience helping organizations adopt and integrate AI technologies effectively.',
    hourlyRate: 150,
    expertise: ['AI Strategy', 'Change Management', 'Team Training', 'Process Automation'],
    yearsExperience: 10,
    education: [
      { degree: 'MBA', school: 'Harvard Business School', year: 2015 },
      { degree: 'BS Computer Science', school: 'MIT', year: 2010 }
    ],
    certifications: [
      'Certified AI Practitioner',
      'Change Management Professional',
      'Agile Transformation Coach'
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/demo',
      twitter: 'https://twitter.com/demo',
      website: 'https://example.com'
    }
  })

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')
      document.cookie = 'demoUser=; path=/; max-age=0'
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const saveProfile = () => {
    // TODO: API call to save profile
    console.log('Saving profile:', profile)
    setHasChanges(false)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Expert Profile</h1>
              <p className="text-gray-400 font-diatype">Manage your public profile and credentials</p>
            </div>
            {hasChanges && (
              <button
                onClick={saveProfile}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all font-diatype flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Photo & Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Photo */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 font-gendy">Profile Photo</h3>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold font-gendy mb-4">
                    DE
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all font-diatype flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Hourly Rate */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 font-gendy flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Hourly Rate
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-diatype">$</span>
                  <input
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) => updateProfile('hourlyRate', parseInt(e.target.value))}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                  />
                  <span className="text-gray-400 font-diatype">/hr</span>
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 font-gendy">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm font-diatype border border-purple-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <button className="mt-3 w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all font-diatype text-sm">
                  + Add Expertise
                </button>
              </div>
            </div>

            {/* Right Column - Detailed Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 font-gendy flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => updateProfile('fullName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={profile.professionalTitle}
                      onChange={(e) => updateProfile('professionalTitle', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={profile.tagline}
                      onChange={(e) => updateProfile('tagline', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1 font-diatype">{profile.tagline.length}/200 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => updateProfile('bio', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype resize-none"
                      maxLength={2000}
                    />
                    <p className="text-xs text-gray-500 mt-1 font-diatype">{profile.bio.length}/2000 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={profile.yearsExperience}
                      onChange={(e) => updateProfile('yearsExperience', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                    />
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 font-gendy flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Education
                </h3>
                <div className="space-y-3">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-white font-semibold font-diatype">{edu.degree}</p>
                      <p className="text-gray-400 text-sm font-diatype">{edu.school}</p>
                      <p className="text-gray-500 text-xs font-diatype">{edu.year}</p>
                    </div>
                  ))}
                  <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all font-diatype text-sm">
                    + Add Education
                  </button>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 font-gendy">Certifications</h3>
                <div className="space-y-2">
                  {profile.certifications.map((cert, index) => (
                    <div key={index} className="bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                      <p className="text-white font-diatype">{cert}</p>
                    </div>
                  ))}
                  <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all font-diatype text-sm">
                    + Add Certification
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 font-gendy flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Social Links
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={profile.socialLinks.linkedin}
                      onChange={(e) => updateProfile('socialLinks', { ...profile.socialLinks, linkedin: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={profile.socialLinks.twitter}
                      onChange={(e) => updateProfile('socialLinks', { ...profile.socialLinks, twitter: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                      Website
                    </label>
                    <input
                      type="url"
                      value={profile.socialLinks.website}
                      onChange={(e) => updateProfile('socialLinks', { ...profile.socialLinks, website: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
