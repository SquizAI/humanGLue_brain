'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle2, Mail, UserPlus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function InviteUserPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin' | 'instructor' | 'expert' | 'client'>('client')
  const [organizationName, setOrganizationName] = useState('HumanGlue')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fullName,
          role,
          organizationName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to invite user')
      }

      setSuccess(true)
      setInvitedEmail(email)

      // Reset form
      setEmail('')
      setFullName('')
      setRole('client')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invite New User</h1>
        <p className="text-gray-600">
          Send an invitation email with login credentials to a new user
        </p>
      </div>

      {success && invitedEmail && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Invitation sent!</AlertTitle>
          <AlertDescription className="text-green-700">
            An email with login credentials has been sent to <strong>{invitedEmail}</strong>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            User Information
          </CardTitle>
          <CardDescription>
            Enter the new user's details and select their role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Optional - will default to email username if not provided
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)} disabled={loading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Client</span>
                      <span className="text-xs text-gray-500">Access courses and track learning</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="instructor">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Instructor</span>
                      <span className="text-xs text-gray-500">Create and manage courses</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="expert">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Expert</span>
                      <span className="text-xs text-gray-500">Provide expert insights</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Admin</span>
                      <span className="text-xs text-gray-500">Full platform administration</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="HumanGlue"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Will appear in the invitation email
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-1">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• A temporary password will be generated automatically</li>
                    <li>• An invitation email will be sent to the user</li>
                    <li>• They can log in immediately using the provided credentials</li>
                    <li>• They'll be prompted to change their password on first login</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail('')
                  setFullName('')
                  setRole('client')
                  setOrganizationName('HumanGlue')
                  setError(null)
                  setSuccess(false)
                }}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Role Descriptions</h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Client:</dt>
            <dd className="text-gray-600">Can access courses, track learning progress, and view their dashboard</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Instructor:</dt>
            <dd className="text-gray-600">Can create courses, manage content, track student progress, plus all client permissions</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Expert:</dt>
            <dd className="text-gray-600">Can provide expert consultations, insights, and guidance to clients</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Admin:</dt>
            <dd className="text-gray-600">Full platform access including user management, settings, and all features</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
