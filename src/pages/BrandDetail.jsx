import { useNavigate, useParams } from 'react-router-dom'

export default function BrandDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="record-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Brand Resolution — {id}</span>
          <h1 className="page-header-title">Brand Detail</h1>
        </div>
        <div className="page-header-right">
          <button className="btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>
      <div style={{ padding: 40, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
        [ Coming in Step 6 ]
      </div>
    </div>
  )
}
