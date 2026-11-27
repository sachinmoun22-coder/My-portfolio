import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Icon, Modal, Confirm, ErrorBanner, EmptyState, Spinner, Field, inputClass } from '../components/ui'

const blank = { icon: '', title: '', description: '', price: '', sort_order: 0 }

export default function Services({ notify, onChange }) {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(blank)
  const [edit, setEdit] = useState(null)
  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data, error } = await supabase.from('services').select('*').order('sort_order')
      if (error) throw error
      setRows(data || [])
      setError('')
    } catch (err) {
      console.error('Services load failed:', err)
      setError(err.message || 'Could not load services.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const openAdd = () => { setForm(blank); setEdit(null); setOpen(true) }
  const openEdit = row => { setForm({ icon: row.icon || '', title: row.title || '', description: row.description || '', price: row.price || '', sort_order: row.sort_order || 0 }); setEdit(row.id); setOpen(true) }

  const save = async e => {
    e.preventDefault()
    setBusy(true)
    try {
      if (!form.title.trim()) throw new Error('Title is required')
      const payload = { icon: form.icon, title: form.title.trim(), description: form.description, price: form.price, sort_order: Number(form.sort_order) || 0 }
      const result = edit
        ? await supabase.from('services').update(payload).eq('id', edit)
        : await supabase.from('services').insert(payload)
      if (result.error) throw result.error
      setOpen(false)
      notify(edit ? 'Service updated' : 'Service added')
      setError('')
      await load()
      onChange?.()
    } catch (err) {
      console.error('Service save failed:', err)
      notify(err.message || 'Could not save service', 'error')
      setError(err.message || 'Could not save service')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    const id = confirmId
    setConfirmId(null)
    setBusy(true)
    try {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
      notify('Service deleted')
      setError('')
      await load()
      onChange?.()
    } catch (err) {
      console.error('Service delete failed:', err)
      notify(err.message || 'Could not delete service', 'error')
      setError(err.message || 'Could not delete service')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">Services</h2><p className="mt-1 text-sm text-slate-400">{rows.length} services · changes appear on your site</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"><Icon name="plus" className="w-4 h-4"/>Add service</button>
      </div>
      <ErrorBanner message={error}/>
      {loading ? <Spinner label="Loading services..."/> : rows.length === 0 ? <EmptyState text="No services yet. Add your first one."/> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map(r => (
            <article key={r.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#101a30] p-5">
              <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl">{r.icon || '✦'}</span><div className="min-w-0"><h3 className="font-semibold text-white">{r.title}</h3><p className="mt-1 text-sm text-slate-400">{r.description || 'No description'}</p></div></div>
              <div className="mt-auto flex items-center gap-2"><span className="mr-auto text-sm font-medium text-cyan-300">{r.price || '—'}</span><button onClick={() => openEdit(r)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5"><Icon name="edit" className="w-3.5 h-3.5"/>Edit</button><button onClick={() => setConfirmId(r.id)} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/10"><Icon name="trash" className="w-3.5 h-3.5"/>Delete</button></div>
            </article>
          ))}
        </div>
      )}
      {open && <Modal title={edit ? 'Edit service' : 'Add service'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-[5rem_1fr] gap-4">
            <Field label="Icon"><input value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🔍" className={inputClass}/></Field>
            <Field label="Title"><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Service title" className={inputClass} required/></Field>
          </div>
          <Field label="Description"><textarea value={form.description} onChange={e => set('description', e.target.value)} rows="3" className={inputClass}/></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price"><input value={form.price} onChange={e => set('price', e.target.value)} placeholder="₹ / project" className={inputClass}/></Field>
            <Field label="Sort order"><input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} className={inputClass}/></Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={busy} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">{busy ? 'Saving...' : edit ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>}
      {confirmId && <Confirm text="Delete this service permanently?" onCancel={() => setConfirmId(null)} onConfirm={remove} busy={busy}/>}
    </div>
  )
}
