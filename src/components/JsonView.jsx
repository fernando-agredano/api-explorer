export default function JsonView({ data }) {
  if (data === null || data === undefined) return (
    <pre style={{ padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--tx3)', margin: 0 }}>null</pre>
  )

  const json = JSON.stringify(data, null, 2)

  const highlighted = json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span style="color:var(--acc)">${match}</span>`
        return `<span style="color:var(--grn)">${match}</span>`
      }
      if (/true|false/.test(match)) return `<span style="color:var(--blu)">${match}</span>`
      if (/null/.test(match)) return `<span style="color:var(--tx3)">${match}</span>`
      return `<span style="color:var(--amb)">${match}</span>`
    }
  )

  return (
    <pre
      style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.8, overflowX: 'auto', margin: 0, whiteSpace: 'pre', wordBreak: 'normal' }}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}
