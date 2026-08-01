import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Video,
  Brain,
  MessageSquare,
  KanbanSquare,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Star,
  Check,
  ExternalLink,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { APP_NAME } from '@/config/constants'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
}

const features = [
  {
    icon: Video,
    title: 'HD Video Meetings',
    description: 'Crystal-clear WebRTC video conferencing with instant room creation and one-click joining.',
  },
  {
    icon: Brain,
    title: 'AI Meeting Summaries',
    description: 'Automatic transcription, smart summaries, and action-item extraction powered by AI.',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Chat',
    description: 'Socket-powered live messaging during meetings so nothing gets lost mid-call.',
  },
  {
    icon: KanbanSquare,
    title: 'Kanban Task Boards',
    description: 'Turn meeting decisions into trackable tasks with a drag-and-drop board your team loves.',
  },
  {
    icon: BarChart3,
    title: 'Team Analytics',
    description: 'Understand meeting load, task velocity, and participation trends at a glance.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by Design',
    description: 'Role-based access, encrypted sessions, and enterprise-ready authentication.',
  },
]

const testimonials = [
  {
    quote:
      'IntellMeet replaced three separate tools for our team. Meetings, tasks, and notes finally live in one place.',
    name: 'Aditi Rao',
    role: 'Engineering Manager',
  },
  {
    quote:
      'The AI summaries alone save me an hour a day. I stopped taking manual notes months ago.',
    name: 'Marcus Chen',
    role: 'Product Lead',
  },
  {
    quote:
      'Our standups got so much shorter once tasks synced directly from meeting action items.',
    name: 'Priya Nair',
    role: 'Scrum Master',
  },
]

const pricingHighlights = ['Unlimited meetings', 'AI summaries included', 'Kanban task boards', 'Priority support']

const LandingPage = () => {
  const { isAuthenticated } = useAuthStore()
  const primaryHref = isAuthenticated ? '/dashboard' : '/register'

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass-panel border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center glow-brand">
              <Video size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              {APP_NAME.replace('Meet', '')}
              <span className="gradient-text">Meet</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm text-gray-300 hover:text-white transition-colors px-3">
                  Sign in
                </Link>
                <Link to="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-24 px-6">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-indigo-300 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-powered meetings, now with real-time collaboration
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]"
          >
            Meet, decide, and
            <br />
            <span className="gradient-text">ship faster together</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            {APP_NAME} unifies video meetings, AI summaries, live chat, and Kanban task
            boards into a single enterprise-grade workspace for modern teams.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={primaryHref}>
              <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                {isAuthenticated ? 'Go to Dashboard' : 'Start free — no card required'}
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline">
                Explore features
              </Button>
            </a>
          </motion.div>

          {/* Hero preview panel */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-16 relative"
          >
            <div className="glass-card rounded-3xl p-3 sm:p-4 shadow-2xl shadow-black/40">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d1526] aspect-video flex items-center justify-center relative">
                <div className="absolute inset-0 noise-overlay" />
                <div className="relative grid grid-cols-3 gap-3 p-6 w-full h-full">
                  <div className="col-span-2 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-white/10 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                      SP
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-500 text-xs">
                      Participant
                    </div>
                    <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-500 text-xs">
                      Participant
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logos strip */}
      <section className="py-10 border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-gray-600 text-sm font-semibold tracking-wide uppercase">
          <span>Trusted by teams at</span>
          {['Northwind', 'Vertexa', 'Loopline', 'Fluxbase', 'Corvex'].map((name) => (
            <span key={name} className="text-gray-500">{name}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">Everything in one place</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Built for teams that move fast
            </h2>
            <p className="mt-4 text-gray-400">
              Replace your meeting tool, chat app, and task board with one connected workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                  className="glass-card rounded-2xl p-6 hover:border-white/[0.16] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center mb-5 glow-brand">
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white/[0.015] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">Loved by teams</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Don't just take our word for it
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card rounded-2xl p-7"
              >
                <div className="flex gap-1 mb-4 text-amber-400">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative glass-card rounded-3xl p-10 sm:p-14 text-center overflow-hidden"
          >
            <div className="absolute -top-24 right-0 w-72 h-72 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight relative">
              Ready to run better meetings?
            </h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto relative">
              Join thousands of teams already using {APP_NAME} to collaborate smarter, faster, and with less friction.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 relative">
              {pricingHighlights.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-300 bg-white/[0.05] border border-white/10 px-3.5 py-1.5 rounded-full"
                >
                  <Check size={14} className="text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 relative">
              <Link to={primaryHref}>
                <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                  {isAuthenticated ? 'Go to Dashboard' : 'Create your free account'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                  <Video size={15} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  {APP_NAME.replace('Meet', '')}
                  <span className="gradient-text">Meet</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs">
                AI-powered meetings, tasks, and analytics for modern teams.
              </p>
            </div>

            <div className="flex gap-16 flex-wrap">
              <div>
                <p className="text-white text-sm font-semibold mb-3">Product</p>
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                  <a href="#features" className="hover:text-gray-300 transition-colors">Features</a>
                  <a href="#pricing" className="hover:text-gray-300 transition-colors">Pricing</a>
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-3">Company</p>
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                  <a href="#testimonials" className="hover:text-gray-300 transition-colors">Testimonials</a>
                  <Link to="/login" className="hover:text-gray-300 transition-colors">Sign in</Link>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {['Github', 'Twitter', 'LinkedIn'].map((name) => (
                <a
                  key={name}
                  href="#"
                  aria-label={name}
                  className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-colors"
                >
                  <ExternalLink size={15} />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/[0.06] text-center text-gray-600 text-xs">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
