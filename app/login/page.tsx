'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { Navigation } from '@/components/organisms/Navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Login failed')
      }

      // Redirect based on user role
      router.push(data.data.redirectPath)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (role: 'client' | 'instructor' | 'admin') => {
    // Demo credentials for each role
    const demoCredentials = {
      client: {
        email: 'demo.client@humanglue.com',
        password: 'DemoClient123!'
      },
      instructor: {
        email: 'demo.instructor@humanglue.com',
        password: 'DemoInstructor123!'
      },
      admin: {
        email: 'demo.admin@humanglue.com',
        password: 'DemoAdmin123!'
      }
    }

    const credentials = demoCredentials[role]

    // Auto-fill the form fields
    setEmail(credentials.email)
    setPassword(credentials.password)

    // Auto-submit after a brief delay to show the filled fields
    setTimeout(() => {
      setError('')
      setIsLoading(true)

      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            throw new Error(data.error?.message || 'Login failed')
          }
          router.push(data.data.redirectPath)
          router.refresh()
        })
        .catch((err: any) => {
          setError(err.message || 'Login failed. Please try again.')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.08),transparent_50%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-diatype">Client Portal Access</span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Welcome Back</h1>
              <p className="text-gray-400 font-diatype">Access your transformation dashboard</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-diatype"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                  />
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-gray-300">
                  <input
                    type="checkbox"
                    className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                  />
                  <span className="font-diatype">Remember me</span>
                </label>
                <Link href="/reset-password" className="text-purple-400 hover:text-purple-300 font-diatype">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 font-diatype">OR TRY A DEMO</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Demo Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('client')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-300 font-diatype"
              >
                Try Client Dashboard Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('instructor')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-300 font-diatype"
              >
                View Instructor Dashboard Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-300 font-diatype"
              >
                View Admin Dashboard Demo
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm font-diatype">
                Don't have an account?{' '}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Create one now
                </Link>
              </p>
            </div>

            {/* Or Start Assessment */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-gray-500 text-sm mb-3 font-diatype">New to Human Glue?</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all font-diatype"
              >
                Start Free Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm font-diatype">
              Need help? <Link href="/support" className="text-purple-400 hover:text-purple-300">Contact Support</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
