import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './Record.css'

const RECORD = {
  mpn: 'LM741CN',
  brand: 'Texas Instruments',
  category: 'Electronics › ICs › Operational Amplifiers — General Purpose',
  categoryCode: '32131601',
  meanConfidence: 0.91,
  fields: {
    'Electrical': [
      { name: 'Supply Voltage',          value: '±18V',    conf: 0.97, req: true,  sources: [{ src:'SRC-A', val:'±18V', url:'ti.com' }, { src:'SRC-B', val:'±22V', url:'octopart.com' }, { src:'SRC-D', val:'±18V', url:'mouser.com' }] },
      { name: 'Input Offset Voltage',    value: '6mV',     conf: 0.94, req: true,  sources: [{ src:'SRC-A', val:'6mV', url:'ti.com' }, { src:'SRC-D', val:'6mV', url:'mouser.com' }] },
      { name: 'Gain Bandwidth Product',  value: '1MHz',    conf: 0.99, req: true,  sources: [{ src:'SRC-A', val:'1MHz', url:'ti.com' }, { src:'SRC-B', val:'1MHz', url:'octopart.com' }, { src:'SRC-C', val:'1MHz', url:'datasheetarchive.com' }, { src:'SRC-D', val:'1MHz', url:'mouser.com' }] },
      { name: 'Slew Rate',               value: '0.5V/μs', conf: 0.93, req: true,  sources: [{ src:'SRC-A', val:'0.5V/μs', url:'ti.com' }] },
      { name: 'Input Bias Current',      value: '80nA',    conf: 0.88, req: true,  sources: [{ src:'SRC-A', val:'80nA', url:'ti.com' }, { src:'SRC-D', val:'80nA', url:'mouser.com' }] },
      { name: 'Open Loop Gain',          value: '200V/mV', conf: 0.91, req: true,  sources: [{ src:'SRC-A', val:'200V/mV', url:'ti.com' }] },
      { name: 'Supply Current',          value: '1.7mA',   conf: 0.86, req: false, sources: [{ src:'SRC-A', val:'1.7mA', url:'ti.com' }, { src:'SRC-D', val:'1.7mA', url:'mouser.com' }] },
      { name: 'Output Current',          value: null,      conf: 0,    req: false, missing: true, sources: [] },
      { name: 'Input Impedance',         value: null,      conf: 0,    req: false, missing: true, sources: [] },
    ],
    'Environmental': [
      { name: 'Operating Temperature',   value: '0°C to 70°C', conf: 0.96, req: true,  sources: [{ src:'SRC-A', val:'0°C to 70°C', url:'ti.com' }, { src:'SRC-B', val:'0°C to 70°C', url:'octopart.com' }] },
      { name: 'Storage Temperature',     value: '-65°C to 150°C', conf: 0.89, req: false, sources: [{ src:'SRC-A', val:'-65°C to 150°C', url:'ti.com' }] },
    ],
    'Physical': [
      { name: 'Package Type',            value: 'DIP-8',   conf: 0.99, req: true,  sources: [{ src:'SRC-A', val:'DIP-8', url:'ti.com' }, { src:'SRC-B', val:'DIP-8', url:'octopart.com' }, { src:'SRC-D', val:'DIP-8', url:'mouser.com' }] },
      { name: 'Pin Count',               value: '8',       conf: 0.99, req: false, sources: [{ src:'SRC-A', val:'8', url:'ti.com' }] },
      { name: 'Channel Count',           value: null,      conf: 0,    req: false, missing: true, sources: [] },
    ],
  }
}

function ConfBar({ conf }) {
  const cls = conf >= 0.9 ? 'high' : conf >= 0.7 ? 'medium' : 'low'
  return (
    <div className="conf-bar">
      <div className="conf-bar-fill" style={{ width: `${conf * 100}%` }} data-cls={cls} />
    </div>
  )
}

