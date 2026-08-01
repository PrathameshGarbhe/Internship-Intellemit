import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { registerAPI } from '@/api/auth.api'
import { Eye, EyeOff, Check, X, Video, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { API_BASE_URL, APP_NAME } from '@/config/constants'
import Button from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'At least 1 uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'At least 1 number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'At least 1 special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

const RegisterPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRules, setShowRules] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const allRulesPassed = passwordRules.every((rule) => rule.test(form.password))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    if (!allRulesPassed) {
      setError('Password does not meet all requirements')
      return
    }
    try {
      setLoading(true)
      const res = await registerAPI(form)
      setAuth(res.user, res.accessToken)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side — Visual Panel */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0d1526] via-[#101b33] to-[#0b1120] border-r border-white/[0.06]">
        <div
          className="absolute w-96 h-96 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', top: '10%', right: '10%', filter: 'blur(70px)' }}
        />
        <div
          className="absolute w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', bottom: '10%', left: '10%', filter: 'blur(70px)' }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-20 h-20 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur">
            <Video size={36} className="text-indigo-300" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Join {APP_NAME}<br />
            <span className="gradient-text">Today</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Start collaborating smarter with your team.<br />
            AI-powered meetings await you.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '10x', label: 'Faster Notes' },
              { value: '100%', label: 'AI Powered' },
              { value: '0', label: 'Missed Tasks' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 border border-indigo-500/20 bg-indigo-500/[0.08]">
                <p className="text-2xl font-bold text-indigo-300">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-12 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full" />
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
          <p className="text-gray-500 text-sm mb-8">AI-Powered Meeting Platform</p>

          <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
          <p className="text-gray-400 mb-8">Join thousands of teams using {APP_NAME}</p>

          <div className="glass-card rounded-2xl p-8">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={() => (window.location.href = `${API_BASE_URL}/auth/google`)}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-medium py-3 rounded-xl transition-all mb-6 focus-ring"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-xs">or register with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Moiz Patel"
                  leftIcon={<User size={16} />}
                />
              </div>

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
                <Label>Password</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setShowRules(true)}
                  placeholder="Min. 8 characters"
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

                {showRules && (
                  <div className="mt-3 rounded-xl p-4 space-y-2 bg-white/[0.04] border border-white/10">
                    {passwordRules.map((rule) => {
                      const passed = rule.test(form.password)
                      return (
                        <div key={rule.label} className="flex items-center gap-2">
                          {passed ? (
                            <Check size={13} className="text-emerald-400 shrink-0" />
                          ) : (
                            <X size={13} className="text-red-400 shrink-0" />
                          )}
                          <span className={`text-xs ${passed ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {rule.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                isLoading={loading}
                disabled={loading || !allRulesPassed}
                className="w-full"
                size="lg"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage
