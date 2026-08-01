import { Users, Calendar, Video } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface MeetingCardProps {
  title: string
  host: string
  date: string
  status: 'Scheduled' | 'Active'
  onJoin: () => void
}

const MeetingCard = ({ title, host, date, status, onJoin }: MeetingCardProps) => {
  return (
    <div className="glass-card rounded-2xl p-6 hover:border-white/[0.16] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
          <p className="text-gray-400 mt-2 text-sm flex items-center gap-1.5">
            <Users size={14} /> Host: {host}
          </p>
          <p className="text-gray-500 text-xs mt-1 flex items-center gap-1.5">
            <Calendar size={13} /> {date}
          </p>
        </div>
        <Badge tone={status === 'Active' ? 'success' : 'warning'}>{status}</Badge>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onJoin} leftIcon={<Video size={15} />}>
          Join
        </Button>
      </div>
    </div>
  )
}

export default MeetingCard
