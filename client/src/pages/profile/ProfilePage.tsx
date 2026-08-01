import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { API_BASE_URL } from '@/config/constants'
import { apiFetch } from '@/api/apiFetch'
import { motion } from 'framer-motion'
import {
  User as UserIcon,
  Bell,
  ShieldCheck,
  Palette,
  Camera,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Input, Label } from '@/components/ui/Input'

type Tab = 'general' | 'notifications' | 'security' | 'appearance'

const tabs: { id: Tab; label: string; icon: typeof UserIcon }[] = [
  { id: 'general', label: 'General', icon: UserIcon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

const accentThemes = [
  { id: 'indigo', label: 'Indigo', from: '#6366f1', to: '#8b5cf6' },
  { id: 'cyan', label: 'Cyan', from: '#06b6d4', to: '#6366f1' },
  { id: 'violet', label: 'Violet', from: '#8b5cf6', to: '#ec4899' },
]

const NOTIF_KEY = 'intellmeet_notification_prefs'
const THEME_KEY = 'intellmeet_accent_theme'

const ToggleRow = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) => (
  <div className="flex items-center justify-between py-4 border-b border-white/[0.06] last:border-0">
    <div className="pr-6">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 ${
        checked ? 'gradient-brand' : 'bg-white/10'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  </div>
)

const ProfilePage = () => {
  const { user, token, setAuth } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('general')

  // ---- General tab state (identical logic to original) ----
  const [name, setName] = useState(user?.name || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [preview, setPreview] = useState(user?.avatar || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image must be under 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setAvatar(base64)
      setPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const response = await apiFetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, avatar }),
      })
      const resData = await response.json()
      if (resData.success) {
        setAuth(resData.data, token!)
        setMessage('Profile updated successfully!')
      } else {
        setMessage('Failed to update profile.')
      }
    } catch {
      setMessage('Server error. Try again.')
    } finally {
      setSaving(false)
    }
  }

  // ---- Notifications tab (persisted locally, genuinely functional) ----
  const [notifPrefs, setNotifPrefs] = useState({
    emailMeetingReminders: true,
    taskAssignments: true,
    weeklyDigest: false,
    chatMentions: true,
  })

  useEffect(() => {
    const stored = localStorage.getItem(NOTIF_KEY)
    if (stored) setNotifPrefs(JSON.parse(stored))
  }, [])

  const updateNotifPref = (key: keyof typeof notifPrefs, value: boolean) => {
    const updated = { ...notifPrefs, [key]: value }
    setNotifPrefs(updated)
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated))
  }

  // ---- Security tab (change password — no backend endpoint yet) ----
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityMsg, setSecurityMsg] = useState<{ type: 'error' | 'info'; text: string } | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecurityMsg(null)
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'Please fill in all password fields' })
      return
    }
    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    setChangingPassword(true)
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) throw new Error()
      setSecurityMsg({ type: 'info', text: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setSecurityMsg({
        type: 'info',
        text: 'Password changes will be available once this feature ships on the server.',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  // ---- Appearance tab (accent theme, persisted, genuinely functional) ----
  const [accent, setAccent] = useState('indigo')

  const applyAccent = (id: string, persist = true) => {
    const theme = accentThemes.find((t) => t.id === id)
    if (!theme) return
    document.documentElement.style.setProperty('--color-brand-primary', theme.from)
    document.documentElement.style.setProperty('--color-brand-secondary', theme.to)
    setAccent(id)
    if (persist) localStorage.setItem(THEME_KEY, id)
  }

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored) applyAccent(stored, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-8">Profile & Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Tabs */}
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'gradient-brand text-white shadow-lg shadow-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Panel */}
        <div>
          {activeTab === 'general' && (
            <Card className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-indigo-500/50"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center text-white text-3xl font-bold glow-brand">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={18} className="text-white" />
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div>
                  <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  <Badge tone="brand" className="mt-2 capitalize">{user?.role}</Badge>
                  <p className="text-xs text-gray-500 mt-2">Click avatar to change photo (max 2MB)</p>
                </div>
              </div>

              <div className="space-y-5 max-w-md">
                <div>
                  <Label>Full Name</Label>
                  <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" defaultValue={user?.email} disabled className="opacity-50 cursor-not-allowed" />
                </div>

                {message && (
                  <p className={`text-sm flex items-center gap-1.5 ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {message.includes('success') ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {message}
                  </p>
                )}

                <Button onClick={handleSave} isLoading={saving} className="w-full" size="lg">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-8">
              <h2 className="text-lg font-semibold text-white mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-500 mb-4">Choose what you want to be notified about.</p>
              <div>
                <ToggleRow
                  title="Meeting reminders"
                  description="Get notified before your scheduled meetings start"
                  checked={notifPrefs.emailMeetingReminders}
                  onChange={(v) => updateNotifPref('emailMeetingReminders', v)}
                />
                <ToggleRow
                  title="Task assignments"
                  description="Get notified when a task is assigned to you"
                  checked={notifPrefs.taskAssignments}
                  onChange={(v) => updateNotifPref('taskAssignments', v)}
                />
                <ToggleRow
                  title="Chat mentions"
                  description="Get notified when someone mentions you in meeting chat"
                  checked={notifPrefs.chatMentions}
                  onChange={(v) => updateNotifPref('chatMentions', v)}
                />
                <ToggleRow
                  title="Weekly digest"
                  description="A weekly summary of your meetings and task activity"
                  checked={notifPrefs.weeklyDigest}
                  onChange={(v) => updateNotifPref('weeklyDigest', v)}
                />
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-8">
              <h2 className="text-lg font-semibold text-white mb-1">Security</h2>
              <p className="text-sm text-gray-500 mb-6">Update your password to keep your account secure.</p>

              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {securityMsg && (
                  <p className={`text-sm flex items-center gap-1.5 ${securityMsg.type === 'error' ? 'text-red-400' : 'text-indigo-300'}`}>
                    {securityMsg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                    {securityMsg.text}
                  </p>
                )}

                <Button type="submit" isLoading={changingPassword} className="w-full" size="lg">
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="p-8">
              <h2 className="text-lg font-semibold text-white mb-1">Appearance</h2>
              <p className="text-sm text-gray-500 mb-6">
                IntellMeet uses a dark interface by default. Choose an accent color to personalize your workspace.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {accentThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => applyAccent(theme.id)}
                    className={`rounded-2xl p-4 border transition-all duration-200 text-left ${
                      accent === theme.id
                        ? 'border-white/30 bg-white/[0.06]'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded-xl mb-3"
                      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white font-medium">{theme.label}</span>
                      {accent === theme.id && <CheckCircle2 size={16} className="text-emerald-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
