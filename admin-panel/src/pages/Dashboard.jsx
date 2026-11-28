import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Messages from './Messages'
import Projects from './Projects'
import Services from './Services'
import Settings from './Settings'
import { EmptyState, ErrorBanner, Icon, Spinner, Toasts } from '../components/ui'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'projects', label: 'Projects', icon: 'projects' },
  { id: 'services', label: 'Services', icon: 'services' },
  { id: 'messages', label: 'Messages', icon: 'messages' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
]

const navSections = [
  { label: 'MAIN', items: [tabs[0]] },
  { label: 'CONTENT', items: [tabs[1], tabs[2]] },
  { label: 'INBOX', items: [tabs[3]] },
  { label: 'SITE', items: [tabs[4]] }
]

const chartColors = ['#22b8f0', '#10c18b', '#a78bdb', '#ff9472', '#f59e0b', '#64748b']

function relativeTime(value) {
  if (!value) return '—'
  const diff = Date.now() - new Date(value).getTime()
  if (Number.isNaN(diff)) return '—'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(value).toLocaleDateString()
}

function monthKeys() {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - (11 - i))
    return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, label: date.toLocaleString('en-US', { month: 'short' }) }
  })
}

function AccountCard({ user, logout }) {
  return (
    <div className="sidebar-footer">
      <span className="sidebar-email" title={user.email}>{user.email}</span>
      <button onClick={logout} className="logout-button"><Icon name="logout" className="icon-18"/><span>Logout</span></button>
    </div>
  )
}

