import { useState } from 'react'

const STATUS_TYPE = {
  pending: 'warn', in_progress: 'info', done: 'ok', active: 'ok',
  confirmed: 'info', shipped: 'info', delivered: 'ok', cancelled: 'error',
  failed: 'error', sent: 'ok', low: 'warn', medium: 'info', high: 'error',
}

const STATUS_COLOR = {
  ok:      { bg: 'var(--grn-d)', color: 'var(--grn)', border: 'var(--grn)' },
  warn:    { bg: 'var(--amb-d)', color: 'var(--amb)', border: 'var(--amb)' },
  error:   { bg: 'var(--red-d)', color: 'var(--red)', border: 'var(--red)' },
  info:    { bg: 'var(--blu-d)', color: 'var(--blu)', border: 'var(--blu)' },
  default: { bg: 'var(--inp)',   color: 'var(--tx2)', border: 'var(--brd)' },
}

function Badge({ text }) {
  const type = STATUS_TYPE[String(text).toLowerCase()] || 'default'
  const s = STATUS_COLOR[type]
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: s.bg, color: s.color, border: `0.5px solid ${s.border}`, textTransform: 'uppercase', letterSpacing: '.04em', flexShrink: 0 }}>
      {text}
    </span>
  )
}

function isUuid(v) { return typeof v === 'string' && /^[0-9a-f-]{36}$/.test(v) }
function isDate(v)  { return typeof v === 'string' && v.includes('T') && v.includes(':') }
function fmtDate(v) { return v.slice(0, 16).replace('T', ' ') }
function isIdKey(k) { return k === 'id' || k === 'uuid' || k.endsWith('_id') }
function fmtVal(v)  {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (isDate(String(v))) return fmtDate(String(v))
  return String(v)
}

function CopyableId({ value }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(String(value))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const display = isUuid(String(value)) ? String(value).slice(0, 8) + '…' : String(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 11, color: 'var(--tx)', fontFamily: 'var(--mono)' }}>{display}</span>
      <button onClick={copy} title="Copiar ID" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: copied ? 'var(--grn)' : 'var(--tx3)' }}>
        <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 11 }} aria-hidden="true" />
      </button>
    </div>
  )
}

function MiniField({ k, v }) {
  const label = k.replace(/_/g, ' ')
  const isStatus = ['status', 'priority', 'channel', 'type'].includes(k)
  const isId = isIdKey(k)
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>{label}</div>
      {isStatus
        ? <Badge text={String(v)} />
        : isId
          ? <CopyableId value={v} />
          : <div style={{ fontSize: 11, color: 'var(--tx)' }}>{fmtVal(v)}</div>
      }
    </div>
  )
}

