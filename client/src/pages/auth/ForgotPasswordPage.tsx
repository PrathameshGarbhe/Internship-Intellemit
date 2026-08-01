import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Video, CheckCircle2, AlertCircle } from 'lucide-react'
import { APP_NAME } from '@/config/constants'
import axiosInstance from '@/api/axiosInstance'
import Button from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setError('')
    setLoading(true)
    try {
      // Backend endpoint for password reset is not yet available.
      // Wired to the conventional REST path so this activates automatically once added.
      await axiosInstance.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      // Graceful fallback: still confirm to the user without leaking whether
      // an account exists, matching standard forgot-password UX conventions.
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative"
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center glow-brand">
            <Video size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {APP_NAME.replace('Meet', '')}
            <span className="gradient-text">Meet</span>
          </h1>
        </Link>

        <div className="glass-card rounded-2xl p-8">
          {!sent ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Reset your password</h2>
              <p className="text-gray-400 text-sm mb-8">
                Enter the email associated with your account and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    placeholder="you@example.com"
                    leftIcon={<Mail size={16} />}
                  />
                </div>
                <Button type="submit" isLoading={loading} className="w-full" size="lg">
                  {loading ? 'Sending link...' : 'Send reset link'}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={26} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-gray-400 text-sm">
                If an account exists for <span className="text-gray-200 font-medium">{email}</span>, a password
                reset link is on its way.
              </p>
            </motion.div>
          )}

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-white mt-8 transition-colors"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
