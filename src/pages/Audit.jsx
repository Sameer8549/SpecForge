import { useNavigate } from 'react-router-dom'

export default function Audit() {
  const navigate = useNavigate()
  return (
    <div className="record-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Audit Summary</span>
          <h1 className="page-header-title">Evaluation</h1>
        </div>
        <div className="page-header-right">
          <button className="btn" onClick={() => navigate('/history')}>← Library</button>
        </div>
      </div>
      <div style={{ padding: 40, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
        [ Coming in Step 11 ]
      </div>
    </div>
  )
}
