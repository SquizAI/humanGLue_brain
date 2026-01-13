'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileSpreadsheet,
  Users,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Download,
  Trash2
} from 'lucide-react'

interface ParsedUser {
  email: string
  fullName?: string
  role?: string
  phone?: string
  jobTitle?: string
  companyName?: string
  organizationId?: string
  valid: boolean
  error?: string
}

interface ImportResult {
  success: boolean
  email: string
  userId?: string
  error?: string
  temporaryPassword?: string
  emailSent?: boolean
}

const VALID_ROLES = ['admin', 'instructor', 'expert', 'client', 'org_admin', 'team_lead', 'member']

export default function BulkImportPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([])
  const [defaultRole, setDefaultRole] = useState('client')
  const [sendInvites, setSendInvites] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Parse CSV content
  const parseCSV = useCallback((content: string): ParsedUser[] => {
    const lines = content.trim().split('\n')
    if (lines.length < 2) return []

    // Parse header
    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))
    const emailIndex = header.findIndex(h => h === 'email' || h === 'e-mail')
    const nameIndex = header.findIndex(h => h === 'name' || h === 'full_name' || h === 'fullname')
    const roleIndex = header.findIndex(h => h === 'role')
    const phoneIndex = header.findIndex(h => h === 'phone' || h === 'phone_number')
    const jobTitleIndex = header.findIndex(h => h === 'job_title' || h === 'jobtitle' || h === 'title')
    const companyIndex = header.findIndex(h => h === 'company' || h === 'company_name')

    if (emailIndex === -1) {
      return [{ email: '', valid: false, error: 'CSV must have an "email" column' }]
    }

    const users: ParsedUser[] = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Handle quoted fields properly
      const values: string[] = []
      let current = ''
      let inQuotes = false
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())

      const email = values[emailIndex]?.replace(/"/g, '').trim()
      const role = roleIndex !== -1 ? values[roleIndex]?.replace(/"/g, '').trim().toLowerCase() : undefined

      const user: ParsedUser = {
        email,
        fullName: nameIndex !== -1 ? values[nameIndex]?.replace(/"/g, '').trim() : undefined,
        role,
        phone: phoneIndex !== -1 ? values[phoneIndex]?.replace(/"/g, '').trim() : undefined,
        jobTitle: jobTitleIndex !== -1 ? values[jobTitleIndex]?.replace(/"/g, '').trim() : undefined,
        companyName: companyIndex !== -1 ? values[companyIndex]?.replace(/"/g, '').trim() : undefined,
        valid: true,
      }

      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        user.valid = false
        user.error = 'Invalid email address'
      }

      // Validate role if provided
      if (role && !VALID_ROLES.includes(role)) {
        user.valid = false
        user.error = `Invalid role: ${role}`
      }

      users.push(user)
    }

    return users
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile)
    setImportResults(null)

    const content = await selectedFile.text()
    const users = parseCSV(content)
    setParsedUsers(users)
  }, [parseCSV])

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        handleFileSelect(droppedFile)
      }
    }
  }, [handleFileSelect])

  // Remove a user from the list
  const removeUser = useCallback((index: number) => {
    setParsedUsers(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Perform the import
  const handleImport = async () => {
    const validUsers = parsedUsers.filter(u => u.valid)
    if (validUsers.length === 0) return

    setImporting(true)
    try {
      const response = await fetch('/api/admin/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: validUsers.map(u => ({
            email: u.email,
            fullName: u.fullName,
            role: u.role || defaultRole,
            phone: u.phone,
            jobTitle: u.jobTitle,
            companyName: u.companyName,
          })),
          sendInvites,
          defaultRole,
        }),
      })

      const data = await response.json()
      if (data.data?.results) {
        setImportResults(data.data.results)
      }
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setImporting(false)
    }
  }

  // Download sample CSV template
  const downloadTemplate = () => {
    const template = `email,name,role,phone,job_title,company
john@example.com,John Doe,client,555-0100,Manager,Acme Inc
jane@example.com,Jane Smith,expert,555-0101,Consultant,Tech Corp`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const validCount = parsedUsers.filter(u => u.valid).length
  const invalidCount = parsedUsers.filter(u => !u.valid).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/users')}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Bulk Import Users</h1>
            <p className="text-slate-400">Import multiple users from a CSV file</p>
          </div>
        </div>

        {/* Import Results */}
        {importResults && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Import Results</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {importResults.filter(r => r.success).length}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">Successful</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {importResults.filter(r => !r.success).length}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">Failed</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Mail className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {importResults.filter(r => r.emailSent).length}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">Emails Sent</p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {importResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.success
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-white">{result.email}</span>
                  </div>
                  {result.error && (
                    <span className="text-sm text-red-400">{result.error}</span>
                  )}
                  {result.success && !result.emailSent && result.temporaryPassword && (
                    <span className="text-sm text-amber-400 font-mono">
                      Temp: {result.temporaryPassword}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setFile(null)
                  setParsedUsers([])
                  setImportResults(null)
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Import More
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                View All Users
              </button>
            </div>
          </motion.div>
        )}

        {/* Upload Area */}
        {!importResults && (
          <>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-4">
                {file ? (
                  <FileSpreadsheet className="w-12 h-12 text-emerald-400" />
                ) : (
                  <Upload className="w-12 h-12 text-slate-400" />
                )}
                <div>
                  {file ? (
                    <p className="text-lg font-medium text-white">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-lg font-medium text-white">
                        Drop your CSV file here or click to browse
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Supports CSV files with email, name, role, phone, job_title, company columns
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>
            </div>

            {/* Preview Table */}
            {parsedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                {/* Stats */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-5 h-5" />
                    <span>{parsedUsers.length} users found</span>
                  </div>
                  {validCount > 0 && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>{validCount} valid</span>
                    </div>
                  )}
                  {invalidCount > 0 && (
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-4 h-4" />
                      <span>{invalidCount} invalid</span>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Default Role</label>
                      <select
                        value={defaultRole}
                        onChange={(e) => setDefaultRole(e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {VALID_ROLES.map(role => (
                          <option key={role} value={role}>
                            {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendInvites}
                        onChange={(e) => setSendInvites(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-300">Send invitation emails</span>
                    </label>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800/80 border-b border-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Company</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      <AnimatePresence mode="popLayout">
                        {parsedUsers.map((user, index) => (
                          <motion.tr
                            key={`${user.email}-${index}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className={user.valid ? '' : 'bg-red-500/5'}
                          >
                            <td className="px-4 py-3">
                              {user.valid ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-red-400" />
                                  {user.error && (
                                    <span className="text-xs text-red-400">{user.error}</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                            <td className="px-4 py-3 text-sm text-slate-300">{user.fullName || '-'}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs font-medium bg-slate-700 text-slate-300 rounded">
                                {user.role || defaultRole}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-300">{user.companyName || '-'}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => removeUser(index)}
                                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Import Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleImport}
                    disabled={validCount === 0 || importing}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      validCount === 0 || importing
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                  >
                    {importing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Import {validCount} Users
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