function RecordField({ field, revealed }) {
  const [open, setOpen] = useState(false)
  const isMissing = field.missing
  const isEmpty = field.value === null && !field.missing

  return (
    <>
      <div className={`record-field-row${isMissing ? ' missing-known' : ''}`}>
        <div className="record-field-name">{field.name}</div>
        <div className={`record-field-value${revealed ? ' revealing' : ''}${isMissing ? ' missing-known' : ''}${isEmpty ? ' empty-field' : ''}`}>
          {isMissing ? (
            <>
              <span className="record-missing-tag">Known Missing</span>
              Not found in any source
            </>
          ) : field.value ? (
            field.value
          ) : (
            '—'
          )}
          {field.sources && field.sources.length > 0 && (
            <button className="record-expand-btn" onClick={() => setOpen(o => !o)}>
              {open ? '▲ Sources' : '▼ Sources'} ({field.sources.length})
            </button>
          )}
        </div>
        <div className="record-field-conf">
          {field.conf > 0 && (
            <>
              <div className="record-field-conf-pct">{Math.round(field.conf * 100)}%</div>
              <ConfBar conf={field.conf} />
            </>
          )}
        </div>
      </div>
      {field.sources && field.sources.length > 0 && (
        <div className={`record-provenance ${open ? 'open' : ''}`}>
          <div className="record-provenance-inner">
            {field.sources.map((s, i) => (
              <div key={i} className="record-provenance-row">
                <span className="record-provenance-src">[{s.src}]</span>
                <span className="record-provenance-val">{s.val}</span>
                <span className="record-provenance-link">{s.url} ↗</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default function Record() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200)
    return () => clearTimeout(t)
  }, [])

  const allFields = Object.values(RECORD.fields).flat()
  const populated = allFields.filter(f => f.value !== null && !f.missing).length
  const missing   = allFields.filter(f => f.missing).length
  const flagged   = allFields.filter(f => f.conf > 0 && f.conf < 0.8).length

  return (
    <div className="record-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Product Record — {id}</span>
          <h1 className="page-header-title">{RECORD.mpn}</h1>
        </div>
        <div className="page-header-right">
          <button className="btn" onClick={() => navigate(`/adjudication/${id}`)}>
            View Conflicts
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/queue')}>
            Review Queue ›
          </button>
        </div>
      </div>

      <div className="record-layout">
        {/* Main record */}
        <div className="record-main">
          <div className="record-identity">
            <div>
              <div className="record-mpn">{RECORD.mpn}</div>
              <div className="record-brand">{RECORD.brand}</div>
              <div className="record-category-path">
                {RECORD.category} — {RECORD.categoryCode}
              </div>
            </div>
            <div className="record-badges">
              <span className="badge badge-verified">✓ Verified</span>
              <span className="badge badge-neutral">WO-ID: {id}</span>
              <span className="badge badge-neutral">CONF: {Math.round(RECORD.meanConfidence * 100)}%</span>
            </div>
          </div>

          {/* Field sections */}
          {Object.entries(RECORD.fields).map(([section, fields]) => (
            <div key={section} className="record-section">
              <div className="record-section-title">// {section}</div>
              {fields.map((field, i) => (
                <RecordField key={i} field={field} revealed={revealed} />
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="record-sidebar">
          {/* Confidence summary */}
          <div className="record-sidebar-section">
            <div className="record-sidebar-title">// Record Summary</div>
            <div className="record-conf-summary">
              <div className="record-conf-cell">
                <div className="record-conf-num">{populated}</div>
                <div className="record-conf-lbl">Populated</div>
              </div>
              <div className="record-conf-cell">
                <div className="record-conf-num" style={{ color: 'var(--red)' }}>{missing}</div>
                <div className="record-conf-lbl">Known Missing</div>
              </div>
              <div className="record-conf-cell">
                <div className="record-conf-num" style={{ color: 'var(--amber)' }}>{flagged}</div>
                <div className="record-conf-lbl">Low Conf.</div>
              </div>
              <div className="record-conf-cell">
                <div className="record-conf-num">{Math.round(RECORD.meanConfidence * 100)}%</div>
                <div className="record-conf-lbl">Mean Conf.</div>
              </div>
            </div>
          </div>

          {/* Expected attrs checklist */}
          <div className="record-sidebar-section">
            <div className="record-sidebar-title">// Expected Attributes</div>
            {allFields.map((f, i) => (
              <div key={i} className="record-checklist-item">
                <span className={`record-check-icon${f.missing ? ' miss' : f.conf < 0.8 && f.conf > 0 ? ' low' : ' ok'}`}>
                  {f.missing ? '✗' : f.conf < 0.8 && f.conf > 0 ? '!' : '✓'}
                </span>
                <span className={`record-check-name${f.missing ? ' missing' : ''}`}>{f.name}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="record-sidebar-section">
            <div className="record-sidebar-title">// Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/queue')}>
                Send to Review
              </button>
              <button className="btn" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate(`/adjudication/${id}`)}>
                View Conflicts
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
