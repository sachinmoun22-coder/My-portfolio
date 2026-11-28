import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Confirm, EmptyState, ErrorBanner, Icon, inputClass, Spinner } from '../components/ui'

export default function Messages({ notify, onChange }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
      if (error) throw error
      const next = data || []
      setRows(next)
      setSelectedId(current => next.some(row => row.id === current) ? current : (next[0]?.id ?? null))
      setError('')
    } catch (err) {
      console.error('Messages load failed:', err)
      setError(err.message || 'Could not load messages.')
      setRows([])
      setSelectedId(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const run = async (action, success) => {
    setBusy(true)
    try {
      await action()
      notify(success)
      setError('')
      await load()
      onChange?.()
    } catch (err) {
      console.error('Messages action failed:', err)
      notify(err.message || 'Action failed', 'error')
      setError(err.message || 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  const toggle = row => run(async () => {
    const { error } = await supabase.from('messages').update({ is_read: !row.is_read }).eq('id', row.id)
    if (error) throw error
  }, row.is_read ? 'Marked as unread' : 'Marked as read')

  const markAll = () => run(async () => {
    const { error } = await supabase.from('messages').update({ is_read: true }).eq('is_read', false)
    if (error) throw error
  }, 'All messages marked as read')

  const remove = () => {
    const id = confirmId
    setConfirmId(null)
    run(async () => {
      const { error } = await supabase.from('messages').delete().eq('id', id)
      if (error) throw error
    }, 'Message deleted')
  }

  const query = search.trim().toLowerCase()
  const unread = rows.filter(row => !row.is_read).length
  const visible = rows.filter(row => {
    const matchesQuery = !query || [row.name, row.email, row.message].some(v => (v || '').toLowerCase().includes(query))
    const matchesFilter = filter === 'All' || (filter === 'Unread' ? !row.is_read : !!row.is_read)
    return matchesQuery && matchesFilter
  })
  const selected = visible.find(row => row.id === selectedId) || visible[0] || null

  return (
    <div>
      <div className="page-header">
        <div className="page-heading"><p className="eyebrow">Inbox</p><h2>Messages</h2><p>{unread} unread of {rows.length} messages</p></div>
        <button disabled={busy || !unread} onClick={markAll} className="button secondary"><Icon name="check" className="icon-18"/>Mark all read</button>
      </div>
      <ErrorBanner message={error}/>
      <div className="toolbar">
        <div className="search-box"><Icon name="search" className="icon-18"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className={inputClass}/></div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className={`${inputClass} filter-select`}><option>All</option><option>Unread</option><option>Read</option></select>
      </div>
      {loading ? <Spinner label="Loading messages..."/> : rows.length === 0 ? <EmptyState text="No messages yet."/> : visible.length === 0 ? <EmptyState text="No matching messages."/> : (
        <div className="messages-layout">
          <div className="card message-list">
            <div className="message-list-head">{visible.length} shown · {unread} unread</div>
            <div className="message-list-items">
              {visible.map(row => (
                <button key={row.id} onClick={() => setSelectedId(row.id)} className={`message-item ${!row.is_read ? 'unread' : ''} ${selected?.id === row.id ? 'selected' : ''}`}>
                  <span className="message-item-top">
                    {!row.is_read && <span className="message-dot"/>}
                    <span className="message-name">{row.name || 'Anonymous'}</span>
                    <span className="message-time">{row.created_at ? new Date(row.created_at).toLocaleDateString() : ''}</span>
                  </span>
                  <span className="message-preview">{row.email || 'No email'} · {row.message || ''}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card message-detail">
            {!selected ? <div className="empty-detail">Select a message to read it.</div> : (
              <>
                <div className="message-detail-header">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <h3>{selected.name || 'Anonymous'}</h3>
                    <span className={`status-pill ${selected.is_read ? 'read' : 'unread'}`}>{selected.is_read ? 'Read' : 'Unread'}</span>
                  </div>
                  <p className="message-meta">{selected.email || 'No email'} · {selected.created_at ? new Date(selected.created_at).toLocaleString() : ''}</p>
                </div>
                <div className="message-body">{selected.message}</div>
                <div className="message-actions">
                  <button disabled={busy} onClick={() => toggle(selected)} className="button secondary small">{selected.is_read ? 'Mark unread' : 'Mark read'}</button>
                  {selected.email && <a href={`mailto:${selected.email}?subject=Re: Portfolio enquiry&body=${encodeURIComponent(selected.message || '')}`} className="button secondary small"><Icon name="mail" className="icon-16"/>Reply</a>}
                  <button disabled={busy} onClick={() => setConfirmId(selected.id)} className="button danger small"><Icon name="trash" className="icon-16"/>Delete</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {confirmId && <Confirm text="Delete this message permanently?" onCancel={() => setConfirmId(null)} onConfirm={remove} busy={busy}/>}
    </div>
  )
}
