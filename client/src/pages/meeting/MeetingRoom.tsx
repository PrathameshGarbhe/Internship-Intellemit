import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { io, Socket } from 'socket.io-client'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  MessageSquare, Users, X, Send, Video as VideoIcon
} from 'lucide-react'
import { SOCKET_URL } from '@/config/constants'

interface Message {
  id: number
  message: string
  senderName: string
  timestamp: string
}

interface Participant {
  socketId: string
  name: string
  isHost: boolean
}

const MeetingRoom = () => {
  const { meetingCode } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isHost = (location.state as any)?.isHost || false

  const videoRef = useRef<HTMLVideoElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const videoTrackRef = useRef<MediaStreamTrack | null>(null)
  const audioTrackRef = useRef<MediaStreamTrack | null>(null)

  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [cameraAvailable, setCameraAvailable] = useState(false)

  useEffect(() => {
    const initMedia = async () => {
      // Try camera
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoTrackRef.current = videoStream.getVideoTracks()[0]
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream
        }
        setCameraAvailable(true)
      } catch {
        setCameraAvailable(false)
      }

      // Try mic separately
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioTrackRef.current = audioStream.getAudioTracks()[0]
      } catch {
        setMicOn(false)
      }
    }

    initMedia()

    // Connect socket
    socketRef.current = io(SOCKET_URL, { withCredentials: true })
    socketRef.current.emit('join-room', {
      roomId: meetingCode,
      name: user?.name || 'Guest',
      isHost,
    })

    socketRef.current.on('participants-updated', (data: Participant[]) => {
      setParticipants(data)
    })

    socketRef.current.on('receive-message', (msg: Message) => {
      setMessages(prev => [...prev, msg])
    })

    return () => {
      videoTrackRef.current?.stop()
      audioTrackRef.current?.stop()
      socketRef.current?.emit('leave-room', meetingCode)
      socketRef.current?.disconnect()
    }
  }, [meetingCode])

  const toggleMic = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.enabled = !audioTrackRef.current.enabled
      setMicOn(prev => !prev)
    }
  }

  const toggleCamera = () => {
    if (videoTrackRef.current) {
      videoTrackRef.current.enabled = !videoTrackRef.current.enabled
      setCameraOn(prev => !prev)
    }
  }

  const handleLeave = () => {
    videoTrackRef.current?.stop()
    audioTrackRef.current?.stop()
    socketRef.current?.emit('leave-room', meetingCode)
    socketRef.current?.disconnect()
    navigate('/meetings')
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    socketRef.current?.emit('send-message', {
      roomId: meetingCode,
      message: newMessage,
      senderName: user?.name || 'Guest',
    })
    setNewMessage('')
  }

  const CONTROL_BASE =
    'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95'
  const CONTROL_NEUTRAL = 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10'
  const CONTROL_ACTIVE = 'gradient-brand text-white glow-brand'
  const CONTROL_DANGER = 'bg-red-500 hover:bg-red-600 text-white'

  return (
    <div className="fixed inset-0 bg-[#080b16] flex flex-col">
      {/* Header */}
      <div className="h-14 glass-panel border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shrink-0">
            <VideoIcon size={14} className="text-white" />
          </div>
          <span className="text-white font-semibold hidden sm:inline">IntellMeet</span>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="text-gray-400 text-sm truncate">Room: {meetingCode}</span>
          {isHost && (
            <span className="bg-indigo-500/15 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/20 shrink-0">
              Host
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400 text-sm hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {user?.name}
          </span>
          <button
            onClick={handleLeave}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2"
          >
            <PhoneOff size={14} /> Leave
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-6 noise-overlay">
          <div className="relative w-full max-w-3xl aspect-video glass-card rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            {cameraAvailable && cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white/[0.03] to-transparent">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover ring-2 ring-indigo-500/50 mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full gradient-brand flex items-center justify-center text-white text-4xl font-bold mb-4 glow-brand">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <p className="text-white mt-1 font-medium">{user?.name}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {!cameraAvailable ? 'Camera unavailable' : 'Camera off'}
                </p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur text-white text-sm px-3 py-1 rounded-lg">
              {user?.name} {isHost ? '(Host)' : ''}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 sm:gap-4 mt-8">
            <button
              onClick={toggleMic}
              title={micOn ? 'Mute mic' : 'Unmute mic'}
              className={`${CONTROL_BASE} ${micOn ? CONTROL_NEUTRAL : CONTROL_DANGER}`}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              onClick={toggleCamera}
              title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
              className={`${CONTROL_BASE} ${cameraOn ? CONTROL_NEUTRAL : CONTROL_DANGER}`}
            >
              {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            <button
              onClick={() => { setShowChat(!showChat); setShowParticipants(false) }}
              title="Chat"
              className={`${CONTROL_BASE} ${showChat ? CONTROL_ACTIVE : CONTROL_NEUTRAL}`}
            >
              <MessageSquare size={18} />
            </button>

            <button
              onClick={() => { setShowParticipants(!showParticipants); setShowChat(false) }}
              title="Participants"
              className={`${CONTROL_BASE} ${showParticipants ? CONTROL_ACTIVE : CONTROL_NEUTRAL} relative`}
            >
              <Users size={18} />
              {participants.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-[10px] text-[#080b16] font-bold flex items-center justify-center">
                  {participants.length}
                </span>
              )}
            </button>

            <button
              onClick={handleLeave}
              title="Leave meeting"
              className={`${CONTROL_BASE} ${CONTROL_DANGER}`}
            >
              <PhoneOff size={18} />
            </button>
          </div>
        </div>

        {/* Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="glass-panel border-l border-white/[0.06] flex flex-col overflow-hidden shrink-0"
            >
              <div className="w-80 flex flex-col h-full">
                <div className="p-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                  <h3 className="text-white font-semibold">Chat</h3>
                  <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center mt-8">No messages yet</p>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 text-xs font-semibold">{msg.senderName}</span>
                          <span className="text-gray-600 text-xs">{msg.timestamp}</span>
                        </div>
                        <p className="text-white text-sm bg-white/[0.06] px-3 py-2 rounded-xl rounded-tl-sm">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-white/[0.06] flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/[0.05] text-white rounded-xl px-3 py-2 text-sm outline-none border border-white/10 focus-ring"
                  />
                  <button
                    onClick={sendMessage}
                    className="gradient-brand text-white p-2.5 rounded-xl transition hover:brightness-110"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Participants Panel */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="glass-panel border-l border-white/[0.06] flex flex-col overflow-hidden shrink-0"
            >
              <div className="w-80 flex flex-col h-full">
                <div className="p-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                  <h3 className="text-white font-semibold">Participants ({participants.length})</h3>
                  <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {participants.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center mt-8">No participants yet</p>
                  ) : (
                    participants.map(p => (
                      <div key={p.socketId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                        <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{p.name}</p>
                          {p.isHost && (
                            <span className="text-indigo-400 text-xs">Host</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MeetingRoom
