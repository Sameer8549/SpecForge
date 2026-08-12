import { useNavigate, useParams } from 'react-router-dom'

export default function FormatVal() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="record-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Format & Validate — {id}</span>
          <h1 className="page-header-title">Format & Validate</h1>
        </div>
        <div className="page-header-right">
          <button className="btn" onClick={() => navigate(`/record/${id}`)}>← Record</button>
        </div>
      </div>
      <div style={{ padding: 40, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
        [ Coming in Step 5 ]
      </div>
    </div>
  )
}
