import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Confirm, EmptyState, ErrorBanner, Field, Icon, inputClass, Modal, Spinner } from '../components/ui'

const blank = { title: '', description: '', tech_stack: '', category: '', link: '', status: 'Published', image_url: '', sort_order: 0 }

export default function Projects({ notify, onChange }) {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(blank)
  const [edit, setEdit] = useState(null)
  const [file, setFile] = useState(null)
  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const load = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('sort_order')
      if (error) throw error
      setRows((data || []).map(r => ({ ...r, status: r.visible === false ? 'Draft' : 'Published' })))
      setError('')
    } catch (err) {
      console.error('Projects load failed:', err)
      setError(err.message || 'Could not load projects.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const openAdd = () => { setForm(blank); setEdit(null); setFile(null); setOpen(true) }
  const openEdit = row => {
    setForm({ title: row.title || '', description: row.description || '', tech_stack: row.tech_stack || '', category: row.category || '', link: row.link || '', status: row.status, image_url: row.image_url || '', sort_order: row.sort_order || 0 })
    setEdit(row.id)
    setFile(null)
    setOpen(true)
  }

  const upload = async () => {
    if (!file) return form.image_url
    const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `projects/${Date.now()}-${name}`
    const { error } = await supabase.storage.from('portfolio').upload(path, file, { contentType: file.type })
    if (error) throw error
    const { data } = supabase.storage.from('portfolio').getPublicUrl(path)
    return data.publicUrl
  }

  const save = async e => {
    e.preventDefault()
    setBusy(true)
    try {
      if (!form.title.trim()) throw new Error('Title is required')
      const image_url = await upload()
      const payload = {
        title: form.title.trim(),
        description: form.description,
        tech_stack: form.tech_stack,
        category: form.category,
        link: form.link,
        visible: form.status === 'Published',
        image_url,
        sort_order: Number(form.sort_order) || 0
      }
      const result = edit
        ? await supabase.from('projects').update(payload).eq('id', edit)
        : await supabase.from('projects').insert(payload)
      if (result.error) throw result.error
      setOpen(false)
      notify(edit ? 'Project updated' : 'Project added')
      setError('')
      await load()
      onChange?.()
    } catch (err) {
      console.error('Project save failed:', err)
      notify(err.message || 'Could not save project', 'error')
      setError(err.message || 'Could not save project')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    const id = confirmId
    setConfirmId(null)
    setBusy(true)
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      notify('Project deleted')
      setError('')
      await load()
      onChange?.()
    } catch (err) {
      console.error('Project delete failed:', err)
      notify(err.message || 'Could not delete project', 'error')
      setError(err.message || 'Could not delete project')
    } finally {
      setBusy(false)
    }
  }

  const query = search.trim().toLowerCase()
  const visible = rows.filter(r => {
    const matchesQuery = !query || [r.title, r.description, r.tech_stack, r.category].some(v => (v || '').toLowerCase().includes(query))
    const matchesFilter = filter === 'All' || r.status === filter
    return matchesQuery && matchesFilter
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-heading"><p className="eyebrow">Content</p><h2>Projects</h2><p>{rows.length} projects · published ones appear on your site</p></div>
        <button onClick={openAdd} className="button primary"><Icon name="plus" className="icon-18"/>Add project</button>
      </div>
      <ErrorBanner message={error}/>
      <div className="toolbar">
        <div className="search-box"><Icon name="search" className="icon-18"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className={inputClass}/></div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className={`${inputClass} filter-select`}><option>All</option><option>Published</option><option>Draft</option></select>
      </div>
      {loading ? <Spinner label="Loading projects..."/> : rows.length === 0 ? <EmptyState text="No projects yet. Add your first one."/> : visible.length === 0 ? <EmptyState text="No matching projects."/> : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Project</th><th>Category</th><th>Tech stack</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {visible.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {r.image_url ? <img src={r.image_url} alt="" className="thumb"/> : <span className="thumb thumb-placeholder"><Icon name="image" className="icon-20"/></span>}
                      <div><span className="table-title">{r.title}</span><p className="table-muted">{r.description || 'No description'}</p></div>
                    </div>
                  </td>
                  <td>{r.category || 'Other'}</td>
                  <td><div className="tag-list">{r.tech_stack ? String(r.tech_stack).split(',').map((tag, i) => <span className="tag" key={i}>{tag.trim()}</span>) : <span className="tag">—</span>}</div></td>
                  <td><span className={`status-pill ${r.status === 'Published' ? 'published' : 'draft'}`}>{r.status}</span></td>
                  <td>
                    <div className="table-actions">
                      {r.link && <a href={r.link} target="_blank" rel="noopener" className="button secondary small" aria-label="Open live project">Open</a>}
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
      {open && <Modal title={edit ? 'Edit project' : 'Add project'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="form-grid">
          <Field label="Title"><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Project title" className={inputClass} required/></Field>
          <Field label="Description"><textarea value={form.description} onChange={e => set('description', e.target.value)} rows="3" placeholder="What did you build?" className={inputClass}/></Field>
          <div className="form-row">
            <Field label="Tech stack"><input value={form.tech_stack} onChange={e => set('tech_stack', e.target.value)} placeholder="React, Firebase, Node.js" className={inputClass}/></Field>
            <Field label="Category"><input value={form.category} onChange={e => set('category', e.target.value)} placeholder="Web app" className={inputClass}/></Field>
          </div>
          <Field label="Live URL"><input value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://..." className={inputClass}/></Field>
          <div className="form-row">
            <Field label="Status"><select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass}><option>Published</option><option>Draft</option></select></Field>
            <Field label="Sort order"><input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} className={inputClass}/></Field>
          </div>
          <Field label="Image"><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className={inputClass}/></Field>
          {form.image_url && !file && <img src={form.image_url} alt="Current project" className="thumb"/>}
          <div className="form-actions">
            <button type="button" onClick={() => setOpen(false)} className="button secondary">Cancel</button>
            <button type="submit" disabled={busy} className="button primary">{busy ? 'Saving...' : edit ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>}
      {confirmId && <Confirm text="Delete this project permanently?" onCancel={() => setConfirmId(null)} onConfirm={remove} busy={busy}/>}
    </div>
  )
}
