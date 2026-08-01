import { useState } from 'react'
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BarChart3,
  User,
  LogOut,
  Video,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { APP_NAME } from '@/config/constants'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Meetings', icon: Calendar, path: '/meetings' },
  { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Profile', icon: User, path: '/profile' },
]

const Sidebar = () => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-screen shrink-0 glass-panel border-r border-white/[0.06] relative z-20"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06] shrink-0">
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shrink-0 glow-brand">
          <Video size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="ml-3 text-lg font-bold text-white tracking-tight whitespace-nowrap overflow-hidden">
            {APP_NAME.replace('Meet', '')}
            <span className="gradient-text">Meet</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 gradient-brand rounded-xl shadow-lg shadow-indigo-500/25"
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    />
                  )}
                  <Icon size={19} className="relative z-10 shrink-0" />
                  {!collapsed && (
                    <span className="relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden">
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-white/[0.06] space-y-1 shrink-0">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden md:flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors text-sm"
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-400/90 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  )
}

export default Sidebar
