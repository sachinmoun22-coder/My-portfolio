import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Confirm, EmptyState, ErrorBanner, Field, Icon, inputClass, Modal, Spinner } from '../components/ui'

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
  const [search, setSearch] = useState('')

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

  const query = search.trim().toLowerCase()
  const visible = query ? rows.filter(r => [r.title, r.description, r.price, r.icon].some(v => (v || '').toLowerCase().includes(query))) : rows

  return (
    <div>
      <div className="page-header">
        <div className="page-heading"><p className="eyebrow">Content</p><h2>Services</h2><p>{rows.length} services · changes appear on your site</p></div>
        <button onClick={openAdd} className="button primary"><Icon name="plus" className="icon-18"/>Add service</button>
      </div>
      <ErrorBanner message={error}/>
      <div className="toolbar">
        <div className="search-box"><Icon name="search" className="icon-18"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." className={inputClass}/></div>
      </div>
      {loading ? <Spinner label="Loading services..."/> : rows.length === 0 ? <EmptyState text="No services yet. Add your first one."/> : visible.length === 0 ? <EmptyState text="No matching services."/> : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Icon</th><th>Service</th><th>Price</th><th>Order</th><th>Actions</th></tr></thead>
            <tbody>
              {visible.map(r => (
                <tr key={r.id}>
                  <td><span className="settings-icon">{r.icon || '✦'}</span></td>
                  <td><span className="table-title">{r.title}</span><p className="table-muted">{r.description || 'No description'}</p></td>
                  <td><span className="status-pill published">{r.price || '—'}</span></td>
                  <td>{r.sort_order ?? 0}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => openEdit(r)} className="button secondary icon-only" aria-label={`Edit ${r.title}`}><Icon name="edit" className="icon-16"/></button>
                      <button onClick={() => setConfirmId(r.id)} className="button danger icon-only" aria-label={`Delete ${r.title}`}><Icon name="trash" className="icon-16"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && <Modal title={edit ? 'Edit service' : 'Add service'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="form-grid">
          <div className="form-row">
            <Field label="Icon"><input value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🔍" className={inputClass}/></Field>
            <Field label="Title"><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Service title" className={inputClass} required/></Field>
          </div>
          <Field label="Description"><textarea value={form.description} onChange={e => set('description', e.target.value)} rows="3" className={inputClass}/></Field>
          <div className="form-row">
            <Field label="Price"><input value={form.price} onChange={e => set('price', e.target.value)} placeholder="₹ / project" className={inputClass}/></Field>
            <Field label="Sort order"><input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} className={inputClass}/></Field>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setOpen(false)} className="button secondary">Cancel</button>
            <button type="submit" disabled={busy} className="button primary">{busy ? 'Saving...' : edit ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>}
      {confirmId && <Confirm text="Delete this service permanently?" onCancel={() => setConfirmId(null)} onConfirm={remove} busy={busy}/>}
    </div>
  )
}
