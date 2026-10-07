import { useEffect, useRef } from 'react'

// Minimal STOMP-over-WebSocket client so the dashboard does not need a second
// runtime dependency. Spring's SockJS endpoint exposes the native websocket
// transport at /ws/websocket.
export function useRealtimeDashboard(projectIds, onActivity) {
  const socketRef = useRef(null)
  const subscriptionsRef = useRef([])
  const callbackRef = useRef(onActivity)
  const projectIdsKey = JSON.stringify(projectIds || [])

  useEffect(() => { callbackRef.current = onActivity }, [onActivity])

  useEffect(() => {
    const ids = [...new Set(JSON.parse(projectIdsKey).filter(Boolean).map(Number))]
    if (!ids.length) return undefined

    const url = new URL('/ws/websocket', window.location.href)
    url.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const socket = new WebSocket(url)
    socketRef.current = socket

    const send = (frame, headers = {}, body = '') => {
      const headerText = Object.entries(headers).map(([k, v]) => `${k}:${v}`).join('\n')
      socket.send(`${frame}\n${headerText}\n\n${body}\0`)
    }

    const handleFrame = (raw) => {
      const clean = raw.replace(/^\n+/, '')
      const separator = clean.indexOf('\n\n')
      if (separator < 0) return
      const commandAndHeaders = clean.slice(0, separator).split('\n')
      const command = commandAndHeaders.shift()
      const headers = Object.fromEntries(commandAndHeaders.map(line => {
        const i = line.indexOf(':')
        return i > 0 ? [line.slice(0, i), line.slice(i + 1)] : [line, '']
      }))
      const body = clean.slice(separator + 2).replace(/\0$/, '')

      if (command === 'MESSAGE' && body) {
        try { callbackRef.current(JSON.parse(body)) } catch { /* ignore malformed events */ }
      }
      if (command === 'CONNECTED') {
        subscriptionsRef.current = ids.map((id, index) => {
          const idHeader = `dashboard-${id}-${index}`
          send('SUBSCRIBE', { id: idHeader, destination: `/topic/project/${id}/activity`, ack: 'auto' })
          return idHeader
        })
      }
      if (command === 'ERROR') socket.close()
      void headers
    }

    let buffer = ''
    socket.onopen = () => send('CONNECT', {
      'accept-version': '1.2',
      'heart-beat': '10000,10000',
    })
    socket.onmessage = event => {
      buffer += String(event.data)
      const frames = buffer.split('\0')
      buffer = frames.pop() || ''
      frames.filter(Boolean).forEach(handleFrame)
    }
    socket.onerror = () => {}

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        subscriptionsRef.current.forEach(id => send('UNSUBSCRIBE', { id }))
        send('DISCONNECT')
      }
      subscriptionsRef.current = []
      socket.close()
      socketRef.current = null
    }
  }, [projectIdsKey])
}
