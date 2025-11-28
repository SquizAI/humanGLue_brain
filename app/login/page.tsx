'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock, ArrowRight, Sparkles, TrendingUp, Users, Zap } from 'lucide-react'
import Image from 'next/image'

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
      // Clear any stale auth data before attempting login
      if (typeof window !== 'undefined') {
        const authKey = 'sb-egqqdscvxvtwcdwknbnt-auth-token'
        const existingAuth = localStorage.getItem(authKey)
        if (existingAuth) {
          console.log('[handleLogin] Clearing existing auth data before login')
          localStorage.removeItem(authKey)
        }
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      console.log('[handleLogin] Full response:', data)
      console.log('[handleLogin] Redirect path:', data.data?.redirectPath)

      if (!data.success) {
        throw new Error(data.error?.message || 'Login failed')
      }

      // Redirect based on user role - use window.location to ensure cookies are set
      console.log('[handleLogin] Executing window.location.href to:', data.data.redirectPath)
      window.location.href = data.data.redirectPath
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

    // Set the form fields
    setEmail(credentials.email)
    setPassword(credentials.password)

    // Use the normal login flow
    setError('')
    setIsLoading(true)

    try {
      // Clear any stale auth data before attempting login
      if (typeof window !== 'undefined') {
        const authKey = 'sb-egqqdscvxvtwcdwknbnt-auth-token'
        const existingAuth = localStorage.getItem(authKey)
        if (existingAuth) {
          console.log('[handleDemoLogin] Clearing existing auth data before login')
          localStorage.removeItem(authKey)
        }
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      console.log('[handleDemoLogin] Role:', role)
      console.log('[handleDemoLogin] Full response:', data)
      console.log('[handleDemoLogin] Redirect path:', data.data?.redirectPath)

      if (!data.success) {
        throw new Error(data.error?.message || 'Login failed')
      }

      // Redirect based on user role - use window.location to ensure cookies are set
      console.log('[handleDemoLogin] Executing window.location.href to:', data.data.redirectPath)
      window.location.href = data.data.redirectPath
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Side - Information Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),transparent_50%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          {/* Logo */}
          <Link href="/" className="mb-12 inline-block">
            <Image
              src="/HumnaGlue_logo_white_blue.png"
              alt="HumanGlue"
              width={200}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-white mb-6 font-gendy leading-tight">
              Welcome Back to Your AI Transformation Journey
            </h1>
            <p className="text-xl text-gray-300 mb-12 font-diatype leading-relaxed">
              Access your personalized dashboard and continue building AI maturity across your organization.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2 font-gendy">Track Progress</h3>
              <p className="text-gray-400 text-sm font-diatype">Monitor your AI maturity level and growth</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2 font-gendy">AI Workflows</h3>
              <p className="text-gray-400 text-sm font-diatype">Deploy ready-to-use automation</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2 font-gendy">Expert Network</h3>
              <p className="text-gray-400 text-sm font-diatype">Connect with AI transformation leaders</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2 font-gendy">Live Workshops</h3>
              <p className="text-gray-400 text-sm font-diatype">Interactive sessions with experts</p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-white mb-1 font-gendy">500+</div>
                <div className="text-sm text-gray-400 font-diatype">Organizations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1 font-gendy">10K+</div>
                <div className="text-sm text-gray-400 font-diatype">Users Trained</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1 font-gendy">95%</div>
                <div className="text-sm text-gray-400 font-diatype">Satisfaction</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 lg:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden mb-8 inline-block">
            <Image
              src="/HumnaGlue_logo_white_blue.png"
              alt="HumanGlue"
              width={180}
              height={50}
              className="h-10 w-auto"
            />
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 font-gendy">Sign In</h2>
            <p className="text-gray-400 font-diatype">Access your transformation dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-diatype"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
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
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                  style={{ fontSize: '16px' }}
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
                  autoComplete="current-password"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                  style={{ fontSize: '16px' }}
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
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
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

          {/* Demo Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => handleDemoLogin('client')}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all font-diatype text-sm"
            >
              Try Client Demo
            </button>
            <button
              onClick={() => handleDemoLogin('instructor')}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all font-diatype text-sm"
            >
              Try Instructor Demo
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all font-diatype text-sm"
            >
              Try Admin Demo
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm font-diatype">
              Don't have an account?{' '}
              <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
                Create one now →
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors font-diatype"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
