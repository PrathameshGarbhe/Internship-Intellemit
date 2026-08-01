import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { loginAPI } from '@/api/auth.api'
import { Eye, EyeOff, Video, Mail, Lock, AlertCircle } from 'lucide-react'
import { API_BASE_URL, APP_NAME } from '@/config/constants'
import Button from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      const res = await loginAPI(form)
      setAuth(res.user, res.accessToken)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-12 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md relative"
        >
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center glow-brand">
              <Video size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {APP_NAME.replace('Meet', '')}<span className="gradient-text">Meet</span>
            </h1>
          </Link>
          <p className="text-gray-500 text-sm mb-10">AI-Powered Meeting Platform</p>

          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400 mb-8">Sign in to continue to {APP_NAME}</p>

          {/* Glass Card */}
          <div className="glass-card rounded-2xl p-8">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => (window.location.href = `${API_BASE_URL}/auth/google`)}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-medium py-3 rounded-xl transition-all mb-6 focus-ring"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-xs">or sign in with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  leftIcon={<Mail size={16} />}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="mb-0">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  leftIcon={<Lock size={16} />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer rounded"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-400 cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              <Button type="submit" isLoading={loading} className="w-full" size="lg">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right side — Visual Panel */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0d1526] via-[#101b33] to-[#0b1120] border-l border-white/[0.06]">
        <div
          className="absolute w-96 h-96 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', top: '10%', left: '10%', filter: 'blur(70px)' }}
        />
        <div
          className="absolute w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', bottom: '10%', right: '10%', filter: 'blur(70px)' }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-20 h-20 gradient-brand/20 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur">
            <Video size={36} className="text-indigo-300" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Meet Smarter<br />
            <span className="gradient-text">with AI</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Real-time transcription, smart summaries,<br />
            and automatic action items — all powered by AI.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            {['🎥 Video Meetings', '🤖 AI Summaries', '💬 Live Chat', '📋 Task Board'].map((f) => (
              <span
                key={f}
                className="px-4 py-2 rounded-full text-sm text-indigo-300 border border-indigo-500/30 bg-indigo-500/10"
              >
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
