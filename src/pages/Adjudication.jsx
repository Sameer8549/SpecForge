import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './Adjudication.css'

const CONFLICTS = [
  {
    id: 1,
    field: 'Supply Voltage',
    status: 'open',
    sources: [
      { id: 'SRC-A', value: '±18V', url: 'ti.com/product/LM741', type: 'Manufacturer Datasheet', winner: true },
      { id: 'SRC-B', value: '±22V', url: 'octopart.com/LM741CN', type: 'Distributor Listing',    winner: false },
      { id: 'SRC-D', value: '±18V', url: 'mouser.com/LM741CN',   type: 'Distributor Listing',    winner: false },
    ],
    resolution: '±18V',
    rule: 'Manufacturer primary source takes precedence over distributor listings. SRC-A is the official TI datasheet. SRC-D corroborates. SRC-B value (±22V) is an absolute maximum rating, not the recommended supply — common distributor listing error.',
    confidence: 0.94,
  },
  {
    id: 2,
    field: 'Input Offset Voltage',
    status: 'resolved',
    sources: [
      { id: 'SRC-A', value: '6mV',  url: 'ti.com/product/LM741', type: 'Manufacturer Datasheet', winner: true },
      { id: 'SRC-C', value: '5mV',  url: 'datasheetarchive.com', type: 'Archived Datasheet',      winner: false },
    ],
    resolution: '6mV',
    rule: 'Current manufacturer datasheet (SRC-A, TI rev. 2023) supersedes archived version (SRC-C, undated). 6mV is the current spec for the commercial temperature range part.',
    confidence: 0.92,
  },
]

export default function Adjudication() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(CONFLICTS[0].id)
  const [overrideVal, setOverrideVal] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [resolved, setResolved] = useState({})

  const conflict = CONFLICTS.find(c => c.id === selected)

  const handleAccept = () => {
    setResolved(r => ({ ...r, [selected]: true }))
  }

  return (
    <div className="adj-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Conflict Adjudication — {id}</span>
          <h1 className="page-header-title">Source Conflicts</h1>
        </div>
        <div className="page-header-right">
          <span className="badge badge-warning">
            {CONFLICTS.filter(c => c.status === 'open').length} Open Conflicts
          </span>
          <button className="btn" onClick={() => navigate(`/record/${id}`)}>
            ← Record
          </button>
        </div>
      </div>

      <div className="adj-layout">
        {/* Conflict list */}
        <div className="adj-conflict-list">
          <div className="panel-header">
            <span className="text-label">// Conflicts ({CONFLICTS.length})</span>
          </div>
          {CONFLICTS.map(c => (
            <div
              key={c.id}
              className={`adj-conflict-item${selected === c.id ? ' selected' : ''}${c.status === 'resolved' || resolved[c.id] ? ' resolved' : ''}`}
              onClick={() => setSelected(c.id)}
            >
              <div className="adj-conflict-field">{c.field}</div>
              <div className="adj-conflict-meta">
                {c.sources.length} sources ·{' '}
                {resolved[c.id] || c.status === 'resolved' ? (
                  <span style={{ color: 'var(--green)' }}>Resolved</span>
                ) : (
                  <span style={{ color: 'var(--amber)' }}>Open</span>
                )}
              </div>
            </div>
          ))}

          {/* Empty state when no conflicts */}
          {CONFLICTS.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-art">{'[ ✓ ]'}</div>
              <div className="empty-state-title">No Conflicts</div>
              <div className="empty-state-desc">All sources agreed on every field.</div>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="adj-detail">
          {conflict && (
            <>
              <div className="panel-header">
                <span className="text-label">// Field: {conflict.field}</span>
                {resolved[conflict.id] || conflict.status === 'resolved' ? (
                  <span className="badge badge-verified">✓ Resolved</span>
                ) : (
                  <span className="badge badge-warning">⚠ Conflict</span>
                )}
              </div>
              <div className="adj-detail-body">
                {/* Source comparison */}
                <div>
                  <div className="text-label" style={{ marginBottom: 12 }}>// Source Values</div>
                  <div className="adj-sources-grid">
                    {conflict.sources.map((s, i) => (
                      <div key={i} className={`adj-source-col${s.winner ? ' winner' : ' loser'}`}>
                        <div className="adj-src-id">[{s.id}]</div>
                        <div className="adj-src-value">{s.value}</div>
                        <div className="adj-src-url">{s.type}</div>
                        <div className="adj-src-url">{s.url}</div>
                        <div className={`adj-src-verdict${s.winner ? ' win' : ' lose'}`}>
                          {s.winner ? '✓ Selected' : '✗ Rejected'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                <div className="adj-resolution">
                  <div className="adj-resolution-header">// Resolution</div>
                  <div className="adj-resolution-body">
                    <div className="adj-resolution-value">{conflict.resolution}</div>
                    <div className="adj-resolution-rule">{conflict.rule}</div>
                    <div className="adj-resolution-conf">
                      Confidence: {Math.round(conflict.confidence * 100)}%
                    </div>
                    <div className="adj-actions">
                      <button
                        className="btn btn-primary"
                        onClick={handleAccept}
                        disabled={!!(resolved[conflict.id] || conflict.status === 'resolved')}
                      >
                        {resolved[conflict.id] || conflict.status === 'resolved' ? '✓ Accepted' : 'Accept Resolution'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Override */}
                <div className="adj-override">
                  <div className="adj-override-header">// Manual Override</div>
                  <div className="adj-override-body">
                    <div className="field">
                      <label className="field-label" htmlFor="override-val">Override Value</label>
                      <input
                        id="override-val"
                        className="field-input"
                        placeholder="Enter correct value..."
                        value={overrideVal}
                        onChange={e => setOverrideVal(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor="override-reason">Reasoning</label>
                      <textarea
                        id="override-reason"
                        className="field-input"
                        placeholder="Why are you overriding the automated resolution?"
                        rows={3}
                        value={overrideReason}
                        onChange={e => setOverrideReason(e.target.value)}
                        style={{ resize: 'vertical', minHeight: '70px' }}
                      />
                    </div>
                    <button
                      className="btn btn-danger"
                      disabled={!overrideVal || !overrideReason}
                    >
                      Apply Override
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
