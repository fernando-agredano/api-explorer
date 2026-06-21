import { useState, useEffect, forwardRef } from 'react'

function ChipsInput({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '7px 16px', borderRadius: 20,
            border: `0.5px solid ${value === opt ? 'var(--acc)' : 'var(--brd)'}`,
            background: value === opt ? 'var(--acc-d)' : 'var(--inp)',
            color: value === opt ? 'var(--acc)' : 'var(--tx2)',
            fontSize: 13, cursor: 'pointer', transition: 'all .12s',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

const DynamicForm = forwardRef(function DynamicForm({ endpoint, onSubmit }, ref) {
  const [values, setValues] = useState({})

  useEffect(() => {
    const init = {}
    endpoint.fields.forEach(f => { init[f.id] = f.default ?? '' })
    setValues(init)
  }, [endpoint.id])

  const set = (id, val) => setValues(v => ({ ...v, [id]: val }))

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(values)
  }

  const noParams = endpoint.noParams || endpoint.fields.length === 0

  return (
    <form ref={ref} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
        {noParams && (
          <div style={{ padding: '14px 16px', background: 'var(--blu-d)', borderRadius: 'var(--radius)', border: '0.5px solid var(--blu)', fontSize: 13, color: 'var(--blu)' }}>
            <i className="ti ti-info-circle" style={{ fontSize: 14, marginRight: 6 }} aria-hidden="true" />
            {endpoint.desc}
          </div>
        )}

        {endpoint.fields.map(field => (
          <div key={field.id} style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--tx2)', marginBottom: 8 }}>
              {field.label}
              {field.required && <span style={{ color: 'var(--red)', fontSize: 11, marginLeft: 4 }}>*</span>}
            </label>

            {field.type === 'chips' ? (
              <ChipsInput options={field.options} value={values[field.id] || field.default || field.options[0]} onChange={val => set(field.id, val)} />
            ) : field.type === 'select' ? (
              <div style={{ position: 'relative' }}>
                <select
                  value={values[field.id] || ''}
                  onChange={e => set(field.id, e.target.value)}
                  style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: 'var(--radius)', border: '0.5px solid var(--brd)', background: 'var(--inp)', color: values[field.id] ? 'var(--tx)' : 'var(--tx3)', fontSize: 13, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                >
                  {field.options.map(o => <option key={o} value={o}>{o || '— Todos —'}</option>)}
                </select>
                <i className="ti ti-chevron-down" aria-hidden="true" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--tx3)', pointerEvents: 'none' }} />
              </div>
            ) : (
              <input
                type={field.type}
                value={values[field.id] || ''}
                onChange={e => set(field.id, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius)', border: '0.5px solid var(--brd)', background: 'var(--inp)', color: 'var(--tx)', fontSize: 13 }}
              />
            )}
          </div>
        ))}
      </div>
    </form>
  )
})

export default DynamicForm
