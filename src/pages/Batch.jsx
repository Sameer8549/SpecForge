import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Batch.css'
import { EmptyState, ErrorInline } from '../components/States'

const BATCH_ROWS = [
  { mpn: 'LM741CN',   brand: 'Texas Instruments',  fields: 11, missing: 3, conf: 0.91, status: 'complete', wo: 'WO-001' },
  { mpn: 'BC547B',    brand: 'Fairchild',           fields: 9,  missing: 2, conf: 0.84, status: 'review',   wo: 'WO-002' },
  { mpn: '1N4007',    brand: 'ON Semiconductor',    fields: 8,  missing: 1, conf: 0.78, status: 'review',   wo: 'WO-003' },
  { mpn: 'LM358N',    brand: 'Texas Instruments',   fields: 12, missing: 0, conf: 0.97, status: 'complete', wo: 'WO-004' },
  { mpn: 'NE555P',    brand: 'Texas Instruments',   fields: 10, missing: 2, conf: 0.88, status: 'complete', wo: 'WO-005' },
  { mpn: 'ATmega328P',brand: 'Microchip',            fields: 14, missing: 4, conf: 0.73, status: 'error',    wo: 'WO-006' },
  { mpn: 'IRF540N',   brand: 'International Rect.', fields: 11, missing: 1, conf: 0.93, status: 'processing',wo:'WO-007' },
  { mpn: '7805',      brand: 'Fairchild',           fields: 8,  missing: 0, conf: 0.96, status: 'pending',  wo: 'WO-008' },
]

function StatusCell({ status }) {
  const map = {
    complete:   { color: 'var(--green)', label: '✓ Complete' },
    review:     { color: 'var(--amber)', label: '⚠ Review' },
    error:      { color: 'var(--red)',   label: '✗ Error' },
    processing: { color: 'var(--text-primary)', label: '► Processing' },
    pending:    { color: 'var(--text-dim)',  label: '○ Pending' },
  }
  const s = map[status] || map.pending
  return (
    <span className="batch-status-cell" style={{ color: s.color }}>
      {s.label}
    </span>
  )
}

export default function Batch() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [drag, setDrag] = useState(false)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processed, setProcessed] = useState(0)
  const timerRef = useRef(null)

  const totalRows = BATCH_ROWS.length
  const complete  = BATCH_ROWS.filter(r => r.status === 'complete').length
  const inReview  = BATCH_ROWS.filter(r => r.status === 'review').length
  const errors    = BATCH_ROWS.filter(r => r.status === 'error').length

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
  }

  const startBatch = () => {
    if (!file) return
    setRunning(true)
    setProgress(0)
    setProcessed(0)

    // Simulated incremental progress
    let p = 0
    timerRef.current = setInterval(() => {
      p += Math.random() * 8 + 2
      if (p >= 100) {
        p = 100
        clearInterval(timerRef.current)
        setRunning(false)
      }
      setProgress(Math.min(Math.round(p), 100))
      setProcessed(Math.round((p / 100) * BATCH_ROWS.length))
    }, 300)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  return (
    <div className="batch-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Batch Mode</span>
          <h1 className="page-header-title">Bulk Processing</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-ghost" onClick={() => navigate('/history')}>View Library</button>
        </div>
      </div>

      <div className="batch-layout">
        {/* Upload section */}
        <div className="batch-upload-zone">
          <div className="text-label" style={{ marginBottom: 16 }}>// CSV Upload</div>
          <div
            className={`batch-drop${drag ? ' drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
          >
            <input type="file" accept=".csv" onChange={e => handleFile(e.target.files[0])} />
            <svg className="batch-drop-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <div className="batch-drop-label">
              {file ? file.name : 'Drop CSV file here'}
            </div>
            <div className="batch-drop-hint">.CSV — Required columns: mpn, brand, description</div>
            <div className="batch-drop-req">
              Optional: datasheet_url, notes, internal_ref
            </div>
          </div>
          <div className="batch-upload-actions">
            <button
              className="btn btn-primary"
              disabled={!file || running}
              onClick={startBatch}
            >
              {running ? `Processing ${processed}/${BATCH_ROWS.length}...` : 'Start Batch ›'}
            </button>
            {file && (
              <button className="btn btn-ghost" onClick={() => setFile(null)} disabled={running}>
                Remove File
              </button>
            )}
            <button className="btn btn-ghost" style={{ marginLeft: 'auto' }}>
              Download Template
            </button>
          </div>
        </div>

        {/* Progress section */}
        {(running || progress > 0) && (
          <div className="batch-progress-section">
            <div className="batch-progress-meta">
              <span className="batch-progress-label">
                {running ? '[ Processing ]' : '[ Complete ]'} — {processed}/{BATCH_ROWS.length} SKUs
              </span>
              <span className="batch-progress-pct">{progress}%</span>
            </div>
            <div className="batch-gauge-track">
              <div className="batch-gauge-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="batch-stats">
              <div className="batch-stat-cell">
                <div className="batch-stat-num">{BATCH_ROWS.length}</div>
                <div className="batch-stat-lbl">Total SKUs</div>
              </div>
              <div className="batch-stat-cell">
                <div className="batch-stat-num" style={{ color: 'var(--green)' }}>{complete}</div>
                <div className="batch-stat-lbl">Complete</div>
              </div>
              <div className="batch-stat-cell">
                <div className="batch-stat-num" style={{ color: 'var(--amber)' }}>{inReview}</div>
                <div className="batch-stat-lbl">In Review</div>
              </div>
              <div className="batch-stat-cell">
                <div className="batch-stat-num" style={{ color: 'var(--red)' }}>{errors}</div>
                <div className="batch-stat-lbl">Errors</div>
              </div>
              <div className="batch-stat-cell">
                <div className="batch-stat-num">{BATCH_ROWS.length - complete - inReview - errors}</div>
                <div className="batch-stat-lbl">Pending</div>
              </div>
            </div>
          </div>
        )}

        {/* Results table */}
        <div className="batch-results">
          <div className="batch-table-actions">
            <span className="text-label">// Results ({BATCH_ROWS.length} SKUs)</span>
            <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '5px 12px' }}>
              Export All
            </button>
          </div>

          {BATCH_ROWS.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-art">{'[ CSV ]'}</div>
              <div className="empty-state-title">No Batch Uploaded</div>
              <div className="empty-state-desc">Upload a CSV file above to begin bulk processing.</div>
              <button className="btn" onClick={() => {}}>Download Template</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>MPN</th>
                  <th>Brand</th>
                  <th>Fields</th>
                  <th>Missing</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {BATCH_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td className="td-primary">{row.mpn}</td>
                    <td>{row.brand}</td>
                    <td>{row.fields}</td>
                    <td style={{ color: row.missing > 0 ? 'var(--amber)' : 'var(--text-muted)' }}>
                      {row.missing}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          color: row.conf >= 0.9 ? 'var(--green)' : row.conf >= 0.75 ? 'var(--amber)' : 'var(--red)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem'
                        }}>
                          {Math.round(row.conf * 100)}%
                        </span>
                      </div>
                    </td>
                    <td><StatusCell status={row.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {row.status !== 'pending' && row.status !== 'processing' && (
                          <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: '0.5625rem' }}
                            onClick={() => navigate(`/record/${row.wo}`)}>
                            View
                          </button>
                        )}
                        {row.status === 'error' && (
                          <button className="btn btn-danger" style={{ padding: '3px 8px', fontSize: '0.5625rem' }}>
                            Retry
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
