import { useState, useEffect, useRef } from 'react'
import { PROJECTS } from './data/projects'
import { useRequest } from './hooks/useRequest'
import Sidebar from './components/Sidebar'
import DynamicForm from './components/DynamicForm'
import JsonView from './components/JsonView'
import VisualResponse from './components/VisualResponse'

const METHOD_COLOR = { GET: 'var(--grn)', POST: 'var(--blu)', PUT: 'var(--amb)', DELETE: 'var(--red)' }
const METHOD_BG    = { GET: 'var(--grn-d)', POST: 'var(--blu-d)', PUT: 'var(--amb-d)', DELETE: 'var(--red-d)' }

export default function App() {
  const { loading, response, error, time, status, send, reset } = useRequest()

  const [viewLeft, setViewLeft]    = useState('form')
  const [viewRight, setViewRight]  = useState('visual')
  const [activeProject, setAP]     = useState(null)
  const [activeEndpoint, setAE]    = useState(null)
  const [token, setToken]          = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [rawBody, setRawBody]      = useState('{}')
  const [copied, setCopied]        = useState(false)
  const [copiedUrl, setCopiedUrl]  = useState(null)
  const [urls, setUrls]            = useState({
    p1: 'https://python-fastapi-tasks.onrender.com',
    p2: 'https://python-flask-hexagonal.onrender.com',
    n1: 'https://node-express-clean.onrender.com',
    n2: 'https://node-fastify-cqrs.onrender.com',
  })

  const formRef = useRef()

  const proj = PROJECTS.find(p => p.id === activeProject)
  const ep   = proj?.endpoints.find(e => e.id === activeEndpoint)

  useEffect(() => {
    if (proj && ep) {
      const exampleVals = {}
      ep.fields.forEach(f => {
        exampleVals[f.id] = f.type === 'chips'
          ? (f.default ?? f.options?.[0] ?? '')
          : (f.default ?? f.placeholder ?? '')
      })
      setRawBody(JSON.stringify(ep.buildBody?.(exampleVals) ?? {}, null, 2))
    }
  }, [activeEndpoint, activeProject])

  function handleSelect(epId, projId) {
    setAP(projId)
    setAE(epId)
  }

  function buildUrl(epDef, vals = {}) {
    const base = urls[activeProject] || proj.ports.local
    let path = epDef.buildPath ? epDef.buildPath(vals) : epDef.path
    const qs = epDef.buildQuery ? epDef.buildQuery(vals) : ''
    return `${base}${path}${qs ? '?' + qs : ''}`
  }

  async function handleSubmitVisual(vals) {
    if (!ep) return
    const url  = buildUrl(ep, vals)
    const body = ep.buildBody ? ep.buildBody(vals) : undefined
    const headers = {}
    if (ep.requiresAuth && token) headers['Authorization'] = `Bearer ${token}`
    await send({ method: ep.method, url, body, headers })
  }

  async function handleSubmitJson() {
    if (!ep) return
    let body
    try { body = JSON.parse(rawBody) } catch { body = {} }
    const url = buildUrl(ep, {})
    const headers = {}
    if (ep.requiresAuth && token) headers['Authorization'] = `Bearer ${token}`
    await send({ method: ep.method, url, body, headers })
  }

  function handleSend() {
    if (viewLeft === 'form') {
      formRef.current?.requestSubmit()
    } else {
      handleSubmitJson()
    }
  }

  function copyResponse() {
    const text = JSON.stringify(response || error, null, 2)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const displayData  = response || error
  const statusOk     = status >= 200 && status < 300
  const statusColor  = status === 0 ? 'var(--tx3)' : statusOk ? 'var(--grn)' : 'var(--red)'
  const statusBg     = status === 0 ? 'var(--inp)' : statusOk ? 'var(--grn-d)' : 'var(--red-d)'

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Top bar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 70, background: 'var(--surf-s)', borderBottom: '0.5px solid var(--brd)', flexShrink: 0 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M6 9L2.5 11L6 13" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 9L19.5 11L16 13" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.5 5.5L8.5 16.5" stroke="var(--tx2)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--tx)' }}>
            API <span style={{ color: '#9d8fff', fontWeight: 400 }}>Explorer</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View toggle (right column) */}
          <div style={{ display: 'flex', background: 'var(--inp)', borderRadius: 'var(--radius)', border: '0.5px solid var(--brd)', overflow: 'hidden' }}>
            {['visual', 'json'].map(v => (
              <button
                key={v}
                onClick={() => setViewRight(v)}
                onMouseEnter={e => { if (viewRight !== v) e.currentTarget.style.background = 'var(--brd)' }}
                onMouseLeave={e => { if (viewRight !== v) e.currentTarget.style.background = 'transparent' }}
                style={{ padding: '8px 18px', fontSize: 13, border: 'none', background: viewRight === v ? '#6535f0' : 'transparent', color: viewRight === v ? '#fff' : 'var(--tx2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .12s' }}
              >
                <i className={`ti ${v === 'visual' ? 'ti-layout-cards' : 'ti-code'}`} style={{ fontSize: 16 }} aria-hidden="true" />
                {v === 'visual' ? 'Visual' : 'JSON'}
              </button>
            ))}
          </div>

          {/* Render live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 'var(--radius)', border: '0.5px solid var(--brd)', background: 'var(--inp)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--grn)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--tx2)' }}>Render</span>
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(s => !s)}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--inp)' }}
            onMouseLeave={e => { if (!showSettings) e.currentTarget.style.background = 'transparent' }}
            style={{ padding: '9px 13px', borderRadius: 'var(--radius)', border: '0.5px solid var(--brd)', background: showSettings ? 'var(--inp)' : 'transparent', color: 'var(--tx2)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background .12s' }}
          >
            <i className="ti ti-settings" style={{ fontSize: 19 }} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Settings panel */}
      {showSettings && (
        <div style={{ background: 'var(--surf-s)', borderBottom: '0.5px solid var(--brd)', padding: '14px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--tx2)', marginBottom: 5, display: 'block' }}>
                <i className="ti ti-lock" style={{ fontSize: 12, marginRight: 4 }} aria-hidden="true" />
                Token JWT (para endpoints que requieren auth)
              </label>
              <input value={token} onChange={e => setToken(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIs..." style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius)', border: '0.5px solid var(--brd)', background: 'var(--inp)', color: 'var(--tx)', fontSize: 11, fontFamily: 'var(--mono)' }} />
            </div>
            {PROJECTS.map(p => (
              <div key={p.id}>
                <label style={{ fontSize: 11, color: 'var(--tx2)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color }} />
                  {p.name} — URL Render
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    readOnly
                    value={urls[p.id]}
                    style={{ flex: 1, padding: '7px 10px', borderRadius: 'var(--radius)', border: '0.5px solid var(--brd)', background: 'var(--inp)', color: 'var(--tx2)', fontSize: 11, fontFamily: 'var(--mono)', cursor: 'default' }}
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(urls[p.id]); setCopiedUrl(p.id); setTimeout(() => setCopiedUrl(null), 1800) }}
                    title="Copiar URL"
                    style={{ padding: '0 10px', borderRadius: 'var(--radius)', border: '0.5px solid var(--brd)', background: 'var(--inp)', color: copiedUrl === p.id ? 'var(--grn)' : 'var(--tx3)', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  >
                    <i className={`ti ${copiedUrl === p.id ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 13 }} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', overflow: 'hidden', minHeight: 0 }}>
        <Sidebar activeEndpoint={activeEndpoint} onSelect={handleSelect} />

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

          {/* Welcome state */}
          {!ep && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, border: '2px solid var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <path d="M6 9L2.5 11L6 13" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 9L19.5 11L16 13" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.5 5.5L8.5 16.5" stroke="var(--tx2)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--tx)', textAlign: 'center' }}>
                  API <span style={{ color: '#9d8fff' }}>Explorer</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--tx3)', letterSpacing: '.12em', textTransform: 'uppercase', textAlign: 'center', marginTop: 4 }}>Dev Tools</div>
              </div>
              <div style={{ textAlign: 'center', maxWidth: 360 }}>
                <div style={{ fontSize: 15, color: 'var(--tx2)', marginBottom: 10, fontWeight: 500 }}>
                  Selecciona un endpoint para comenzar
                </div>
                <div style={{ fontSize: 13, color: 'var(--tx3)', lineHeight: 1.7 }}>
                  Despliega un proyecto en el sidebar y elige<br />un endpoint para ver sus parámetros y enviar requests.
                </div>
              </div>
            </div>
          )}

          {/* Endpoint header */}
          {ep && (
            <div style={{ padding: '12px 18px', background: 'var(--surf-s)', borderBottom: '0.5px solid var(--brd)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 4, background: METHOD_BG[ep.method], color: METHOD_COLOR[ep.method] }}>
                  {ep.method}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--tx)' }}>
                  {buildUrl(ep, {})}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--tx3)' }}>{ep.desc}</div>
            </div>
          )}

          {/* Two-column body */}
          {ep && <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', minHeight: 0 }}>

            {/* Left: form or raw body */}
            <div style={{ borderRight: '0.5px solid var(--brd)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Left header: tabs + Send */}
              <div style={{ height: 48, padding: '0 18px', background: 'var(--surf-s)', borderBottom: '0.5px solid var(--brd)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{ display: 'flex', background: 'var(--inp)', borderRadius: 'var(--radius)', border: '0.5px solid var(--brd)', overflow: 'hidden' }}>
                  {[{ id: 'form', label: 'Form', icon: 'ti-forms' }, { id: 'body', label: 'Body', icon: 'ti-braces' }].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setViewLeft(tab.id)}
                      style={{ padding: '6px 14px', fontSize: 12, border: 'none', background: viewLeft === tab.id ? '#6535f0' : 'transparent', color: viewLeft === tab.id ? '#fff' : 'var(--tx2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'background .12s' }}
                    >
                      <i className={`ti ${tab.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  style={{ marginLeft: 'auto', padding: '7px 18px', borderRadius: 'var(--radius)', border: 'none', background: loading ? 'var(--brd)' : '#6535f0', color: '#fff', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .12s' }}
                >
                  {loading
                    ? <><i className="ti ti-loader-2" style={{ fontSize: 13, animation: 'spin 1s linear infinite' }} aria-hidden="true" /> Enviando...</>
                    : <><i className="ti ti-send" style={{ fontSize: 13 }} aria-hidden="true" /> Send</>
                  }
                </button>
              </div>

              {/* Left content */}
              {viewLeft === 'form' ? (
                <DynamicForm ref={formRef} endpoint={ep} onSubmit={handleSubmitVisual} />
              ) : (
                <div style={{ flex: 1, padding: '12px 16px', overflow: 'auto' }}>
                  <textarea
                    value={rawBody}
                    onChange={e => setRawBody(e.target.value)}
                    style={{ width: '100%', height: '140px', background: 'var(--inp)', border: '0.5px solid var(--brd)', borderRadius: 'var(--radius)', padding: '10px', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--tx)', resize: 'none' }}
                  />
                </div>
              )}
            </div>

            {/* Right: response */}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: 48, padding: '0 18px', background: 'var(--surf-s)', borderBottom: '0.5px solid var(--brd)', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
                <i className="ti ti-arrow-down-circle" style={{ fontSize: 15, color: 'var(--tx3)' }} aria-hidden="true" />
                <span style={{ fontSize: 13, color: 'var(--tx3)' }}>Respuesta</span>
                {status > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 10, background: statusBg, color: statusColor }}>
                    {status} {statusOk ? 'OK' : 'Error'}
                  </span>
                )}
                {time !== null && <span style={{ fontSize: 12, color: 'var(--tx3)' }}>{time}ms</span>}
                {loading && <span style={{ fontSize: 13, color: 'var(--tx3)' }}>Cargando...</span>}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {displayData && (
                    <>
                      <button onClick={reset} title="Limpiar respuesta" style={{ background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                        <i className="ti ti-refresh" style={{ fontSize: 16 }} aria-hidden="true" />
                      </button>
                      <button onClick={copyResponse} title="Copiar" style={{ background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                        <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 16, color: copied ? 'var(--grn)' : undefined }} aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px', color: 'var(--tx2)', fontSize: 12 }}>
                    <span style={{ display: 'flex', gap: 4 }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--acc)', display: 'inline-block', animation: `bounce .8s ${i * .15}s infinite` }} />
                      ))}
                    </span>
                    Esperando respuesta...
                  </div>
                )}

                {!loading && !displayData && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--tx3)' }}>
                    <i className={`ti ${viewRight === 'visual' ? 'ti-layout-cards' : 'ti-code'}`} style={{ fontSize: 30 }} aria-hidden="true" />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, marginBottom: 5 }}>Envía un request para ver la respuesta</div>
                      <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <span>Modo activo:</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: 'var(--acc-d)', color: '#9d8fff', border: '0.5px solid #6535f0' }}>
                          {viewRight === 'visual' ? 'Visual' : 'JSON'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!loading && displayData && (
                  viewRight === 'visual'
                    ? <div style={{ padding: '12px 14px' }}><VisualResponse data={displayData} endpointId={activeEndpoint} /></div>
                    : <JsonView data={displayData} />
                )}
              </div>
            </div>
          </div>}
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(.5);opacity:.3} 40%{transform:scale(1);opacity:1} }
        @keyframes spin { to { transform: rotate(360deg) } }
        input:focus,select:focus,textarea:focus { outline: none; border-color: var(--acc) !important; }
      `}</style>
    </div>
  )
}
