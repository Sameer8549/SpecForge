import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './Input.css'

/* Placeholder brand strings from distributors — treated as blank */
const PLACEHOLDER_BRANDS = [
  '-- unbranded --',
  '-- no unilog brand --',
  '-- no brand --',
  'unbranded',
  'generic',
  'n/a',
  'na',
  'none',
  '--',
]

function isPlaceholderBrand(val) {
  return PLACEHOLDER_BRANDS.includes(val.trim().toLowerCase())
}

const PIPELINE_STAGES = [
  { num: '01', name: 'Clean' },
  { num: '02', name: 'Resolve Brand' },
  { num: '03', name: 'Classify' },
  { num: '04', name: 'Extract' },
  { num: '05', name: 'Normalize & Constrain' },
  { num: '06', name: 'Verify' },
  { num: '07', name: 'Adjudicate' },
  { num: '08', name: 'Build Description' },
  { num: '09', name: 'Audit' },
  { num: '10', name: 'Map Output' },
]

const RECENT = [
  { mpn: 'LM741CN', brand: 'Texas Instruments', wo: 'WO-20240811-001', status: 'complete' },
  { mpn: 'BC547B',  brand: 'Fairchild',          wo: 'WO-20240810-042', status: 'review' },
  { mpn: '1N4007',  brand: 'ON Semiconductor',   wo: 'WO-20240810-039', status: 'complete' },
]

/* ── CSV Preview row ─────────────────────────────────────── */
function CsvPreviewRow({ row, idx }) {
  const brandIsPlaceholder = isPlaceholderBrand(row.brand || '')
  return (
    <div className="csv-preview-row">
      <span className="csv-row-idx">{idx + 1}</span>
      <span className="csv-row-mpn">{row.mpn || '—'}</span>
      <span className={`csv-row-brand${brandIsPlaceholder ? ' placeholder' : ''}`}>
        {brandIsPlaceholder
          ? <><span className="placeholder-tag">blank</span> {row.brand}</>
          : (row.brand || '—')}
      </span>
      <span className="csv-row-mfr">{row.manufacturer || '—'}</span>
      <span className="csv-row-desc">{row.description ? row.description.slice(0, 40) + (row.description.length > 40 ? '…' : '') : '—'}</span>
    </div>
  )
}

