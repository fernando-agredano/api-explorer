import { useState, useCallback } from 'react'

export function useRequest() {
  const [state, setState] = useState({ loading: false, response: null, error: null, time: null, status: null })

  const send = useCallback(async ({ method, url, body, headers = {} }) => {
    setState({ loading: true, response: null, error: null, time: null, status: null })
    const start = performance.now()
    try {
      const opts = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
      }
      if (body && method !== 'GET') opts.body = JSON.stringify(body)

      const res = await fetch(url, opts)
      const time = Math.round(performance.now() - start)
      let data
      try { data = await res.json() } catch { data = null }

      setState({ loading: false, response: data, error: res.ok ? null : data, time, status: res.status })
      return { ok: res.ok, data, status: res.status }
    } catch (err) {
      const time = Math.round(performance.now() - start)
      setState({ loading: false, response: null, error: { message: err.message }, time, status: 0 })
      return { ok: false, data: null, status: 0 }
    }
  }, [])

  const reset = useCallback(() => {
    setState({ loading: false, response: null, error: null, time: null, status: null })
  }, [])

  return { ...state, send, reset }
}