function ItemCard({ item, index }) {
  const name = item.title || item.name || item.username || item.email || item.event_name || item.sku || `#${index + 1}`
  const desc = item.description || null
  const status = item.status || item.priority || item.channel || null

  const skipKeys = new Set(['title', 'name', 'username', 'email', 'description', 'reason', 'event_name', 'sku', 'status', 'priority', 'channel', 'created_at', 'updated_at'])
  const mainEntries = Object.entries(item).filter(([k, v]) => !skipKeys.has(k) && typeof v !== 'object' && v !== null).slice(0, 6)
  const dateEntries = Object.entries(item).filter(([k]) => ['created_at', 'updated_at'].includes(k) && item[k])

  return (
    <div style={{ background: 'var(--card)', border: '0.5px solid var(--brd)', borderLeft: '3px solid #6535f0', borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: mainEntries.length ? 8 : 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: desc ? 2 : 0 }}>{name}</div>
          {desc && <div style={{ fontSize: 10, color: 'var(--tx2)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</div>}
        </div>
        {status && <Badge text={status} />}
      </div>

      {mainEntries.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
          {mainEntries.map(([k, v]) => <MiniField key={k} k={k} v={v} />)}
        </div>
      )}

      {dateEntries.length > 0 && (
        <div style={{ marginTop: 7, paddingTop: 6, borderTop: '0.5px solid var(--brd)', display: 'flex', gap: 12 }}>
          {dateEntries.map(([k, v]) => (
            <span key={k} style={{ fontSize: 9, color: 'var(--tx3)' }}>
              {k.replace(/_/g, ' ')}: <span style={{ color: 'var(--tx2)' }}>{fmtDate(v)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ObjectCard({ data }) {
  const name = data.title || data.name || data.username || data.email || null
  const status = data.status || data.priority || null
  const skipKeys = new Set(['title', 'name', 'username', 'email'])
  const entries = Object.entries(data).filter(([k, v]) => !skipKeys.has(k) && typeof v !== 'object')
  const objEntries = Object.entries(data).filter(([, v]) => v !== null && typeof v === 'object' && !Array.isArray(v))

  return (
    <div style={{ background: 'var(--card)', border: '0.5px solid var(--brd)', borderLeft: '3px solid #6535f0', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
      {name && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{name}</div>
          {status && <Badge text={status} />}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        {entries.map(([k, v]) => <MiniField key={k} k={k} v={v} />)}
      </div>
      {objEntries.map(([k, v]) => (
        <div key={k} style={{ marginTop: 10, paddingTop: 8, borderTop: '0.5px solid var(--brd)' }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>{k.replace(/_/g, ' ')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
            {Object.entries(v).filter(([, val]) => typeof val !== 'object').map(([ik, iv]) => (
              <MiniField key={ik} k={ik} v={iv} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function renderList(list, total) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
        <i className="ti ti-list" style={{ fontSize: 12 }} aria-hidden="true" />
        {total ?? list.length} resultado(s)
      </div>
      {list.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--tx3)', fontSize: 12, padding: '24px 0' }}>Sin resultados</div>
      )}
      {list.map((item, i) => <ItemCard key={i} item={item} index={i} />)}
    </div>
  )
}

export default function VisualResponse({ data }) {
  if (!data) return null

  if (data.access_token) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ background: 'var(--card)', border: '0.5px solid var(--brd)', borderLeft: '3px solid #6535f0', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ti ti-key" style={{ fontSize: 11 }} aria-hidden="true" /> Access Token
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--acc)', wordBreak: 'break-all', lineHeight: 1.7 }}>
            {data.access_token}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: 'var(--card)', border: '0.5px solid var(--brd)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>Tipo</div>
            <div style={{ fontSize: 12, color: 'var(--tx)' }}>{data.token_type || 'bearer'}</div>
          </div>
          <div style={{ background: 'var(--card)', border: '0.5px solid var(--brd)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>Uso</div>
            <div style={{ fontSize: 12, color: 'var(--tx)' }}>Bearer token</div>
          </div>
        </div>
        <div style={{ padding: '8px 12px', background: 'var(--grn-d)', borderRadius: 'var(--radius)', border: '0.5px solid var(--grn)', fontSize: 11, color: 'var(--grn)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-info-circle" style={{ fontSize: 12 }} aria-hidden="true" />
          Copia este token y pégalo en el campo Token JWT del panel de configuración.
        </div>
      </div>
    )
  }

  if (Array.isArray(data)) return renderList(data, data.length)

  const listKey = ['data', 'items', 'tasks', 'results', 'products', 'orders'].find(k => Array.isArray(data[k]))
  if (listKey) return renderList(data[listKey], data.count ?? data.total ?? data[listKey].length)

  if (data.events && Array.isArray(data.events)) {
    return (
      <div>
        <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 10 }}>{data.total ?? data.events.length} evento(s)</div>
        {data.events.map((ev, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '0.5px solid var(--brd)', borderLeft: '3px solid #6535f0', borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--acc)', fontFamily: 'var(--mono)' }}>{ev.event_name}</span>
              {ev.occurred_at && <span style={{ fontSize: 9, color: 'var(--tx3)' }}>{fmtDate(ev.occurred_at)}</span>}
            </div>
            <div style={{ fontSize: 10, color: 'var(--tx2)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {JSON.stringify(ev.payload).slice(0, 80)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (data.movements && Array.isArray(data.movements)) {
    return (
      <div>
        <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 10 }}>{data.total ?? data.movements.length} movimiento(s)</div>
        {data.movements.map((m, i) => {
          const isIn = m.type === 'in'
          return (
            <div key={i} style={{ background: 'var(--card)', border: '0.5px solid var(--brd)', borderLeft: '3px solid #6535f0', borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: m.reason ? 4 : 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: isIn ? 'var(--grn)' : 'var(--red)' }}>
                  <i className={`ti ti-arrow-${isIn ? 'up' : 'down'}`} style={{ fontSize: 11, marginRight: 4 }} aria-hidden="true" />
                  {m.type} · {m.quantity} uds
                </span>
                <span style={{ fontSize: 10, color: 'var(--tx3)', fontFamily: 'var(--mono)' }}>{m.before}→{m.after}</span>
              </div>
              {m.reason && <div style={{ fontSize: 10, color: 'var(--tx2)', marginTop: 3 }}>{m.reason}</div>}
            </div>
          )
        })}
      </div>
    )
  }

  if (data.movement) {
    const { item, movement } = data
    const low = movement.after <= (item?.minStock || 5)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {item && (
          <div style={{ background: 'var(--card)', border: '0.5px solid var(--brd)', borderLeft: '3px solid #6535f0', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <MiniField k="nombre" v={item.name} />
              <MiniField k="sku" v={item.sku} />
              <MiniField k="stock anterior" v={movement.before} />
              <MiniField k="stock actual" v={movement.after} />
            </div>
          </div>
        )}
        <div style={{ padding: '8px 12px', background: low ? 'var(--amb-d)' : 'var(--grn-d)', borderRadius: 'var(--radius)', border: `0.5px solid ${low ? 'var(--amb)' : 'var(--grn)'}`, fontSize: 11, color: low ? 'var(--amb)' : 'var(--grn)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className={`ti ${low ? 'ti-alert-triangle' : 'ti-circle-check'}`} style={{ fontSize: 12 }} aria-hidden="true" />
          {low ? 'Stock bajo del mínimo — alerta disparada' : 'Stock en nivel normal'}
        </div>
      </div>
    )
  }

  if (typeof data === 'object') return <ObjectCard data={data} />

  return <div style={{ fontSize: 12, color: 'var(--tx)', padding: '4px 0' }}>{String(data)}</div>
}
