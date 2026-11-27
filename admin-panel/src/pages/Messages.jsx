import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Icon, Confirm, ErrorBanner, EmptyState, Spinner, inputClass } from '../components/ui'

export default function Messages({ notify, onChange }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setRows(data || [])
      setError('')
    } catch (err) {
      console.error('Messages load failed:', err)
      setError(err.message || 'Could not load messages.')
      setRows([])
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
  const visible = query ? rows.filter(r => [r.name, r.email, r.message].some(v => (v || '').toLowerCase().includes(query))) : rows
  const unread = rows.filter(r => !r.is_read).length

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">Messages</h2><p className="mt-1 text-sm text-slate-400">{unread} unread of {rows.length} messages</p></div>
        <button disabled={busy || !unread} onClick={markAll} className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"><Icon name="check" className="w-4 h-4"/>Mark all read</button>
      </div>
      <ErrorBanner message={error}/>
      <div className="relative mb-5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icon name="search" className="w-4 h-4"/></span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className={`${inputClass} pl-10`}/>
      </div>
      {loading ? <Spinner label="Loading messages..."/> : rows.length === 0 ? <EmptyState text="No messages yet."/> : visible.length === 0 ? <EmptyState text="No matching messages."/> : (
        <div className="space-y-3">
          {visible.map(r => (
            <article key={r.id} className={`rounded-2xl border p-4 sm:p-5 ${r.is_read ? 'border-white/10 bg-[#101a30]' : 'border-cyan-400/40 bg-cyan-400/[0.04]'}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-white">{r.name || 'Anonymous'}</span>{!r.is_read && <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[11px] font-medium text-cyan-200">New</span>}</div>
                  <p className="text-xs text-slate-500">{r.email || 'No email'} · {r.created_at ? new Date(r.created_at).toLocaleString() : ''}</p>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">{r.message}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button disabled={busy} onClick={() => toggle(r)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-50">{r.is_read ? 'Mark unread' : 'Mark read'}</button>
                  {r.email && <a href={`mailto:${r.email}?subject=Re: Portfolio enquiry&body=${encodeURIComponent(r.message || '')}`} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5"><Icon name="mail" className="w-3.5 h-3.5"/>Reply</a>}
                  <button disabled={busy} onClick={() => setConfirmId(r.id)} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"><Icon name="trash" className="w-3.5 h-3.5"/>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {confirmId && <Confirm text="Delete this message permanently?" onCancel={() => setConfirmId(null)} onConfirm={remove} busy={busy}/>}
    </div>
  )
}
