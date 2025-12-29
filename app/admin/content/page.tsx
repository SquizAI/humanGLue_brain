'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Text, Heading } from '@/components/atoms/Text'
import {
  Upload,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Video,
  Image as ImageIcon,
  File,
  Archive,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  FolderOpen,
  Paperclip,
  Loader2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { signOut } from '@/lib/auth/hooks'

// File types configuration
const fileTypeConfig = {
  video: {
    icon: Video,
    color: 'cyan',
    extensions: ['.mp4', '.webm', '.mov', '.avi'],
    label: 'Video',
  },
  document: {
    icon: FileText,
    color: 'blue',
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
    label: 'Document',
  },
  image: {
    icon: ImageIcon,
    color: 'green',
    extensions: ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp'],
    label: 'Image',
  },
  archive: {
    icon: Archive,
    color: 'amber',
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    label: 'Archive',
  },
}

// Content types
const contentTypes = {
  'course-materials': 'Course Materials',
  'workshop-resources': 'Workshop Resources',
  'assessment-templates': 'Assessment Templates',
  'general-resources': 'General Resources',
}

// Access levels
const accessLevels = ['Public', 'Members Only', 'Premium']

// Categories/Tags
const categories = [
  'AI Adoption',
  'Change Management',
  'Leadership',
  'Technical',
  'Strategy',
  'Culture',
  'Data Analytics',
  'Ethics',
  'Communication',
  'Training',
]

// Sample content library data
const initialContent = [
  {
    id: 1,
    title: 'AI Transformation Strategy Guide',
    description: 'Comprehensive guide for enterprise AI adoption',
    fileName: 'ai-transformation-guide.pdf',
    fileType: 'document',
    fileSize: '2.5 MB',
    contentType: 'general-resources',
    accessLevel: 'Premium',
    categories: ['AI Adoption', 'Strategy'],
    uploadDate: '2025-10-01',
    downloads: 1247,
    associatedCourse: 'AI Transformation for Executives',
  },
  {
    id: 2,
    title: 'Leadership Workshop Slides',
    description: 'Presentation materials for the leadership workshop',
    fileName: 'leadership-workshop.pptx',
    fileType: 'document',
    fileSize: '8.3 MB',
    contentType: 'workshop-resources',
    accessLevel: 'Members Only',
    categories: ['Leadership', 'Training'],
    uploadDate: '2025-09-28',
    downloads: 856,
    associatedCourse: 'Building AI-Ready Teams',
  },
  {
    id: 3,
    title: 'Change Management Assessment',
    description: 'Comprehensive organizational readiness questionnaire',
    fileName: 'change-assessment-template.pdf',
    fileType: 'document',
    fileSize: '1.2 MB',
    contentType: 'assessment-templates',
    accessLevel: 'Members Only',
    categories: ['Change Management', 'Strategy'],
    uploadDate: '2025-09-25',
    downloads: 2341,
  },
  {
    id: 4,
    title: 'Introduction to AI Ethics',
    description: 'Video course on ethical AI implementation',
    fileName: 'ai-ethics-intro.mp4',
    fileType: 'video',
    fileSize: '145.6 MB',
    contentType: 'course-materials',
    accessLevel: 'Public',
    categories: ['Ethics', 'AI Adoption'],
    uploadDate: '2025-09-20',
    downloads: 3892,
    associatedCourse: 'Data Governance & AI Ethics',
  },
  {
    id: 5,
    title: 'Workshop Templates Package',
    description: 'Complete set of workshop facilitation templates',
    fileName: 'workshop-templates.zip',
    fileType: 'archive',
    fileSize: '12.8 MB',
    contentType: 'workshop-resources',
    accessLevel: 'Premium',
    categories: ['Training', 'Communication'],
    uploadDate: '2025-09-15',
    downloads: 678,
  },
]

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function ContentLibrary() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'downloads'>('date')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [activeTab, setActiveTab] = useState<keyof typeof contentTypes>('course-materials')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'course-materials' as keyof typeof contentTypes,
    accessLevel: 'Members Only',
    selectedCategories: [] as string[],
    associatedCourse: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // File type detection
  const getFileType = (fileName: string): keyof typeof fileTypeConfig => {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
    for (const [type, config] of Object.entries(fileTypeConfig)) {
      if (config.extensions.includes(extension)) {
        return type as keyof typeof fileTypeConfig
      }
    }
    return 'document'
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFilesAdded(files)
  }, [])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFilesAdded(files)
    }
  }

  // Process added files
  const handleFilesAdded = (files: File[]) => {
    const newFiles: UploadFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'pending',
    }))

    // Validate file size (max 500MB)
    const validFiles = newFiles.filter((uploadFile) => {
      if (uploadFile.file.size > 500 * 1024 * 1024) {
        uploadFile.status = 'error'
        uploadFile.error = 'File size exceeds 500MB limit'
        return true
      }
      return true
    })

    setUploadFiles((prev) => [...prev, ...validFiles])
  }

  // Simulate file upload
  const uploadFile = async (uploadFile: UploadFile) => {
    setUploadFiles((prev) =>
      prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading' } : f))
    )

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setUploadFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: i } : f))
      )
    }

    setUploadFiles((prev) =>
      prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f))
    )
  }

  // Handle upload submission
  const handleUpload = async () => {
    // Validate form
    const errors: Record<string, string> = {}
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }
    if (uploadFiles.length === 0) {
      errors.files = 'At least one file is required'
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    // Upload all files
    for (const fileToUpload of uploadFiles) {
      if (fileToUpload.status === 'pending') {
        await uploadFile(fileToUpload)
      }
    }

    // Add to content library
    const newContent = uploadFiles
      .filter((f) => f.status === 'success')
      .map((file, index) => ({
        id: Math.max(...content.map((c) => c.id)) + index + 1,
        title: formData.title,
        description: formData.description,
        fileName: file.file.name,
        fileType: getFileType(file.file.name),
        fileSize: formatFileSize(file.file.size),
        contentType: formData.contentType,
        accessLevel: formData.accessLevel,
        categories: formData.selectedCategories,
        uploadDate: new Date().toISOString().split('T')[0],
        downloads: 0,
        associatedCourse: formData.associatedCourse || undefined,
      }))

    setContent([...newContent, ...content])
    handleCloseUploadModal()
  }

  // Open upload modal
  const handleOpenUploadModal = () => {
    setFormData({
      title: '',
      description: '',
      contentType: activeTab,
      accessLevel: 'Members Only',
      selectedCategories: [],
      associatedCourse: '',
    })
    setUploadFiles([])
    setFormErrors({})
    setShowUploadModal(true)
  }

  // Close upload modal
  const handleCloseUploadModal = () => {
    setShowUploadModal(false)
    setUploadFiles([])
    setFormErrors({})
  }

  // Remove upload file
  const removeUploadFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter((c) => c !== category)
        : [...prev.selectedCategories, category],
    }))
  }

  // Delete content
  const handleDeleteContent = (contentId: number) => {
    setContent(content.filter((c) => c.id !== contentId))
    setShowDeleteConfirm(null)
  }

  // Filter and sort content
  const filteredContent = content
    .filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || item.fileType === selectedType
      const matchesAccessLevel =
        selectedAccessLevel === 'all' || item.accessLevel === selectedAccessLevel
      return matchesSearch && matchesType && matchesAccessLevel
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title)
        case 'downloads':
          return b.downloads - a.downloads
        case 'date':
        default:
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      }
    })

  // Get file icon
  const getFileIcon = (fileType: string) => {
    const config = fileTypeConfig[fileType as keyof typeof fileTypeConfig]
    return config ? config.icon : File
  }

  // Get file color
  const getFileColor = (fileType: string) => {
    const config = fileTypeConfig[fileType as keyof typeof fileTypeConfig]
    return config ? config.color : 'gray'
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
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

  // Check admin access with timeout pattern
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[ContentLibrary] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  if (!showContent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading content..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b sticky top-0 z-30 hg-bg-sidebar hg-border">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin">
                  <Text variant="muted" size="sm" className="hover:underline mb-2 inline-block">← Back to Dashboard</Text>
                </Link>
                <Heading as="h1" size="3xl" className="mb-2">Content Library</Heading>
                <Text variant="muted">
                  Manage your platform resources ({filteredContent.length} items)
                </Text>
              </div>
              <Button variant="primary" size="lg" onClick={handleOpenUploadModal} icon={<Upload className="w-5 h-5" />}>
                Upload Content
              </Button>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-8">
          <Card padding="lg" className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search content..."
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all hg-bg-secondary hg-border hg-text-primary"
                    style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* File Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all hg-bg-secondary hg-border hg-text-primary"
                style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="image">Images</option>
                <option value="archive">Archives</option>
              </select>

              {/* Access Level Filter */}
              <select
                value={selectedAccessLevel}
                onChange={(e) => setSelectedAccessLevel(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all hg-bg-secondary hg-border hg-text-primary"
                style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
              >
                <option value="all">All Access Levels</option>
                {accessLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3 mt-4">
              <Text variant="muted" size="sm">Sort by:</Text>
              <div className="flex gap-2">
                {(['date', 'name', 'downloads'] as const).map((sort) => (
                  <Button
                    key={sort}
                    variant={sortBy === sort ? 'cyan' : 'ghost'}
                    size="sm"
                    onClick={() => setSortBy(sort)}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContent.map((item, index) => {
              const FileIcon = getFileIcon(item.fileType)

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border rounded-2xl overflow-hidden hover:border-[var(--hg-cyan-border)] transition-all group"
                  style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
                >
                  {/* File Icon */}
                  <div className="relative h-32 flex items-center justify-center" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--hg-cyan-bg)' }}>
                      <FileIcon className="w-12 h-12" style={{ color: 'var(--hg-cyan-text)' }} />
                    </div>

                    {/* Access Level Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="px-2 py-1 rounded-lg text-xs font-semibold border" style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-secondary)' }}>
                        {item.accessLevel}
                      </div>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-4">
                    <h3 className="text-base font-bold mb-1 font-gendy line-clamp-2" style={{ color: 'var(--hg-text-primary)' }}>
                      {item.title}
                    </h3>
                    <p className="text-xs mb-3 font-diatype line-clamp-2" style={{ color: 'var(--hg-text-muted)' }}>
                      {item.description}
                    </p>

                    {/* File Details */}
                    <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--hg-text-muted)' }}>
                      <span className="font-diatype">{item.fileSize}</span>
                      <span className="font-diatype">{fileTypeConfig[item.fileType as keyof typeof fileTypeConfig]?.label}</span>
                    </div>

                    {/* Categories */}
                    {item.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="px-2 py-0.5 rounded text-xs font-diatype"
                            style={{ backgroundColor: 'var(--hg-bg-secondary)', color: 'var(--hg-text-muted)' }}
                          >
                            {category}
                          </span>
                        ))}
                        {item.categories.length > 2 && (
                          <span className="px-2 py-0.5 rounded text-xs font-diatype" style={{ backgroundColor: 'var(--hg-bg-secondary)', color: 'var(--hg-text-muted)' }}>
                            +{item.categories.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs mb-3" style={{ color: 'var(--hg-text-muted)' }}>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span className="font-diatype">{item.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-diatype">{new Date(item.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-diatype border"
                        style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-3 py-2 rounded-lg transition-all border"
                        style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-cyan-text)' }}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-3 py-2 rounded-lg transition-all border"
                        style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-cyan-text)' }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDeleteConfirm(item.id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 hg-text-muted" />
              <Heading as="h3" size="xl" className="mb-2">No content found</Heading>
              <Text variant="muted">
                Try adjusting your filters or upload new content
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={handleCloseUploadModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="border rounded-2xl w-full max-w-4xl my-8"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--hg-border-color)' }}>
                <div>
                  <h2 className="text-2xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Upload Content</h2>
                  <p className="text-sm font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                    Add new resources to your content library
                  </p>
                </div>
                <button
                  onClick={handleCloseUploadModal}
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--hg-bg-secondary)]"
                  style={{ color: 'var(--hg-text-muted)' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content Type Tabs */}
              <div className="flex gap-2 p-6 border-b overflow-x-auto" style={{ borderColor: 'var(--hg-border-color)' }}>
                {(Object.entries(contentTypes) as [keyof typeof contentTypes, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveTab(key)
                        setFormData((prev) => ({ ...prev, contentType: key }))
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-diatype whitespace-nowrap transition-all border"
                      style={{
                        backgroundColor: activeTab === key ? 'var(--hg-cyan-bg)' : 'var(--hg-bg-secondary)',
                        borderColor: activeTab === key ? 'var(--hg-cyan-border)' : 'var(--hg-border-color)',
                        color: activeTab === key ? 'var(--hg-cyan-text)' : 'var(--hg-text-muted)'
                      }}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* File Upload Zone */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                    Files <span className="text-red-400">*</span>
                  </label>
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="border-2 border-dashed rounded-xl p-8 text-center transition-all"
                    style={{
                      borderColor: isDragging ? 'var(--hg-cyan-border)' : 'var(--hg-border-color)',
                      backgroundColor: isDragging ? 'var(--hg-cyan-bg)' : 'var(--hg-bg-secondary)'
                    }}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--hg-text-muted)' }} />
                    <p className="font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Drag & drop files here, or click to browse
                    </p>
                    <p className="text-sm mb-4 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                      Supports: Videos (MP4, WebM), Documents (PDF, DOCX, XLSX), Images (JPG, PNG,
                      SVG), Archives (ZIP)
                    </p>
                    <p className="text-xs mb-4 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                      Maximum file size: 500MB
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all cursor-pointer font-diatype border"
                        style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
                      >
                        <Paperclip className="w-5 h-5" />
                        Browse Files
                      </motion.div>
                    </label>
                  </div>
                  {formErrors.files && (
                    <p className="text-red-400 text-sm mt-2 font-diatype">{formErrors.files}</p>
                  )}

                  {/* Upload Progress */}
                  {uploadFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadFiles.map((uploadFile) => (
                        <div
                          key={uploadFile.id}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{ backgroundColor: 'var(--hg-bg-secondary)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-diatype truncate" style={{ color: 'var(--hg-text-primary)' }}>
                                {uploadFile.file.name}
                              </p>
                              {uploadFile.status === 'success' && (
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                              {uploadFile.status === 'error' && (
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              )}
                              {uploadFile.status === 'uploading' && (
                                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: 'var(--hg-cyan-text)' }} />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--hg-border-color)' }}>
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                                  style={{ width: `${uploadFile.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                                {uploadFile.progress}%
                              </span>
                            </div>
                            {uploadFile.error && (
                              <p className="text-xs text-red-400 mt-1 font-diatype">
                                {uploadFile.error}
                              </p>
                            )}
                          </div>
                          {uploadFile.status === 'pending' && (
                            <button
                              onClick={() => removeUploadFile(uploadFile.id)}
                              className="p-1 rounded transition-colors hover:bg-[var(--hg-bg-card)]"
                              style={{ color: 'var(--hg-text-muted)' }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="e.g., AI Transformation Strategy Guide"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: formErrors.title ? 'rgb(239, 68, 68)' : 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                    {formErrors.title && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Provide a detailed description of the content..."
                      rows={3}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype resize-none"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                  </div>

                  {/* Access Level */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Access Level
                    </label>
                    <select
                      value={formData.accessLevel}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, accessLevel: e.target.value }))
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    >
                      {accessLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Associated Course */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Associated Course (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.associatedCourse}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, associatedCourse: e.target.value }))
                      }
                      placeholder="e.g., AI Transformation for Executives"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                  </div>

                  {/* Categories */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Categories/Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="px-3 py-1.5 rounded-lg text-sm font-diatype transition-all border"
                          style={{
                            backgroundColor: formData.selectedCategories.includes(category) ? 'var(--hg-cyan-bg)' : 'var(--hg-bg-secondary)',
                            borderColor: formData.selectedCategories.includes(category) ? 'var(--hg-cyan-border)' : 'var(--hg-border-color)',
                            color: formData.selectedCategories.includes(category) ? 'var(--hg-cyan-text)' : 'var(--hg-text-muted)'
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t hg-border">
                <Button variant="secondary" fullWidth onClick={handleCloseUploadModal}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleUpload}
                  disabled={uploadFiles.some((f) => f.status === 'uploading')}
                  icon={<Upload className="w-5 h-5" />}
                >
                  Upload Content
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="border rounded-2xl p-8 max-w-md w-full"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <Heading as="h3" size="2xl" className="mb-2">Delete Content?</Heading>
                <Text variant="muted">
                  Are you sure you want to delete this content? This action cannot be undone.
                </Text>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button variant="danger" fullWidth onClick={() => handleDeleteContent(showDeleteConfirm)}>
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
