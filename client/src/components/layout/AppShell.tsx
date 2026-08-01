import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BarChart3,
  User,
  LogOut,
  Video,
  X,
} from 'lucide-react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useAuthStore } from '@/store/authStore'
import { APP_NAME } from '@/config/constants'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Meetings', icon: Calendar, path: '/meetings' },
  { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Profile', icon: User, path: '/profile' },
]

const MobileDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login')
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute left-0 top-0 h-full w-72 glass-panel border-r border-white/[0.08] flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center glow-brand">
                  <Video size={17} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  {APP_NAME.replace('Meet', '')}
                  <span className="gradient-text">Meet</span>
                </span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors text-sm font-medium ${
                        isActive ? 'gradient-brand text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                      }`
                    }
                  >
                    <Icon size={19} />
                    {item.name}
                  </NavLink>
                )
              })}
            </nav>
            <div className="p-3 border-t border-white/[0.06]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

const AppShell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setDrawerOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppShell
