import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate, useLocation } from 'react-router-dom'
import Messages from './Messages'
import Projects from './Projects'
import Services from './Services'
import Settings from './Settings'
import { Icon, Toasts, ErrorBanner, EmptyState, Spinner } from '../components/ui'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'projects', label: 'Projects', icon: 'projects' },
  { id: 'services', label: 'Services', icon: 'services' },
  { id: 'messages', label: 'Messages', icon: 'messages' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
]

function AccountCard({ user, logout }) {
  return (
    <div className="mt-auto border-t border-white/10 px-1 pt-4">
      <p className="truncate text-sm text-slate-400" title={user.email}>{user.email}</p>
      <button onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-rose-400/40 hover:text-rose-200">
        <Icon name="logout" className="w-4 h-4"/>Logout
      </button>
    </div>
  )
}

function NavItems({ tab, go, unread, mobile }) {
  return tabs.map(t => (
    <button key={t.id} onClick={() => go(t.id)} className={`group relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${mobile ? 'whitespace-nowrap' : 'w-full'} ${tab === t.id ? 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
      <Icon name={t.icon} className="w-[18px] h-[18px]"/>
      <span>{t.label}</span>
      {t.id === 'messages' && unread > 0 && <span className="ml-auto min-w-5 rounded-full bg-cyan-400 px-1.5 text-center text-[11px] font-bold leading-5 text-slate-950">{unread}</span>}
    </button>
  ))
}

export default function Dashboard({ user }) {
  const nav = useNavigate()
  const location = useLocation()
  const pathTab = () => {
    const value = location.pathname.replace(/^\/admin\/?/, '')
    return tabs.some(t => t.id === value) ? value : 'dashboard'
  }
  const tab = pathTab()
  const [counts, setCounts] = useState({ messages: 0, unread: 0, projects: 0, services: 0 })
  const [latest, setLatest] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  const notify = (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(current => [...current, { id, message, type }])
    setTimeout(() => setToasts(current => current.filter(t => t.id !== id)), 3500)
  }

  const go = next => nav(next === 'dashboard' ? '/admin' : `/admin/${next}`)

  const load = async () => {
    setError('')
    try {
      const [m, p, s] = await Promise.all([
        supabase.from('messages').select('id,name,email,message,is_read,created_at').order('created_at', { ascending: false }),
        supabase.from('projects').select('id'),
        supabase.from('services').select('id')
      ])
      const failed = [m, p, s].find(result => result.error)
      if (failed) throw failed.error
      const messages = m.data || []
      setLatest(messages.slice(0, 5))
      setCounts({
        messages: messages.length,
        unread: messages.filter(row => !row.is_read).length,
        projects: (p.data || []).length,
        services: (s.data || []).length
      })
    } catch (err) {
      console.error('Dashboard load failed:', err)
      setError(err.message || 'Could not load dashboard data.')
      setCounts({ messages: 0, unread: 0, projects: 0, services: 0 })
      setLatest([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout failed:', error)
      notify(error.message, 'error')
    } else {
      nav('/admin/login')
    }
  }

  const stats = [
    { label: 'Messages', value: counts.messages, icon: 'mail' },
    { label: 'Unread', value: counts.unread, icon: 'unread' },
    { label: 'Projects', value: counts.projects, icon: 'projects' },
    { label: 'Services', value: counts.services, icon: 'services' }
  ]

  return (
    <div className="min-h-screen bg-[#070b17] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/10 bg-[#0a1122] px-4 py-6 lg:flex">
        <div className="mb-8 px-3">
          <p className="text-lg font-bold tracking-tight text-white">Sachin Moun</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin panel</p>
        </div>
        <nav className="flex flex-col gap-1.5"><NavItems tab={tab} go={go} unread={counts.unread}/></nav>
        <AccountCard user={user} logout={logout}/>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a1122]/95 backdrop-blur">
          <nav className="flex gap-1.5 overflow-x-auto border-b border-white/[0.06] px-3 py-2.5 lg:hidden"><NavItems tab={tab} go={go} unread={counts.unread} mobile/></nav>
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">Admin</p>
              <h1 className="text-lg font-semibold capitalize text-white sm:text-xl">{tab}</h1>
            </div>
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 lg:hidden"><Icon name="menu" className="w-5 h-5"/></button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <>
            {tab === 'dashboard' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Overview</h2>
                  <p className="mt-1 text-sm text-slate-400">Welcome back. Here is what is happening on your portfolio.</p>
                </div>
                <ErrorBanner message={error}/>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  {stats.map(s => (
                    <div key={s.label} className="rounded-2xl border border-white/10 bg-[#101a30] p-4 shadow-lg shadow-black/20 sm:p-5">
                      <div className="flex items-center justify-between text-slate-400"><span className="text-xs font-medium uppercase tracking-wider sm:text-sm">{s.label}</span><Icon name={s.icon} className="w-5 h-5 text-cyan-300/70"/></div>
                      <p className="mt-3 text-3xl font-bold text-white">{loading ? '—' : s.value}</p>
                    </div>
                  ))}
                </div>
                <section className="mt-8 rounded-2xl border border-white/10 bg-[#101a30] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-white">Latest messages</h2>
                    <button onClick={() => go('messages')} className="text-sm text-cyan-300 hover:text-cyan-200">View all →</button>
                  </div>
                  {loading ? <Spinner label="Loading messages..."/> : latest.length === 0 ? <EmptyState text="No messages yet."/> : (
                    <div className="space-y-2.5">
                      {latest.map(m => (
                        <button key={m.id} onClick={() => go('messages')} className="flex w-full items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition hover:border-cyan-400/30">
                          <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${m.is_read ? 'bg-slate-600' : 'bg-cyan-300'}`}/>
                          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{m.name || 'Anonymous'} <span className="font-normal text-slate-500">{m.email}</span></span><span className="mt-0.5 block truncate text-sm text-slate-400">{m.message}</span></span>
                          <span className="shrink-0 text-xs text-slate-500">{m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
            {tab === 'projects' && <Projects notify={notify} onChange={load}/>}
            {tab === 'services' && <Services notify={notify} onChange={load}/>}
            {tab === 'messages' && <Messages notify={notify} onChange={load}/>}
            {tab === 'settings' && <Settings user={user} notify={notify}/>}
          </>
        </main>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/80" onClick={() => setMenuOpen(false)}/>
          <aside className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col border-r border-white/10 bg-[#0a1122] px-4 py-6">
            <div className="mb-8 flex items-start justify-between gap-3">
              <div><p className="text-lg font-bold tracking-tight text-white">Sachin Moun</p><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin panel</p></div>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"><Icon name="close" className="w-4 h-4"/></button>
            </div>
            <nav className="flex flex-col gap-1.5"><NavItems tab={tab} go={next => { go(next); setMenuOpen(false) }} unread={counts.unread}/></nav>
            <AccountCard user={user} logout={logout}/>
          </aside>
        </div>
      )}
      <Toasts items={toasts}/>
    </div>
  )
}
