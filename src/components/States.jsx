import './States.css'

/* ── ENTAILMENT LABEL ─────────────────────────────────────── */

const ENTAILMENT_META = {
  supported:     { text: '[ ✓ SUPPORTED ]',         cls: 'ent-supported' },
  partial:       { text: '[ ~ PARTIAL ]',            cls: 'ent-partial' },
  not_supported: { text: '[ ✗ NOT SUPPORTED ]',      cls: 'ent-not-supported' },
  ambiguous:     { text: '[ ? AMBIGUOUS ]',           cls: 'ent-ambiguous' },
}

/**
 * Entailment label — terminal bracket style, consistent with stage/status chips.
 * Four states: supported / partial / not_supported / ambiguous
 */
export function EntailmentLabel({ entailment, size = 'sm' }) {
  if (!entailment) return null
  const meta = ENTAILMENT_META[entailment]
  if (!meta) return null
  return (
    <span className={`entailment-label ${meta.cls}${size === 'lg' ? ' ent-lg' : ''}`}>
      {meta.text}
    </span>
  )
}

/* ── SKELETON COMPONENTS ─────────────────────────────────── */

/** Generic skeleton line */
export function SkelLine({ width = '100%', size = '' }) {
  return (
    <span
      className={`skel skel-line${size ? ` skel-line-${size}` : ''}`}
      style={{ width, display: 'block' }}
    />
  )
}

/** Skeleton for a Record field row */
export function SkelFieldRow() {
  return (
    <div className="skel-field-row">
      <div className="skel-field-col">
        <SkelLine width="70%" size="sm" />
      </div>
      <div className="skel-field-col-root">
        <SkelLine width="45%" />
      </div>
      <div className="skel-field-col">
        <SkelLine width="60%" size="sm" />
      </div>
    </div>
  )
}

/** Skeleton for a History/Batch table row */
export function SkelTableRow({ cols = 6 }) {
  const widths = ['60%', '80%', '50%', '40%', '40%', '50%']
  return (
    <div className="skel-table-row" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="skel-table-col">
          <SkelLine width={widths[i] || '60%'} />
        </div>
      ))}
    </div>
  )
}

/** Skeleton for a Queue item */
export function SkelQueueItem() {
  return (
    <div className="skel-queue-item">
      <SkelLine width="40%" size="lg" />
      <SkelLine width="60%" size="sm" />
      <SkelLine width="85%" size="sm" />
    </div>
  )
}

/** Skeleton batch row */
export function SkelBatchRow() {
  return (
    <div className="skel-batch-row">
      <SkelLine width="100px" />
      <SkelLine width="140px" />
      <SkelLine width="80px" />
      <SkelLine width="60px" size="sm" />
    </div>
  )
}

/* ── LOADING COMPONENTS ──────────────────────────────────── */

/** Full-page loading screen */
export function LoadingPage({ label = 'Loading...' }) {
  return (
    <div className="loading-page">
      <div className="loading-blocks">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="loading-block" />
        ))}
      </div>
      <div className="loading-page-label">{label}</div>
      <div className="stage-loading-bar">
        <div className="stage-loading-fill" />
      </div>
    </div>
  )
}

/** Inline stage-level loading bar */
export function StageLoader({ label = 'Processing...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0' }}>
      <div className="loading-page-label">{label}</div>
      <div className="stage-loading-bar">
        <div className="stage-loading-fill" />
      </div>
    </div>
  )
}

/* ── ERROR COMPONENTS ────────────────────────────────────── */

/** Full-page error screen */
export function ErrorPage({ code = 'ERR_UNKNOWN', title = 'Something went wrong', message, detail, onRetry, onBack }) {
  return (
    <div className="error-page">
      <div>
        <div className="error-page-code">[ {code} ]</div>
        <div className="error-page-title">{title}</div>
      </div>
      {message && <div className="error-page-msg">{message}</div>}
      {detail && (
        <div className="error-page-detail">
          <div style={{ color: 'var(--red)', marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>// Error Detail</div>
          {detail}
        </div>
      )}
      <div className="error-page-actions">
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry}>Retry</button>
        )}
        {onBack && (
          <button className="btn btn-ghost" onClick={onBack}>← Go Back</button>
        )}
      </div>
    </div>
  )
}

/** Inline error box (section-level) */
export function ErrorInline({ code = 'ERR', message, onRetry }) {
  return (
    <div className="error-inline">
      <div className="error-inline-label">[ {code} ] Error</div>
      {message && <div className="error-inline-msg">{message}</div>}
      {onRetry && (
        <button className="error-inline-retry" onClick={onRetry}>[ ↺ ] Retry</button>
      )}
    </div>
  )
}

/* ── EMPTY STATE COMPONENTS ──────────────────────────────── */

const EMPTY_ART = {
  record: [
    ' ┌──────────────────┐',
    ' │  ░░░░░░░░░░░░░░  │',
    ' │  ░░  NO DATA  ░░  │',
    ' │  ░░░░░░░░░░░░░░  │',
    ' └──────────────────┘',
  ].join('\n'),

  queue: [
    '  [ ✓ ]  [ ✓ ]  [ ✓ ]',
    '                      ',
    '   ALL ITEMS CLEARED  ',
  ].join('\n'),

  history: [
    '  ┌─────────┐',
    '  │         │',
    '  │  EMPTY  │',
    '  │ LIBRARY │',
    '  └─────────┘',
  ].join('\n'),

  batch: [
    '  ┌──────────────┐',
    '  │  [ CSV ]     │',
    '  │  Upload to   │',
    '  │  begin proc. │',
    '  └──────────────┘',
  ].join('\n'),

  search: [
    '  ┌──┐  ┌──┐  ┌──┐',
    '  │??│  │??│  │??│',
    '  └──┘  └──┘  └──┘',
  ].join('\n'),

  conflicts: [
    '  ✓ SRC-A  ✓ SRC-B',
    '  ─────────────────',
    '  All sources agree',
  ].join('\n'),

  generic: [
    '  ░░░░░░░░░',
    '  ░ EMPTY ░',
    '  ░░░░░░░░░',
  ].join('\n'),
}

/** Full-area empty state */
export function EmptyState({ variant = 'generic', title, desc, action, onAction }) {
  return (
    <div className="empty-full">
      <pre className="empty-art">{EMPTY_ART[variant] || EMPTY_ART.generic}</pre>
      {title && <div className="empty-title">{title}</div>}
      {desc && <div className="empty-desc">{desc}</div>}
      {action && onAction && (
        <button className="btn" onClick={onAction}>{action}</button>
      )}
    </div>
  )
}
