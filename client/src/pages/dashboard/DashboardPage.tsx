import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Video,
  Users,
  CheckSquare,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { API_BASE_URL } from '@/config/constants'
import { apiFetch } from '@/api/apiFetch'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton'

const API_BASE = API_BASE_URL

interface Meeting {
  _id: string
  title: string
  host: { name: string; email: string }
  scheduledAt: string
  status: 'scheduled' | 'active' | 'ended'
  meetingCode: string
  participants: { _id: string }[]
}

interface Task {
  _id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignedTo: string
  dueDate: string
}

const getMeetingStatus = (meeting: Meeting) => {
  if (meeting.status === 'ended') return 'ended'
  const now = new Date()
  const scheduled = new Date(meeting.scheduledAt)
  const diffMins = (scheduled.getTime() - now.getTime()) / 60000
  if (diffMins <= 10 && diffMins > 0) return 'starting-soon'
  if (diffMins <= 0) return 'active'
  return 'scheduled'
}

const statusConfig: Record<string, { label: string; tone: 'success' | 'brand' | 'warning' | 'neutral' }> = {
  active: { label: 'Active', tone: 'success' },
  'starting-soon': { label: 'Starting Soon', tone: 'brand' },
  scheduled: { label: 'Scheduled', tone: 'warning' },
  ended: { label: 'Ended', tone: 'neutral' },
}

const DashboardPage = () => {
  const { user, token } = useAuthStore()
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingsRes, tasksRes] = await Promise.all([
          apiFetch(`${API_BASE}/meetings`, { headers }),
          apiFetch(`${API_BASE}/tasks`, { headers }),
        ])
        const meetingsData = await meetingsRes.json()
        const tasksData = await tasksRes.json()
        if (meetingsData.success) setMeetings(meetingsData.data)
        if (tasksData.success && Array.isArray(tasksData.data)) setTasks(tasksData.data)
      } catch {
        console.error('Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalMeetings = meetings.length
  const activeMeetings = meetings.filter((m) => getMeetingStatus(m) === 'active').length
  const pendingTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'in-progress').length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const uniqueParticipants = new Set(meetings.flatMap((m) => m.participants?.map((p) => p._id) || [])).size
  const recentMeetings = [...meetings]
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 5)
  const upcomingMeetings = meetings
    .filter((m) => getMeetingStatus(m) === 'scheduled' || getMeetingStatus(m) === 'starting-soon')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3)

  const highPriorityOpen = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const summaryLines = useMemo(() => {
    const lines: string[] = []
    if (upcomingMeetings.length > 0) {
      lines.push(
        `You have ${upcomingMeetings.length} upcoming meeting${upcomingMeetings.length > 1 ? 's' : ''}, starting with "${upcomingMeetings[0].title}".`
      )
    } else {
      lines.push('No meetings are scheduled right now — a good time to plan your next sync.')
    }
    if (highPriorityOpen > 0) {
      lines.push(`${highPriorityOpen} high-priority task${highPriorityOpen > 1 ? 's are' : ' is'} still open.`)
    }
    lines.push(
      tasks.length > 0
        ? `Task completion is trending at ${taskCompletionRate}% across ${tasks.length} tracked tasks.`
        : 'Create your first task board item to start tracking progress.'
    )
    return lines
  }, [upcomingMeetings, highPriorityOpen, tasks.length, taskCompletionRate])

  const stats = [
    {
      label: 'Total Meetings',
      value: totalMeetings,
      sub: `${activeMeetings} active now`,
      icon: Video,
      tone: 'text-indigo-400 bg-indigo-500/10',
    },
    {
      label: 'Participants',
      value: uniqueParticipants,
      sub: 'Across all meetings',
      icon: Users,
      tone: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'Pending Tasks',
      value: pendingTasks,
      sub: `${completedTasks} completed`,
      icon: CheckSquare,
      tone: 'text-amber-400 bg-amber-500/10',
    },
    {
      label: 'Upcoming',
      value: upcomingMeetings.length,
      sub: 'Scheduled meetings',
      icon: Clock,
      tone: 'text-purple-400 bg-purple-500/10',
    },
  ]

  return (
    <div>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">Here's what's happening with your team today.</p>
        </div>
        <button
          onClick={() => navigate('/meetings')}
          className="hidden sm:inline-flex items-center gap-2 gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all"
        >
          <Video size={16} /> New Meeting
        </button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} animated delay={i * 0.05} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.tone}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>
                </Card>
              )
            })}
      </div>

      {/* AI Summary widget */}
      <Card animated delay={0.15} className="p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-600/15 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex items-start gap-4 relative">
          <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center shrink-0 glow-brand">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-white font-semibold">AI Summary</h2>
              <Badge tone="brand">Beta</Badge>
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-3.5 w-full max-w-md bg-white/[0.06] rounded animate-pulse" />
                <div className="h-3.5 w-3/4 max-w-sm bg-white/[0.06] rounded animate-pulse" />
              </div>
            ) : (
              <ul className="space-y-1.5">
                {summaryLines.map((line, i) => (
                  <li key={i} className="text-sm text-gray-300 leading-relaxed flex items-start gap-2">
                    <TrendingUp size={13} className="text-indigo-400 mt-1 shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <Card animated delay={0.2} className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Upcoming Meetings</h2>
            <button
              onClick={() => navigate('/meetings')}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <EmptyState
              icon={<Calendar size={22} />}
              title="No upcoming meetings"
              action={
                <button
                  onClick={() => navigate('/meetings')}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  Create one →
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => {
                const status = getMeetingStatus(meeting)
                const config = statusConfig[status]
                return (
                  <div
                    key={meeting._id}
                    className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{meeting.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(meeting.scheduledAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(meeting.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Badge tone={config.tone}>{config.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Recent Meetings */}
        <Card animated delay={0.25} className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Recent Meetings</h2>
            <button
              onClick={() => navigate('/meetings')}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : recentMeetings.length === 0 ? (
            <EmptyState icon={<Video size={22} />} title="No meetings yet" />
          ) : (
            <div className="space-y-3">
              {recentMeetings.map((meeting) => {
                const status = getMeetingStatus(meeting)
                const config = statusConfig[status]
                return (
                  <div
                    key={meeting._id}
                    className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{meeting.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Host: {meeting.host?.name} • {meeting.participants?.length || 0} participants
                      </p>
                    </div>
                    <Badge tone={config.tone}>{config.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
