import { useState } from 'react'
import { PROJECTS } from '../data/projects'

const METHOD_STYLE = {
  GET:    { bg: 'var(--grn-d)', color: 'var(--grn)' },
  POST:   { bg: 'var(--blu-d)', color: 'var(--blu)' },
  PUT:    { bg: 'var(--amb-d)', color: 'var(--amb)' },
  DELETE: { bg: 'var(--red-d)', color: 'var(--red)' },
}

export default function Sidebar({ activeEndpoint, onSelect }) {
  const [expanded, setExpanded] = useState(() => new Set())

  function toggleProject(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <aside style={{ background: 'var(--surf-s)', borderRight: '0.5px solid var(--brd)', overflowY: 'auto', minWidth: 0 }}>
      <div style={{ padding: '14px 0' }}>
        <div style={{ padding: '4px 18px 12px', fontSize: 11, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Proyectos
        </div>

        {PROJECTS.map(proj => {
          const isOpen = expanded.has(proj.id)
          return (
            <div key={proj.id}>
              <div
                onClick={() => toggleProject(proj.id)}
                style={{
                  padding: '11px 14px',
                  margin: '1px 8px',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: proj.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>{proj.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>{proj.arch} · {proj.tech}</div>
                  </div>
                  <i
                    className="ti ti-chevron-right"
                    style={{
                      fontSize: 15,
                      color: 'var(--tx3)',
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform .15s',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {isOpen && proj.endpoints.map(ep => {
                const ms = METHOD_STYLE[ep.method] || METHOD_STYLE.GET
                const isActive = activeEndpoint === ep.id
                return (
                  <div
                    key={ep.id}
                    onClick={() => onSelect(ep.id, proj.id)}
                    style={{
                      padding: '8px 14px 8px 40px',
                      margin: '1px 8px',
                      borderRadius: 'var(--radius)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4, minWidth: 40, textAlign: 'center', background: ms.bg, color: ms.color, flexShrink: 0 }}>
                      {ep.method}
                    </span>
                    <span style={{ fontSize: 13, color: isActive ? 'var(--tx)' : 'var(--tx2)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 500 : 400 }}>
                      {ep.path.replace(/\{[^}]+\}/g, '{…}')}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