export default function Input() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const csvRef = useRef(null)

  /* mode: 'single' | 'csv' */
  const [mode, setMode] = useState('single')

  const [form, setForm] = useState({
    mpn: '',
    brand: '',
    manufacturer: '',
    description: '',
    uom: '',
    notes: '',
  })
  const [datasheet, setDatasheet] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [csvPreview, setCsvPreview] = useState([])
  const [csvDragOver, setCsvDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const brandIsPlaceholder = isPlaceholderBrand(form.brand)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  /* Datasheet handler */
  const handleDatasheet = (f) => {
    if (!f) return
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setErrors(e => ({ ...e, file: 'Unsupported format. Use PDF, JPEG, PNG, or WEBP.' }))
      return
    }
    setDatasheet(f)
    setErrors(e => ({ ...e, file: '' }))
  }

  /* CSV parse (naive but illustrative) */
  const parseCsv = useCallback((text) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    return lines.slice(1, 11).map(line => {
      const cols = line.split(',')
      const obj = {}
      headers.forEach((h, i) => { obj[h] = (cols[i] || '').trim() })
      // normalise known column aliases
      return {
        mpn: obj.mpn || obj.manufacturer_part_number || obj.part_number || '',
        brand: obj.brand || obj.brand_name || '',
        manufacturer: obj.manufacturer || obj.mfr || '',
        description: obj.description || obj.short_description || obj.desc || '',
        uom: obj.uom || obj.unit_of_measure || '',
      }
    })
  }, [])

  const handleCsv = (f) => {
    if (!f) return
    if (!f.name.endsWith('.csv') && f.type !== 'text/csv') {
      setErrors(e => ({ ...e, csv: 'Only CSV files are accepted.' }))
      return
    }
    setCsvFile(f)
    setErrors(e => ({ ...e, csv: '' }))
    const reader = new FileReader()
    reader.onload = (ev) => {
      const rows = parseCsv(ev.target.result)
      setCsvPreview(rows)
    }
    reader.readAsText(f)
  }

  /* Validation */
  const validate = () => {
    const e = {}
    if (mode === 'single') {
      if (!form.mpn.trim()) e.mpn = 'MPN is required'
    } else {
      if (!csvFile) e.csv = 'Upload a CSV file to continue'
    }
    return e
  }

  const submit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    setTimeout(() => {
      if (mode === 'csv') {
        navigate('/batch')
      } else {
        navigate('/pipeline/WO-20240811-001')
      }
    }, 800)
  }

  /* Readiness score (single mode) */
  const singleChecklist = [
    { key: 'mpn',          label: 'MPN',                ok: !!form.mpn.trim(), required: true },
    { key: 'brand',        label: 'Brand / Manufacturer', ok: !!form.brand.trim() && !brandIsPlaceholder, required: false },
    { key: 'manufacturer', label: 'Manufacturer',       ok: !!form.manufacturer.trim(), required: false },
    { key: 'description',  label: 'Short Description',  ok: !!form.description.trim(), required: false },
    { key: 'uom',          label: 'Unit of Measure',    ok: !!form.uom.trim(), required: false },
    { key: 'datasheet',    label: 'Datasheet',          ok: !!datasheet, required: false },
  ]
  const filled = singleChecklist.filter(c => c.ok).length
  const readiness = Math.round((filled / singleChecklist.length) * 100)

  return (
    <div className="input-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Operations</span>
          <h1 className="page-header-title">New Work Order</h1>
        </div>
        <div className="page-header-right">
          {/* Mode toggle */}
          <div className="input-mode-toggle">
            <button
              id="mode-single"
              className={`input-mode-btn${mode === 'single' ? ' active' : ''}`}
              onClick={() => setMode('single')}
            >
              Single Record
            </button>
            <button
              id="mode-csv"
              className={`input-mode-btn${mode === 'csv' ? ' active' : ''}`}
              onClick={() => setMode('csv')}
            >
              CSV Upload
            </button>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/history')}>View Library</button>
        </div>
      </div>

      <div className="input-grid">
        {/* Form column */}
        <div className="input-form-col">

          {/* ── SINGLE RECORD MODE ─────────────────────── */}
          {mode === 'single' && (
            <>
              {/* Catalog row fields */}
              <div className="input-section">
                <div className="input-section-label">// Distributor Catalog Row</div>
                <div className="input-fields">
                  <div className="input-row">
                    <div className="field">
                      <label className="field-label" htmlFor="inp-mpn">
                        MPN — Manufacturer Part Number <span className="field-required">required</span>
                      </label>
                      <input
                        id="inp-mpn"
                        className={`field-input${errors.mpn ? ' field-input-error' : ''}`}
                        placeholder="e.g. LM741CN/NOPB"
                        value={form.mpn}
                        onChange={e => set('mpn', e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      {errors.mpn && <span className="field-error">[ ERROR ] {errors.mpn}</span>}
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="inp-uom">
                        Unit of Measure
                      </label>
                      <input
                        id="inp-uom"
                        className="field-input"
                        placeholder="e.g. EA, EACH, each, Each, BOX…"
                        value={form.uom}
                        onChange={e => set('uom', e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <span className="field-hint">Exact distributor value — pipeline will normalize to approved LOV form.</span>
                    </div>
                  </div>

                  <div className="input-row">
                    <div className="field">
                      <label className="field-label" htmlFor="inp-brand">
                        Brand (raw distributor value)
                      </label>
                      <input
                        id="inp-brand"
                        className={`field-input${brandIsPlaceholder ? ' field-input-placeholder' : ''}`}
                        placeholder='e.g. Texas Instruments, "-- No Unilog Brand --"'
                        value={form.brand}
                        onChange={e => set('brand', e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      {brandIsPlaceholder && (
                        <div className="field-placeholder-warn">
                          <span className="placeholder-tag">blank</span>
                          Placeholder detected — will be resolved from manufacturer field or flagged for review.
                        </div>
                      )}
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="inp-mfr">
                        Manufacturer (raw)
                      </label>
                      <input
                        id="inp-mfr"
                        className="field-input"
                        placeholder="e.g. Texas Instruments Inc."
                        value={form.manufacturer}
                        onChange={e => set('manufacturer', e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <span className="field-hint">Pipeline will fuzzy-match to canonical Unicat form.</span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="inp-desc">
                      Short Description (raw distributor text)
                    </label>
                    <textarea
                      id="inp-desc"
                      className="field-input"
                      placeholder="e.g. OP AMP, SGL, 1MHZ, 0.5V/US, DIP-8 ±18V — paste the exact distributor description"
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      rows={3}
                      style={{ resize: 'vertical', minHeight: '80px' }}
                    />
                    <span className="field-hint">Paste the unmodified distributor string. Pipeline will extract and normalize attributes from it.</span>
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="inp-notes">Internal Notes (optional)</label>
                    <input
                      id="inp-notes"
                      className="field-input"
                      placeholder="Work order reference, buyer notes, category hints…"
                      value={form.notes}
                      onChange={e => set('notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Datasheet upload */}
              <div className="input-section">
                <div className="input-section-label">// Datasheet / Source Document (optional)</div>
                <div
                  className={`drop-zone${dragOver ? ' drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setDragOver(false)
                    handleDatasheet(e.dataTransfer.files[0])
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={e => handleDatasheet(e.target.files[0])}
                    ref={fileRef}
                  />
                  <svg className="drop-zone-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  <span className="drop-zone-label">Drop Manufacturer Datasheet</span>
                  <span className="drop-zone-hint">PDF · JPEG · PNG · WEBP — max 20 MB</span>
                </div>
                {errors.file && <span className="field-error">[ ERROR ] {errors.file}</span>}
                {datasheet && (
                  <div className="drop-file-preview">
                    <span className="drop-file-name">{datasheet.name}</span>
                    <span className="drop-file-size">{(datasheet.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button className="btn btn-ghost" style={{padding:'4px 10px'}} onClick={() => setDatasheet(null)}>Remove</button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── CSV UPLOAD MODE ────────────────────────── */}
          {mode === 'csv' && (
            <>
              <div className="input-section">
                <div className="input-section-label">// CSV Batch Upload</div>
                <div
                  className={`drop-zone drop-zone-csv${csvDragOver ? ' drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setCsvDragOver(true) }}
                  onDragLeave={() => setCsvDragOver(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setCsvDragOver(false)
                    handleCsv(e.dataTransfer.files[0])
                  }}
                >
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={e => handleCsv(e.target.files[0])}
                    ref={csvRef}
                  />
                  <svg className="drop-zone-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="0"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="3" y1="15" x2="21" y2="15"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                    <line x1="15" y1="3" x2="15" y2="21"/>
                  </svg>
                  <span className="drop-zone-label">Drop CSV File</span>
                  <span className="drop-zone-hint">Columns: MPN, Brand, Manufacturer, Description, UOM</span>
                  <span className="drop-zone-hint">Placeholder brand values will be automatically flagged</span>
                </div>
                {errors.csv && <span className="field-error" style={{marginTop:8}}>[ ERROR ] {errors.csv}</span>}

                {csvFile && (
                  <div className="drop-file-preview">
                    <span className="drop-file-name">{csvFile.name}</span>
                    <span className="drop-file-size">{(csvFile.size / 1024).toFixed(1)} KB</span>
                    <button className="btn btn-ghost" style={{padding:'4px 10px'}} onClick={() => { setCsvFile(null); setCsvPreview([]) }}>Remove</button>
                  </div>
                )}
              </div>

              {/* CSV Preview */}
              {csvPreview.length > 0 && (
                <div className="input-section">
                  <div className="input-section-label">// Preview — first {csvPreview.length} rows</div>
                  <div className="csv-preview">
                    <div className="csv-preview-header">
                      <span>#</span>
                      <span>MPN</span>
                      <span>Brand</span>
                      <span>Manufacturer</span>
                      <span>Description</span>
                    </div>
                    {csvPreview.map((row, i) => (
                      <CsvPreviewRow key={i} row={row} idx={i} />
                    ))}
                  </div>
                  <div className="csv-placeholder-note">
                    <span className="placeholder-tag">blank</span>
                    Placeholder brand values are flagged — pipeline will attempt resolution from Manufacturer column.
                  </div>
                </div>
              )}

              {/* Demo preview if no file yet */}
              {!csvFile && (
                <div className="input-section">
                  <div className="input-section-label">// Expected Column Format</div>
                  <div className="csv-preview">
                    <div className="csv-preview-header">
                      <span>#</span>
                      <span>MPN</span>
                      <span>Brand</span>
                      <span>Manufacturer</span>
                      <span>Description</span>
                    </div>
                    {[
                      { mpn: 'LM741CN/NOPB', brand: '-- No Unilog Brand --', manufacturer: 'Texas Instruments Inc.', description: 'OP AMP, SGL, 1MHZ, DIP-8' },
                      { mpn: 'BC547B', brand: 'Fairchild', manufacturer: 'Fairchild Semiconductor', description: 'NPN Transistor, 45V, TO-92' },
                      { mpn: '1N4007', brand: '-- Unbranded --', manufacturer: 'ON Semiconductor', description: 'Rectifier Diode, 1A, 1000V, DO-41' },
                    ].map((row, i) => (
                      <CsvPreviewRow key={i} row={row} idx={i} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="input-actions">
            <button
              className="btn btn-primary"
              onClick={submit}
              disabled={submitting}
              id="submit-work-order"
            >
              {submitting
                ? '[ Processing… ]'
                : mode === 'csv'
                  ? 'Queue Batch ›'
                  : 'Process Work Order ›'}
            </button>
            {mode === 'single' && (
              <button
                className="btn btn-ghost"
                onClick={() => { setForm({ mpn:'', brand:'', manufacturer:'', description:'', uom:'', notes:'' }); setDatasheet(null); setErrors({}) }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="input-sidebar-col">
          {/* Readiness — single mode */}
          {mode === 'single' && (
            <div className="input-sidebar-section">
              <div className="input-sidebar-title">// Input Readiness</div>
              <div className="input-checklist">
                {singleChecklist.map(c => (
                  <div key={c.key} className={`input-checklist-item${c.ok ? ' filled' : ''}${c.key === 'brand' && brandIsPlaceholder ? ' warn' : ''}`}>
                    <div className="input-checklist-dot" />
                    <span>{c.label}</span>
                    {c.required && <span className="checklist-req">req</span>}
                    {c.key === 'brand' && brandIsPlaceholder && (
                      <span className="placeholder-tag">blank</span>
                    )}
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
          )}

          {/* CSV stats — csv mode */}
          {mode === 'csv' && csvPreview.length > 0 && (
            <div className="input-sidebar-section">
              <div className="input-sidebar-title">// Batch Summary</div>
              <div className="input-checklist">
                <div className="input-checklist-item filled">
                  <div className="input-checklist-dot" />
                  {csvPreview.length} rows loaded (preview)
                </div>
                <div className="input-checklist-item warn">
                  <div className="input-checklist-dot" />
                  {csvPreview.filter(r => isPlaceholderBrand(r.brand || '')).length} placeholder brands flagged
                </div>
                <div className="input-checklist-item">
                  <div className="input-checklist-dot" />
                  All rows queued for full 10-stage pipeline
                </div>
              </div>
            </div>
          )}

          {/* Pipeline stages */}
          <div className="input-sidebar-section">
            <div className="input-sidebar-title">// 10-Stage Pipeline</div>
            <div className="input-checklist">
              {PIPELINE_STAGES.map(s => (
                <div key={s.num} className="input-checklist-item">
                  <div className="input-checklist-dot" />
                  [ {s.num} ] {s.name}
                </div>
              ))}
            </div>
          </div>

          {/* Recent */}
          <div className="input-sidebar-section">
            <div className="input-sidebar-title">// Recent Records</div>
            {RECENT.map(r => (
              <div key={r.mpn} className="input-recent-row" onClick={() => navigate(`/record/${r.wo}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="input-recent-mpn">{r.mpn}</span>
                  <span className={`badge${r.status === 'complete' ? ' badge-verified' : ' badge-warning'}`}>
                    {r.status}
                  </span>
                </div>
                <span className="input-recent-brand">{r.brand}</span>
                <span className="input-recent-wo">{r.wo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
