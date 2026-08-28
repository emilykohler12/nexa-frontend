import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { AgendaDay }   from './components/AgendaDay'
import { AgendaWeek }  from './components/AgendaWeek'
import { AgendaMonth } from './components/AgendaMonth'
import { AppointmentDialog } from './dialogs/AppointmentDialog'
import { CreateAppointmentModal } from './dialogs/CreateAppointmentModal'
import type { Appointment } from '@/features/professional/types/appointment'
import type { SpecialAssignment } from './components/AgendaDay'

type View = 'day' | 'week' | 'month'

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

// Nunca usar toISOString() acá — convierte a UTC y puede correr la fecha un
// día para atrás/adelante según la zona horaria. Armamos el string en local.
const toISODate = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function Agenda() {
  const { business } = useTenant()
  const [view, setView]             = useState<View>('week')
  const [current, setCurrent]       = useState(new Date())
  const [selected, setSelected]     = useState<Appointment | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showCreate, setShowCreate] = useState(false)
  // Horarios de servicios especiales asignados a este profesional que
  // todavía nadie reservó — se muestran como bloque vacío en la agenda.
  const [specialAssignments, setSpecialAssignments] = useState<Record<string, SpecialAssignment[]>>({})

  useEffect(() => {
    api.get<{ appointments: Appointment[] }>('/api/professional/appointments')
      .then(res => setAppointments(res.data.appointments ?? []))
      .catch(() => setAppointments([]))
  }, [])

  useEffect(() => {
    if (view === 'month') return
    const dates = view === 'day'
      ? [toISODate(current)]
      : Array.from({ length: 7 }, (_, i) => {
          const d = getWeekStart(current); d.setDate(d.getDate() + i); return toISODate(d)
        })

    Promise.all(dates.map(date =>
      api.get<{ assignments: SpecialAssignment[] }>('/api/professional/special-assignments', { params: { date } })
        .then((res): [string, SpecialAssignment[]] => [date, res.data.assignments ?? []])
        .catch((): [string, SpecialAssignment[]] => [date, []])
    )).then(entries => {
      setSpecialAssignments(prev => {
        const next = { ...prev }
        entries.forEach(([date, list]) => { next[date] = list })
        return next
      })
    })
  }, [view, current])

  if (!business) return null
  const { primaryColor: primary, accentColor: accent } = business

  // Los turnos cancelados no deberían seguir ocupando lugar en la agenda.
  const visibleAppointments = appointments.filter(a => a.status !== 'cancelled')

  // Defensivo: si un cliente ya reservó ese horario, va a aparecer como turno
  // real — no hace falta (ni conviene) mostrar el bloque vacío encima.
  const isAlreadyBooked = (date: string, time: string) =>
    visibleAppointments.some(a => a.date === date && a.time === time)

  const openSpecialAssignments = (date: string): SpecialAssignment[] =>
    (specialAssignments[date] ?? []).filter(sa => !isAlreadyBooked(date, sa.time))

  const navigate = (dir: 1 | -1) => {
    const d = new Date(current)
    if (view === 'day')   d.setDate(d.getDate() + dir)
    if (view === 'week')  d.setDate(d.getDate() + dir * 7)
    if (view === 'month') d.setMonth(d.getMonth() + dir)
    setCurrent(d)
  }

  const getTitle = () => {
    if (view === 'month') return `${MONTH_NAMES[current.getMonth()]} ${current.getFullYear()}`
    if (view === 'day')   return current.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    const ws = getWeekStart(current)
    const we = new Date(ws); we.setDate(ws.getDate() + 6)
    const sameMonth = ws.getMonth() === we.getMonth()
    const start = sameMonth ? `${ws.getDate()}` : `${ws.getDate()} ${MONTH_NAMES[ws.getMonth()].slice(0,3)}`
    return `${start} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()].slice(0,3)} ${we.getFullYear()}`
  }

  const handleSave = async (updated: Appointment) => {
    try {
      const res = await api.patch<{ appointment: Appointment }>(`/api/professional/appointments/${updated.id}`, {
        status:        updated.status,
        internalNotes: updated.internalNotes,
      })
      setAppointments(prev => prev.map(a => a.id === updated.id ? res.data.appointment : a))
    } catch {
      // deja el turno como estaba si falla el guardado
    } finally {
      setSelected(null)
    }
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 18px', border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Lato', sans-serif",
    background: active ? primary : 'transparent',
    color: active ? '#fff' : '#000',
    transition: 'all 0.15s ease',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Agenda</h1>
          <p style={{ fontSize: '16px', color: '#000', margin: 0 }}>Administrá tus turnos y disponibilidad</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
              border: 'none', borderRadius: '9px', background: primary, color: '#fff',
              cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
            }}
          >
            <Plus size={15} /> Crear turno manual
          </button>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <NavBtn onClick={() => navigate(-1)}><ChevronLeft size={16} /></NavBtn>
            <button onClick={() => setCurrent(new Date())} style={{ ...btnStyle(false), border: '1px solid #e0e0e0', fontSize: '14px' }}>Hoy</button>
            <NavBtn onClick={() => navigate(1)}><ChevronRight size={16} /></NavBtn>
          </div>

          <span style={{ fontSize: '17px', fontWeight: 700, color: '#000', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
            {getTitle()}
          </span>

          <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: '10px', padding: '3px', gap: '2px' }}>
            <button style={btnStyle(view === 'day')}   onClick={() => setView('day')}>Día</button>
            <button style={btnStyle(view === 'week')}  onClick={() => setView('week')}>Semana</button>
            <button style={btnStyle(view === 'month')} onClick={() => setView('month')}>Mes</button>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {view === 'day'   && <AgendaDay   appointments={visibleAppointments} day={current}                   primary={primary} onEventClick={setSelected} specialAssignments={openSpecialAssignments(toISODate(current))} />}
        {view === 'week'  && <AgendaWeek  appointments={visibleAppointments} weekStart={getWeekStart(current)} primary={primary} onEventClick={setSelected} getSpecialAssignments={openSpecialAssignments} />}
        {view === 'month' && <AgendaMonth appointments={visibleAppointments} month={current}                  primary={primary} onEventClick={setSelected} />}
      </div>

      {selected && (
        <AppointmentDialog
          appointment={selected}
          primary={primary}
          accent={accent}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      )}

      {showCreate && (
        <CreateAppointmentModal
          primary={primary}
          onClose={() => setShowCreate(false)}
          onCreated={created => {
            setAppointments(prev => [...prev, created])
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}

function NavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', border: '1px solid #e0e0e0', borderRadius: '7px', background: h ? '#f0fafa' : '#f5f5f5', color: h ? '#069494' : '#444', cursor: 'pointer', transition: 'all 0.15s' }}>
      {children}
    </button>
  )
}