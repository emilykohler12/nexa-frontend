// src/features/professional/schedule/Schedule.tsx
import { useState, useEffect } from 'react'
import { api } from '@/shared/utils/api'
import { ScheduleStep } from '@/features/professional/onboarding/steps/ScheduleStep'
import { EMPTY_AVAILABILITY } from '@/features/professional/onboarding/types'
import type { WeeklyAvailability } from '@/features/professional/onboarding/types'
import './Schedule.css'

export function Schedule() {
  const [availability, setAvailability] = useState<WeeklyAvailability>(EMPTY_AVAILABILITY)
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)

  useEffect(() => {
    // TODO: parsear la respuesta del backend para convertir dayOfWeek a WeeklyAvailability
    api.get<{ profile: any }>('/api/professional/profile')
      .then(res => {
        const avail = res.data.profile?.availability ?? []
        const DAY_KEYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
        const parsed: WeeklyAvailability = { ...EMPTY_AVAILABILITY }
        avail.forEach((a: any) => {
          const key = DAY_KEYS[a.dayOfWeek] as keyof WeeklyAvailability
          if (key) parsed[key] = { start: a.startTime, end: a.endTime }
        })
        setAvailability(parsed)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/api/professional/schedule', { availability })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // TODO: mostrar error al usuario
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="schedule-loading">Cargando horarios...</div>

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <div>
          <h1 className="schedule-title">Horarios</h1>
          <p className="schedule-subtitle">Configurá tus días y rangos de atención</p>
        </div>
        <button
          className={`schedule-save-btn ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>

      <div className="schedule-content">
        <ScheduleStep availability={availability} onChange={setAvailability} />
      </div>
    </div>
  )
}