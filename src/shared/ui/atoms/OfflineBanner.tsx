import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)

  useEffect(() => {
    const goOnline  = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
        background: '#e53935', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '10px 16px', fontSize: '14px', fontWeight: 700,
        fontFamily: "'Lato', sans-serif",
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
      }}
      role="alert"
    >
      <WifiOff size={16} />
      Sin conexión a internet — algunos cambios podrían no guardarse hasta que vuelva la señal.
    </div>
  )
}