function NavItems({ tab, go, unread, closeDrawer }) {
  return navSections.map(section => (
    <div className="sidebar-group" key={section.label}>
      <p className="sidebar-group-title">{section.label}</p>
      {section.items.map(item => (
        <button key={item.id} onClick={() => { go(item.id); closeDrawer?.() }} className={`nav-item ${tab === item.id ? 'active' : ''}`}>
          <Icon name={item.icon} className="icon-18 nav-item-icon"/>
          <span className="nav-label">{item.label}</span>
          {item.id === 'messages' && unread > 0 && <span className="nav-badge">{unread}</span>}
        </button>
      ))}
    </div>
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
  const [counts, setCounts] = useState({ messages: 0, unread: 0, week: 0, projects: 0, visible: 0, services: 0 })
  const [projectsList, setProjectsList] = useState([])
  const [monthly, setMonthly] = useState([])
  const [categories, setCategories] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState([])
  const [collapsed, setCollapsed] = useState(false)
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
        supabase.from('projects').select('id,title,category,visible,created_at,sort_order').order('created_at', { ascending: false }),
        supabase.from('services').select('id')
      ])
      const failed = [m, p, s].find(result => result.error)
      if (failed) throw failed.error
      const messages = m.data || []
      const projects = p.data || []
      const services = s.data || []
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const months = monthKeys()
      const categoryMap = new Map()
      projects.forEach(row => {
        const name = String(row.category || 'Other').trim() || 'Other'
        categoryMap.set(name, (categoryMap.get(name) || 0) + 1)
      })

      setCounts({
        messages: messages.length,
        unread: messages.filter(row => !row.is_read).length,
        week: messages.filter(row => row.created_at && new Date(row.created_at).getTime() >= weekAgo).length,
        projects: projects.length,
        visible: projects.filter(row => row.visible !== false).length,
        services: services.length
      })
      setProjectsList(projects.slice(0, 5))
      setMonthly(months.map(month => ({
        ...month,
        messages: messages.filter(row => row.created_at && row.created_at.slice(0, 7) === month.key).length
      })))
      setCategories([...categoryMap].map(([name, value]) => ({ name, value })))
      setActivity([
        ...messages.slice(0, 6).map(row => ({
          id: `message-${row.id}`,
          icon: 'messages',
          title: `New message from ${row.name || 'Anonymous'}`,
          detail: row.email || 'Portfolio enquiry',
          date: row.created_at
        })),
        ...projects.slice(0, 6).map(row => ({
          id: `project-${row.id}`,
          icon: 'projects',
          title: `${row.visible === false ? 'Draft project' : 'Project published'}: ${row.title || 'Untitled'}`,
          detail: row.category || 'Portfolio project',
          date: row.created_at
        }))
      ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 6))
    } catch (err) {
      console.error('Dashboard load failed:', err)
      setError(err.message || 'Could not load dashboard data.')
      setCounts({ messages: 0, unread: 0, week: 0, projects: 0, visible: 0, services: 0 })
      setProjectsList([])
      setMonthly([])
      setCategories([])
      setActivity([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setMenuOpen(false) }
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout failed:', error)
      notify(error.message, 'error')
    } else {
      nav('/admin/login')
    }
  }

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) setMenuOpen(true)
    else setCollapsed(current => !current)
  }

  const stats = [
    { label: 'Total Messages', value: counts.messages, sub: `${counts.week} this week`, icon: 'messages', tone: 'green' },
    { label: 'Unread', value: counts.unread, sub: 'Needs attention', icon: 'unread', tone: 'purple' },
    { label: 'Projects', value: counts.projects, sub: `${counts.visible} visible`, icon: 'projects', tone: 'blue' },
    { label: 'Services', value: counts.services, sub: 'Live on portfolio', icon: 'services', tone: 'orange' }
  ]

  return (
    <div className="admin-shell">
      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)}/>}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-logo">S</span>
          <span className="sidebar-brand-text"><strong>Sachin Moun</strong><small>Admin panel</small></span>
        </div>
        <nav className="sidebar-nav"><NavItems tab={tab} go={go} unread={counts.unread} closeDrawer={() => setMenuOpen(false)}/></nav>
        <AccountCard user={user} logout={logout}/>
      </aside>

      <div className={`admin-main ${collapsed ? 'collapsed' : ''}`}>
        <header className="admin-topbar">
          <div className="topbar-left">
            <button onClick={toggleSidebar} aria-label="Toggle sidebar" className="icon-button"><Icon name="menu" className="icon-20"/></button>
            <div className="topbar-heading"><h1>{tab}</h1><p>Admin dashboard</p></div>
          </div>
          <div className="topbar-actions">
            <button onClick={() => go('messages')} aria-label="Notifications" className="icon-button notification-button"><Bell className="icon-18"/>{counts.unread > 0 && <span className="notification-dot"/>}</button>
            <div className="avatar" title={user.email}>{user.email?.[0] || 'A'}</div>
          </div>
        </header>

        <main className="admin-content">
          {tab === 'dashboard' && (
            <div>
              <div className="page-header">
                <div className="page-heading"><p className="eyebrow">Overview</p><h2>Dashboard</h2><p>Welcome back. Here is what is happening on your portfolio.</p></div>
              </div>
              <ErrorBanner message={error}/>
              <div className="stat-grid">
                {stats.map(s => (
                  <article key={s.label} className={`stat-card ${s.tone}`}>
                    <div className="stat-top"><span className="stat-label">{s.label}</span><span className="stat-icon"><Icon name={s.icon} className="icon-20"/></span></div>
                    <p className="stat-value">{loading ? '—' : s.value}</p>
                    <span className="stat-sub">{s.sub}</span>
                  </article>
                ))}
              </div>

              <section className="dashboard-section chart-grid">
                <div className="card chart-card">
                  <div className="card-header"><div><h3 className="card-title">Messages Overview</h3><p className="card-subtitle">Enquiries received each month</p></div></div>
                  <div className="chart-wrap">
                    {loading ? <Spinner label="Loading chart..."/> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthly} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
                          <defs><linearGradient id="messageFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.3}/><stop offset="100%" stopColor="#2563eb" stopOpacity={0.02}/></linearGradient></defs>
                          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false}/>
                          <XAxis axisLine={false} dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false}/>
                          <YAxis allowDecimals={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false}/>
                          <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}/>
                          <Area dataKey="messages" dot={false} fill="url(#messageFill)" stroke="#2563eb" strokeWidth={2} type="monotone"/>
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="card chart-card">
                  <div className="card-header"><div><h3 className="card-title">Projects by Category</h3><p className="card-subtitle">Distribution of your work</p></div></div>
                  {loading ? <Spinner label="Loading chart..."/> : categories.length === 0 ? <div className="card-body"><EmptyState text="No projects yet."/></div> : (
                    <>
                      <div className="donut-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={categories} dataKey="value" innerRadius={60} nameKey="name" outerRadius={85} paddingAngle={3} stroke="none">
                              {categories.map((entry, i) => <Cell key={entry.name} fill={chartColors[i % chartColors.length]}/>)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}/>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="donut-center"><strong>{counts.projects}</strong><span>Projects</span></div>
                      </div>
                      <div className="donut-legend">
                        {categories.map((entry, i) => <span className="legend-item" key={entry.name}><span className="legend-dot" style={{ background: chartColors[i % chartColors.length] }}/>{entry.name} · {entry.value}</span>)}
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section className="dashboard-section lower-grid">
                <div className="card">
                  <div className="card-header"><div><h3 className="card-title">Recent Activity</h3><p className="card-subtitle">Latest messages and projects</p></div></div>
                  {loading ? <Spinner label="Loading activity..."/> : activity.length === 0 ? <div className="card-body"><EmptyState text="No activity yet."/></div> : (
                    <div className="activity-list">
                      {activity.map(item => (
                        <div className="activity-item" key={item.id}>
                          <span className="activity-icon"><Icon name={item.icon} className="icon-18"/></span>
                          <span className="activity-copy"><strong>{item.title}</strong><span>{item.detail}</span></span>
                          <span className="activity-time">{relativeTime(item.date)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="card-header"><div><h3 className="card-title">Latest Projects</h3><p className="card-subtitle">Recently added portfolio work</p></div><button onClick={() => go('projects')} className="link-button">View all →</button></div>
                  {loading ? <Spinner label="Loading projects..."/> : projectsList.length === 0 ? <div className="card-body"><EmptyState text="No projects yet."/></div> : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Created</th></tr></thead>
                        <tbody>
                          {projectsList.map(row => (
                            <tr key={row.id}>
                              <td><span className="table-title">{row.title || 'Untitled'}</span></td>
                              <td>{row.category || 'Other'}</td>
                              <td><span className={`status-pill ${row.visible === false ? 'draft' : 'published'}`}>{row.visible === false ? 'Draft' : 'Published'}</span></td>
                              <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
          {tab === 'projects' && <Projects notify={notify} onChange={load}/>}
          {tab === 'services' && <Services notify={notify} onChange={load}/>}
          {tab === 'messages' && <Messages notify={notify} onChange={load}/>}
          {tab === 'settings' && <Settings user={user} notify={notify}/>}
        </main>
      </div>
      <Toasts items={toasts}/>
    </div>
  )
}
