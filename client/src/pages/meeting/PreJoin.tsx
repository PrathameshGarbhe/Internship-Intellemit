import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Mic, MicOff, Video, VideoOff, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

const PreJoin = () => {
  const { meetingCode } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const meetingTitle = (location.state as any)?.meetingTitle || 'Meeting'

  const videoRef = useRef<HTMLVideoElement>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [cameraAvailable, setCameraAvailable] = useState(false)
  const [micAvailable, setMicAvailable] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [micError, setMicError] = useState('')

  useEffect(() => {
    const initDevices = async () => {
      // Try camera separately
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoStreamRef.current = videoStream
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream
        }
        setCameraAvailable(true)
        setCameraError('')
      } catch (err: any) {
        setCameraAvailable(false)
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device.')
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera access denied. Allow access in browser settings.')
        } else if (err.name === 'NotReadableError') {
          setCameraError('Camera is in use by another application.')
        } else {
          setCameraError('Camera unavailable: ' + err.message)
        }
      }

      // Try microphone separately
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioStreamRef.current = audioStream
        setMicAvailable(true)
        setMicError('')
      } catch (err: any) {
        setMicAvailable(false)
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setMicError('No microphone found on this device.')
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setMicError('Microphone access denied. Allow access in browser settings.')
        } else if (err.name === 'NotReadableError') {
          setMicError('Microphone is in use by another application.')
        } else {
          setMicError('Microphone unavailable: ' + err.message)
        }
      }
    }

    initDevices()

    return () => {
      videoStreamRef.current?.getTracks().forEach((t) => t.stop())
      audioStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const toggleMic = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled
      })
      setMicOn((prev) => !prev)
    }
  }

  const toggleCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled
      })
      setCameraOn((prev) => !prev)
    }
  }

  const isHost = (location.state as any)?.isHost || false

  const handleJoin = () => {
    videoStreamRef.current?.getTracks().forEach((t) => t.stop())
    audioStreamRef.current?.getTracks().forEach((t) => t.stop())
    navigate(`/meeting-room/${meetingCode}`, {
      state: { meetingTitle, micOn, cameraOn, isHost },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute w-[700px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-4xl relative"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">{meetingTitle}</h1>
          <p className="text-gray-400 mt-2">
            Meeting Code: <span className="text-indigo-400 font-mono font-semibold">{meetingCode}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Preview */}
          <div className="space-y-4">
            <div className="relative aspect-video glass-card rounded-2xl overflow-hidden">
              {cameraAvailable && cameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-indigo-500/50 mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center text-white text-3xl font-bold mb-3">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-white font-medium">{user?.name}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {!cameraAvailable ? 'Camera unavailable' : 'Camera off'}
                  </p>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur text-white text-sm px-3 py-1 rounded-lg">
                {user?.name}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleMic}
                disabled={!micAvailable}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition border ${
                  !micAvailable
                    ? 'bg-white/[0.03] text-gray-600 border-white/10 cursor-not-allowed'
                    : micOn
                    ? 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/25'
                    : 'bg-red-600/15 text-red-400 border-red-500/30 hover:bg-red-600/25'
                }`}
              >
                {micOn && micAvailable ? <Mic size={16} /> : <MicOff size={16} />}
                {!micAvailable ? 'No Mic' : micOn ? 'Mic On' : 'Mic Off'}
              </button>

              <button
                onClick={toggleCamera}
                disabled={!cameraAvailable}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition border ${
                  !cameraAvailable
                    ? 'bg-white/[0.03] text-gray-600 border-white/10 cursor-not-allowed'
                    : cameraOn
                    ? 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/25'
                    : 'bg-red-600/15 text-red-400 border-red-500/30 hover:bg-red-600/25'
                }`}
              >
                {cameraOn && cameraAvailable ? <Video size={16} /> : <VideoOff size={16} />}
                {!cameraAvailable ? 'No Camera' : cameraOn ? 'Camera On' : 'Camera Off'}
              </button>
            </div>
          </div>

          {/* Join Panel */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Device Status */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-semibold mb-1">Device Status</h3>

              <div className="flex items-start gap-3">
                {micAvailable ? (
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className="text-gray-300 text-sm">
                    Microphone — {micAvailable ? (micOn ? 'Ready' : 'Muted') : 'Not available'}
                  </span>
                  {micError && <p className="text-red-400 text-xs mt-0.5">{micError}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                {cameraAvailable ? (
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className="text-gray-300 text-sm">
                    Camera — {cameraAvailable ? (cameraOn ? 'Ready' : 'Off') : 'Not available'}
                  </span>
                  {cameraError && <p className="text-red-400 text-xs mt-0.5">{cameraError}</p>}
                </div>
              </div>
            </div>

            {/* Meeting Info */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-semibold mb-1">Meeting Info</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Meeting Name</span>
                <span className="text-white text-sm font-medium">{meetingTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Room Code</span>
                <span className="text-indigo-400 font-mono text-sm font-semibold">{meetingCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Joining as</span>
                <span className="text-white text-sm font-medium">{user?.name}</span>
              </div>
            </div>

            <Button onClick={handleJoin} size="lg" className="w-full">
              Join Meeting
            </Button>

            <Button variant="secondary" onClick={() => navigate('/meetings')} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PreJoin
