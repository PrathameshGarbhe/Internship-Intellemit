import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Users, Clock, Plus, Trash2, Video, CheckCircle, AlertCircle } from 'lucide-react'
import { API_BASE_URL } from '@/config/constants'
import { apiFetch } from '@/api/apiFetch'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { Input, Label } from '@/components/ui/Input'
import { SkeletonCard } from '@/components/ui/Skeleton'

const API_BASE = `${API_BASE_URL}/meetings`

interface Meeting {
  _id: string
  title: string
  host: { name: string; email: string }
  scheduledAt: string
  status: 'scheduled' | 'active' | 'ended'
  meetingCode: string
  participants: { _id: string }[]
}

const getMeetingDisplayStatus = (meeting: Meeting) => {
  if (meeting.status === 'ended') return 'ended'
  const now = new Date()
  const scheduled = new Date(meeting.scheduledAt)
  const diffMs = scheduled.getTime() - now.getTime()
  const diffMins = diffMs / 60000
  if (diffMins <= 10 && diffMins > 0) return 'starting-soon'
  if (diffMins <= 0) return 'active'
  return 'scheduled'
}

const statusConfig: Record<string, { label: string; tone: 'success' | 'brand' | 'warning' | 'neutral'; pulse?: boolean }> = {
  active: { label: 'Active', tone: 'success' },
  'starting-soon': { label: 'Starting Soon', tone: 'brand', pulse: true },
  scheduled: { label: 'Scheduled', tone: 'warning' },
  ended: { label: 'Ended', tone: 'neutral' },
}

const MeetingPage = () => {
  const { token, user } = useAuthStore()
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled' | 'ended'>('all')
  const [, setTick] = useState(0)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchMeetings = async () => {
    setLoading(true)
    try {
      const res = await apiFetch(API_BASE, { headers })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setMeetings(data.data)
      }
    } catch {
      setError('Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async () => {
    if (!title || !scheduledDate || !scheduledTime) return
    setCreating(true)
    try {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      const res = await apiFetch(API_BASE, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, scheduledAt }),
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        setTitle('')
        setScheduledDate('')
        setScheduledTime('')
        fetchMeetings()
      }
    } catch {
      setError('Failed to create meeting')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Delete this meeting?')) return
    try {
      await apiFetch(`${API_BASE}/${meetingId}`, { method: 'DELETE', headers })
      fetchMeetings()
    } catch {
      setError('Failed to delete meeting')
    }
  }

  const handleMarkEnded = async (meetingId: string) => {
    try {
      await apiFetch(`${API_BASE}/${meetingId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'ended' }),
      })
      fetchMeetings()
    } catch {
      setError('Failed to update meeting status')
    }
  }

  const handleJoin = (meetingId: string, meetingCode: string, meetingTitle: string, hostEmail: string) => {
    const isHost = user?.email === hostEmail
    navigate(`/pre-join/${meetingCode}`, { state: { meetingTitle, isHost } })
  }

  const filteredMeetings = meetings.filter((m) => {
    const displayStatus = getMeetingDisplayStatus(m)
    if (filter === 'active') return displayStatus === 'active' || displayStatus === 'starting-soon'
    if (filter === 'scheduled') return displayStatus === 'scheduled'
    if (filter === 'ended') return displayStatus === 'ended'
    return true
  })

  const totalMeetings = meetings.length
  const activeMeetings = meetings.filter((m) => getMeetingDisplayStatus(m) === 'active').length
  const scheduledMeetings = meetings.filter((m) => getMeetingDisplayStatus(m) === 'scheduled').length

  const closeModal = () => {
    setShowModal(false)
    setTitle('')
    setScheduledDate('')
    setScheduledTime('')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Meetings</h1>
          <p className="text-gray-400 mt-1.5 text-sm">Create and manage your meetings</p>
        </div>
        <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={16} />}>
          Create Meeting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Video size={16} className="text-indigo-400" />
                </div>
                <span className="text-gray-400 text-sm">Total Meetings</span>
              </div>
              <p className="text-3xl font-semibold text-white">{totalMeetings}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Users size={16} className="text-emerald-400" />
                </div>
                <span className="text-gray-400 text-sm">Active Now</span>
              </div>
              <p className="text-3xl font-semibold text-white">{activeMeetings}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock size={16} className="text-amber-400" />
                </div>
                <span className="text-gray-400 text-sm">Scheduled</span>
              </div>
              <p className="text-3xl font-semibold text-white">{scheduledMeetings}</p>
            </Card>
          </>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl w-fit mb-6 border border-white/[0.06]">
        {(['all', 'active', 'scheduled', 'ended'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-4 py-1.5 rounded-lg capitalize transition-all duration-200 ${
              filter === f ? 'gradient-brand text-white shadow' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Meetings List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse h-24" />
          ))}
        </div>
      ) : filteredMeetings.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Video size={22} />}
            title="No meetings found"
            description={filter === 'all' ? 'Create one to get started' : `No ${filter} meetings`}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMeetings.map((meeting, i) => {
            const displayStatus = getMeetingDisplayStatus(meeting)
            const config = statusConfig[displayStatus]
            const isMyMeeting = user?.email === meeting.host?.email

            return (
              <motion.div
                key={meeting._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className={`glass-card rounded-2xl p-6 transition-all duration-200 ${
                  displayStatus === 'starting-soon'
                    ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    : 'hover:border-white/[0.16]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-white">{meeting.title}</h2>
                      <Badge tone={config.tone} pulse={config.pulse}>
                        {config.label}
                      </Badge>
                      {isMyMeeting && <Badge tone="brand">Host</Badge>}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} />
                        {meeting.host?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(meeting.scheduledAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(meeting.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={14} />
                        {meeting.participants?.length || 0} participants
                      </span>
                    </div>

                    <div className="mt-2">
                      <span className="text-xs text-gray-600">Code: </span>
                      <span className="text-xs font-mono text-indigo-400">{meeting.meetingCode}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isMyMeeting && displayStatus !== 'ended' && displayStatus !== 'scheduled' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkEnded(meeting._id)}
                        leftIcon={<CheckCircle size={13} />}
                      >
                        End
                      </Button>
                    )}
                    {isMyMeeting && (
                      <button
                        onClick={() => handleDelete(meeting._id)}
                        className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    {displayStatus !== 'ended' && (
                      <Button
                        size="sm"
                        variant={displayStatus === 'starting-soon' || displayStatus === 'active' ? 'primary' : 'secondary'}
                        onClick={() => handleJoin(meeting._id, meeting.meetingCode, meeting.title, meeting.host?.email)}
                        leftIcon={<Video size={14} />}
                      >
                        {displayStatus === 'starting-soon' ? 'Join Now' : 'Join'}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create Meeting Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title="Create Meeting">
        <div className="p-6 space-y-4">
          <div>
            <Label>Meeting Title</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint Planning"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={closeModal} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              isLoading={creating}
              disabled={creating || !title || !scheduledDate || !scheduledTime}
              className="flex-1"
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MeetingPage
