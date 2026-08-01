import { useEffect, useRef, useState } from 'react'
import { Bell, Search, Menu, LogOut, User as UserIcon, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface NavbarProps {
  onMenuClick?: () => void
}

const notifications = [
  { id: 1, title: 'Sprint Planning starts in 10 min', time: 'Just now', unread: true },
  { id: 2, title: 'New task assigned to you', time: '1h ago', unread: true },
  { id: 3, title: 'Weekly analytics report is ready', time: 'Yesterday', unread: false },
]

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 glass-panel border-b border-white/[0.06] flex items-center justify-between px-4 md:px-6 gap-4 relative z-30 shrink-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-300 hover:text-white p-2 -ml-2 rounded-lg hover:bg-white/[0.06]"
        >
          <Menu size={20} />
        </button>

        <div className="relative hidden sm:block w-full max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search meetings, tasks..."
            className="bg-white/[0.05] text-white placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-xl w-full outline-none border border-white/10 focus-ring text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs((s) => !s); setShowProfile(false) }}
            className="relative text-gray-300 hover:text-white p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0b1120]" />
            )}
          </button>
          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="text-xs text-indigo-300">{unreadCount} new</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />}
                        <div className={n.unread ? '' : 'pl-3.5'}>
                          <p className="text-sm text-gray-200 leading-snug">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile((s) => !s); setShowNotifs(false) }}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-white text-sm font-medium hidden sm:block max-w-[120px] truncate">
              {user?.name}
            </span>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <UserIcon size={16} /> Profile settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

export default Navbar
