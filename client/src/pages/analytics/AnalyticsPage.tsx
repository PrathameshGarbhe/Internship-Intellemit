import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts'
import { Video, Users, CheckSquare, Clock, Brain, AlertTriangle } from 'lucide-react'
import { API_BASE_URL } from '@/config/constants'
import { apiFetch } from '@/api/apiFetch'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'

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

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  purple: 'bg-purple-500/10 text-purple-400',
  amber: 'bg-amber-500/10 text-amber-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
  red: 'bg-red-500/10 text-red-400',
}

const AnalyticsPage = () => {
  const { token } = useAuthStore()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('1M')

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, tRes] = await Promise.all([
          apiFetch(`${API_BASE}/meetings`, { headers }),
          apiFetch(`${API_BASE}/tasks`, { headers }),
        ])
        const mData = await mRes.json()
        const tData = await tRes.json()
        if (mData.success) setMeetings(mData.data)
        if (tData.success && Array.isArray(tData.data)) setTasks(tData.data)
      } catch {
        console.error('Failed to fetch analytics data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stats
  const totalMeetings = meetings.length
  const uniqueParticipants = new Set(meetings.flatMap(m => m.participants?.map(p => p._id) || [])).size
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const totalTasks = tasks.length
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const endedMeetings = meetings.filter(m => m.status === 'ended').length

  const stats = [
    { title: 'Total Meetings', value: String(totalMeetings), subtitle: 'All time', icon: Video, color: 'indigo' },
    { title: 'Participants', value: String(uniqueParticipants), subtitle: 'Unique across meetings', icon: Users, color: 'emerald' },
    { title: 'AI Summaries', value: '0', subtitle: 'Coming soon', icon: Brain, color: 'purple' },
    { title: 'Task Completion', value: `${taskCompletionRate}%`, subtitle: 'Across all tasks', icon: CheckSquare, color: 'amber' },
    { title: 'Total Tasks', value: String(totalTasks), subtitle: `${completedTasks} completed`, icon: Clock, color: 'cyan' },
    { title: 'Ended Meetings', value: String(endedMeetings), subtitle: 'Completed sessions', icon: AlertTriangle, color: 'red' },
  ]

  // Weekly meeting activity chart data
  const getWeeklyData = () => {
    const weeks: Record<string, { meetings: number; participants: number }> = {}
    const now = new Date()
    const weeksCount = range === '1M' ? 4 : range === '3M' ? 12 : range === '6M' ? 24 : 52

    for (let i = weeksCount - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const label = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('default', { month: 'short' })}`
      weeks[label] = { meetings: 0, participants: 0 }
    }

    meetings.forEach(m => {
      const d = new Date(m.scheduledAt)
      const label = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('default', { month: 'short' })}`
      if (weeks[label]) {
        weeks[label].meetings += 1
        weeks[label].participants += m.participants?.length || 0
      }
    })

    return Object.entries(weeks).map(([week, data]) => ({ week, ...data }))
  }

  // Task chart data
  const taskChartData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, fill: '#6366f1' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, fill: '#f59e0b' },
    { name: 'Completed', value: completedTasks, fill: '#10b981' },
  ]

  // Recent meetings
  const recentMeetings = [...meetings]
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 7)

  const weeklyData = getWeeklyData()

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Analytics Overview</h1>
        <p className="text-gray-400 mt-1.5 text-sm">Track meeting activity, task performance and engagement.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/75 mt-1">{stat.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.subtitle}</p>
                </Card>
              )
            })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
        {/* Meeting Activity Chart */}
        <Card className="xl:col-span-3 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Meeting Activity</h2>
              <p className="text-sm text-gray-400 mt-0.5">Weekly sessions and participants</p>
            </div>
            <div className="flex gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/[0.06]">
              {['1M', '3M', '6M', '1Y'].map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    range === r ? 'gradient-brand text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
              <Area type="monotone" dataKey="meetings" stroke="#818cf8" strokeWidth={2} fill="rgba(129,140,248,0.12)" dot={false} />
              <Area type="monotone" dataKey="participants" stroke="#22d3ee" strokeWidth={2} fill="rgba(34,211,238,0.1)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Task Chart */}
        <Card className="xl:col-span-2 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Task Overview</h2>
            <p className="text-sm text-gray-400 mt-0.5">Current status breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={taskChartData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {taskChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Meetings Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Recent Meetings</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-white/[0.04] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentMeetings.length === 0 ? (
          <EmptyState icon={<Video size={22} />} title="No meetings yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Meeting', 'Host', 'Participants', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs text-white/30 font-medium pb-3 pr-6 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentMeetings.map(meeting => (
                  <tr key={meeting._id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 pr-6 font-medium text-white/80">{meeting.title}</td>
                    <td className="py-3.5 pr-6 text-white/50">{meeting.host?.name || 'Unknown'}</td>
                    <td className="py-3.5 pr-6 text-white/50">{meeting.participants?.length || 0}</td>
                    <td className="py-3.5 pr-6 text-white/50">
                      {new Date(meeting.scheduledAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5">
                      <Badge
                        tone={
                          meeting.status === 'ended'
                            ? 'neutral'
                            : meeting.status === 'active'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default AnalyticsPage
