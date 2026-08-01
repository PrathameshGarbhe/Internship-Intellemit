import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Video } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const role = searchParams.get('role')
    const id = searchParams.get('id')

    if (token && name && email && role && id) {
      setAuth(
        {
          _id: id,
          name: decodeURIComponent(name),
          email: decodeURIComponent(email),
          role: role as any,
          createdAt: new Date().toISOString(),
        },
        token
      )
      navigate('/dashboard')
    } else {
      navigate('/login?error=google_failed')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-indigo-600/15 blur-[100px] rounded-full" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative"
      >
        <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 glow-brand">
          <Video size={26} className="text-white" />
        </div>
        <div className="w-10 h-10 border-[3px] border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-5" />
        <p className="text-white text-lg font-medium">Signing you in with Google...</p>
        <p className="text-gray-500 text-sm mt-1">Just a moment</p>
      </motion.div>
    </div>
  )
}

export default AuthCallbackPage
