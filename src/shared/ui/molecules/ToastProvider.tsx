// src/shared/ui/molecules/ToastProvider.tsx
//
// Notificaciones flotantes (esquina inferior derecha) para reemplazar los
// mensajes de error/aviso que quedaban como texto fijo arriba de la página
// admin — fáciles de perder si el usuario ya scrolleó hacia abajo.
import { createContext, useContext, useState, useCallback } from 'react'
import { ToastCard } from './Toast'
import type { ToastType } from './Toast'

interface ToastItem {
  id:      number
  message: string
  type:    ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToasts(prev => [...prev, { id: nextId++, message, type }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[500] flex flex-col-reverse gap-3 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard message={t.message} type={t.type} onClose={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de un ToastProvider')
  return ctx
}
