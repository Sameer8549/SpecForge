import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Input.css'

const RECENT = [
  { mpn: 'LM741CN', brand: 'Texas Instruments' },
  { mpn: 'BC547B', brand: 'Fairchild Semiconductor' },
  { mpn: '1N4007', brand: 'ON Semiconductor' },
]

export default function Input() {
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    mpn: '',
    brand: '',
    description: '',
    notes: ''
  })
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  const handleFile = (f) => {
    if (!f) return
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setErrors(e => ({ ...e, file: 'Unsupported format. Use PDF, JPEG, PNG, or WEBP.' }))
      return
    }
    setFile(f)
    setErrors(e => ({ ...e, file: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.mpn.trim()) e.mpn = 'MPN is required'
    if (!form.brand.trim()) e.brand = 'Brand is required'
    return e
  }

  const submit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    // Simulate async submission
    setTimeout(() => {
      navigate('/pipeline/WO-20240811-001')
    }, 800)
  }

  // Readiness score
  const filled = [form.mpn, form.brand, form.description, file].filter(Boolean).length
  const readiness = Math.round((filled / 4) * 100)

  const checklist = [
    { key: 'mpn',         label: 'MPN',                  ok: !!form.mpn.trim() },
    { key: 'brand',       label: 'Brand',                 ok: !!form.brand.trim() },
    { key: 'description', label: 'Short Description',     ok: !!form.description.trim() },
    { key: 'file',        label: 'Datasheet (optional)',   ok: !!file },
  ]

  return (
    <div className="input-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Operations</span>
          <h1 className="page-header-title">New Work Order</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-ghost" onClick={() => navigate('/history')}>View Library</button>
        </div>
      </div>

      <div className="input-grid">
        {/* Form column */}
        <div className="input-form-col">
          {/* Required fields */}
          <div className="input-section">
            <div className="input-section-label">// Required Identifiers</div>
            <div className="input-fields">
              <div className="input-row">
                <div className="field">
                  <label className="field-label" htmlFor="inp-mpn">MPN — Manufacturer Part Number</label>
                  <input
                    id="inp-mpn"
                    className={`field-input${errors.mpn ? ' field-input-error' : ''}`}
                    placeholder="e.g. LM741CN"
                    value={form.mpn}
                    onChange={e => set('mpn', e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {errors.mpn && <span className="field-error">[ ERROR ] {errors.mpn}</span>}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="inp-brand">Brand / Manufacturer</label>
                  <input
                    id="inp-brand"
                    className={`field-input${errors.brand ? ' field-input-error' : ''}`}
                    placeholder="e.g. Texas Instruments"
                    value={form.brand}
                    onChange={e => set('brand', e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {errors.brand && <span className="field-error">[ ERROR ] {errors.brand}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="input-section">
            <div className="input-section-label">// Product Description</div>
            <div className="input-fields">
              <div className="field">
                <label className="field-label" htmlFor="inp-desc">Short Description</label>
                <textarea
                  id="inp-desc"
                  className="field-input"
                  placeholder="e.g. Single operational amplifier, ±15V supply, 1MHz bandwidth"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
                <span className="field-hint">Include any known specs, application context, or category hints.</span>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="inp-notes">Internal Notes (optional)</label>
                <input
                  id="inp-notes"
                  className="field-input"
                  placeholder="Work order reference, buyer notes..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Datasheet upload */}
          <div className="input-section">
            <div className="input-section-label">// Datasheet Upload (optional)</div>
            <div
              className={`drop-zone${dragOver ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault()
                setDragOver(false)
                handleFile(e.dataTransfer.files[0])
              }}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={e => handleFile(e.target.files[0])}
                ref={fileRef}
              />
              <svg className="drop-zone-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              <span className="drop-zone-label">Drop PDF or image</span>
              <span className="drop-zone-hint">PDF · JPEG · PNG · WEBP — max 20 MB</span>
            </div>
            {errors.file && <span className="field-error">[ ERROR ] {errors.file}</span>}
            {file && (
              <div className="drop-file-preview">
                <span className="drop-file-name">{file.name}</span>
                <span className="drop-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <button className="btn btn-ghost" style={{padding:'4px 10px'}} onClick={() => setFile(null)}>Remove</button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="input-actions">
            <button
              className="btn btn-primary"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Process Work Order ›'}
            </button>
            <button className="btn btn-ghost" onClick={() => setForm({ mpn:'', brand:'', description:'', notes:'' })}>
              Clear
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="input-sidebar-col">
          {/* Readiness */}
          <div className="input-sidebar-section">
            <div className="input-sidebar-title">// Input Readiness</div>
            <div className="input-checklist">
              {checklist.map(c => (
                <div key={c.key} className={`input-checklist-item${c.ok ? ' filled' : ''}`}>
                  <div className="input-checklist-dot" />
                  {c.label}
                </div>
              ))}
            </div>
            <div className="input-readiness-bar">
              <div className="input-readiness-label">
                <span>Readiness</span>
                <span>{readiness}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${readiness}%` }} />
              </div>
            </div>
          </div>

          {/* Pipeline preview */}
          <div className="input-sidebar-section">
            <div className="input-sidebar-title">// Pipeline Stages</div>
            <div className="input-checklist">
              {['Classify', 'Extract', 'Verify', 'Adjudicate', 'Audit'].map((s, i) => (
                <div key={s} className="input-checklist-item">
                  <div className="input-checklist-dot" />
                  [ {String(i+1).padStart(2,'0')} ] {s}
                </div>
              ))}
            </div>
          </div>

          {/* Recent records */}
          <div className="input-sidebar-section">
            <div className="input-sidebar-title">// Recent Records</div>
            {RECENT.map(r => (
              <div key={r.mpn} className="input-recent-row" onClick={() => navigate('/history')}>
                <span className="input-recent-mpn">{r.mpn}</span>
                <span className="input-recent-brand">{r.brand}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
