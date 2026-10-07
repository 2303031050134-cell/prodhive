import { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-xl border animate-in slide-in-from-right-5 duration-200 ${
            t.type === 'success'
              ? 'bg-[var(--bg-surface-1)] border-emerald-500/30 text-emerald-400'
              : 'bg-[var(--bg-surface-1)] border-red-500/30 text-red-400'
          }`}>
            <span>{t.type === 'success' ? '✓' : '✕'}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
