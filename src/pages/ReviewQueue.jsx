import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ReviewQueue.css'

const QUEUE_ITEMS = [
  { id: 1, mpn: 'LM741CN',  brand: 'Texas Instruments', field: 'Input Bias Current', value: '80nA',    conf: 0.72, reason: 'Confidence below threshold (0.80). Only 2 of 4 sources provided this field.', wo: 'WO-20240811-001', status: 'pending' },
  { id: 2, mpn: 'LM741CN',  brand: 'Texas Instruments', field: 'Slew Rate',           value: '0.5V/μs', conf: 0.68, reason: 'Confidence below threshold. Single-source extraction — no cross-reference available.', wo: 'WO-20240811-001', status: 'pending' },
  { id: 3, mpn: 'BC547B',   brand: 'Fairchild',         field: 'hFE Gain',            value: '220',      conf: 0.61, reason: 'Sources disagree. Majority value selected but minority is within spec range.', wo: 'WO-20240810-042', status: 'pending' },
  { id: 4, mpn: '1N4007',   brand: 'ON Semiconductor',  field: 'Forward Voltage',     value: '1.1V',    conf: 0.55, reason: 'Multiple conflicting values from distributor sources. Manufacturer page unavailable.', wo: 'WO-20240810-039', status: 'pending' },
]

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected']

export default function ReviewQueue() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(QUEUE_ITEMS[0].id)
  const [statuses, setStatuses] = useState({})
  const [editVal, setEditVal] = useState('')
  const [editing, setEditing] = useState(false)

  const item = QUEUE_ITEMS.find(q => q.id === selected)

  const getStatus = (id) => statuses[id] || QUEUE_ITEMS.find(q => q.id === id)?.status

  const filtered = QUEUE_ITEMS.filter(q => {
    if (filter === 'All') return true
    return getStatus(q.id) === filter.toLowerCase()
  })

  const act = (action) => {
    setStatuses(s => ({ ...s, [selected]: action === 'approve' ? 'approved' : 'rejected' }))
    setEditing(false)
  }

  const pending = QUEUE_ITEMS.filter(q => getStatus(q.id) === 'pending').length

  return (
    <div className="queue-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Review Queue</span>
          <h1 className="page-header-title">Human Approval</h1>
        </div>
        <div className="page-header-right">
          {pending > 0 ? (
            <span className="badge badge-warning">{pending} Pending</span>
          ) : (
            <span className="badge badge-verified">Queue Clear</span>
          )}
        </div>
      </div>

      <div className="queue-layout">
        {/* List */}
        <div className="queue-list">
          <div className="queue-filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`queue-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-art">{'[ ✓ ]'}</div>
              <div className="empty-state-title">Queue Empty</div>
              <div className="empty-state-desc">No items match the selected filter.</div>
            </div>
          )}

          {filtered.map(q => {
            const st = getStatus(q.id)
            return (
              <div
                key={q.id}
                className={`queue-item${selected === q.id ? ' selected' : ''}${st === 'approved' ? ' approved' : ''}`}
                onClick={() => { setSelected(q.id); setEditing(false); setEditVal(''); }}
              >
                <div>
                  <div className="queue-item-mpn">{q.mpn}</div>
                  <div className="queue-item-field">Field: {q.field}</div>
                  <div className="queue-item-reason">{q.reason}</div>
                </div>
                <div className="queue-item-meta">
                  <span className={`badge${st === 'approved' ? ' badge-verified' : st === 'rejected' ? ' badge-error' : ' badge-warning'}`}>
                    {st}
                  </span>
                  <span className="text-label">{Math.round(q.conf * 100)}%</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail */}
        <div className="queue-detail">
          {item ? (
            <>
              <div className="panel-header">
                <span className="text-label">// Field Review</span>
                <button className="btn btn-ghost" style={{padding:'4px 10px'}} onClick={() => navigate(`/record/${item.wo}`)}>
                  View Record ↗
                </button>
              </div>
              <div className="queue-detail-body">
                {/* Current value display */}
                <div className="queue-field-display">
                  <div className="queue-field-name">{item.field}</div>
                  <div className="queue-field-value">{item.value}</div>
                  <div className="queue-field-conf">
                    Confidence: {Math.round(item.conf * 100)}% — Low
                  </div>
                  <div className="conf-bar" style={{ marginTop: 8 }}>
                    <div className="conf-bar-fill low" style={{ width: `${item.conf * 100}%` }} />
                  </div>
                </div>

                {/* Flag reason */}
                <div className="queue-flag-reason">
                  <div className="queue-flag-label">// Why Flagged</div>
                  {item.reason}
                </div>

                {/* Edit field */}
                {editing && (
                  <div className="field">
                    <label className="field-label" htmlFor="q-edit">Override Value</label>
                    <input
                      id="q-edit"
                      className="queue-edit-input"
                      placeholder={`Current: ${item.value}`}
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      autoFocus
                    />
                    <span className="field-hint">Enter corrected value. Change will be logged with your user ID.</span>
                  </div>
                )}

                {/* Source quick-view */}
                <div>
                  <div className="text-label" style={{ marginBottom: 8 }}>// Work Order</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.wo} · {item.brand}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div className="text-label" style={{ marginBottom: 0 }}>// Actions</div>
                  <div className="queue-actions">
                    <button
                      className="queue-action-btn qa-approve"
                      onClick={() => act('approve')}
                      disabled={getStatus(item.id) !== 'pending'}
                    >
                      [ ✓ ] Approve
                    </button>
                    <button
                      className="queue-action-btn qa-edit"
                      onClick={() => setEditing(e => !e)}
                      disabled={getStatus(item.id) !== 'pending'}
                    >
                      [ ✎ ] Edit
                    </button>
                    <button
                      className="queue-action-btn qa-reject"
                      onClick={() => act('reject')}
                      disabled={getStatus(item.id) !== 'pending'}
                    >
                      [ ✗ ] Reject
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-title">Select an item</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
