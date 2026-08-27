import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { ProfessionalFilter } from './ProfessionalFilter'
import { AppointmentModal }   from './AppointmentModal'
import { CreateAppointmentModal } from './CreateAppointmentModal'
import { CalendarWeek }       from './CalendarWeek'
import { CalendarMonth }      from './CalendarMonth'
import { CalendarDay }        from './CalendarDay'
import type { Appointment, Professional } from './types'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

type ViewMode = 'month' | 'week' | 'day'

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const PROFESSIONAL_COLORS = ['#069494', '#d4af37', '#e57373', '#7986cb', '#4db6ac', '#f06292', '#a1887f', '#90a4ae']

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

interface ApiProfessional { id: string; name: string; status?: string }

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedIds, setSelectedIds]   = useState<string[]>([])
  const [modalAppt, setModalAppt]       = useState<Appointment | null>(null)
  const [filterCollapsed, setFilterCollapsed] = useState(false)
  const [view, setView]       = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    api.get<{ professionals: ApiProfessional[] }>('/api/professionals')
      .then(res => {
        // Los profesionales desactivados no toman turnos nuevos — no tiene sentido
        // que aparezcan como opción en el calendario de Turnos.
        const list = (res.data.professionals ?? [])
          .filter(p => !p.status || p.status === 'active')
          .map((p, i) => ({
            id: p.id, name: p.name, color: PROFESSIONAL_COLORS[i % PROFESSIONAL_COLORS.length],
          }))
        setProfessionals(list)
        setSelectedIds(list.map(p => p.id))
      })
      .catch(() => { setProfessionals([]); setSelectedIds([]) })

    api.get<{ appointments: Appointment[] }>('/api/admin/appointments')
      .then(res => setAppointments(res.data.appointments ?? []))
      .catch(() => setAppointments([]))
  }, [])

  const filtered = appointments.filter(a => selectedIds.includes(a.professionalId) && a.status !== 'cancelled')

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate)
    if (view === 'month') d.setMonth(d.getMonth() + dir)
    if (view === 'week')  d.setDate(d.getDate() + dir * 7)
    if (view === 'day')   d.setDate(d.getDate() + dir)
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(new Date())

  const getTitle = () => {
    if (view === 'month') return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    if (view === 'week') {
      const ws = getWeekStart(currentDate)
      const we = new Date(ws); we.setDate(ws.getDate() + 6)
      const sameMonth = ws.getMonth() === we.getMonth()
      const start = sameMonth ? `${ws.getDate()}` : `${ws.getDate()} ${MONTH_NAMES[ws.getMonth()].slice(0,3)}`
      return `${start} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()].slice(0,3)} ${we.getFullYear()}`
    }
    return currentDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Devuelven null si se guardó bien, o un mensaje de error si no —
  // así el modal se queda abierto y muestra el error en vez de revertir en silencio.
  const patchStatus = async (id: string, status: Appointment['status']): Promise<string | null> => {
    try {
      const res = await api.patch<{ appointment?: Appointment }>(`/api/admin/appointments/${id}`, { status })
      setAppointments(p => p.map(a => a.id === id ? (res.data.appointment ?? { ...a, status }) : a))
      return null
    } catch (err: any) {
      return safeErrorMessage(err, 'No se pudo actualizar el turno.')
    }
  }

  const handleCancel     = (id: string) => patchStatus(id, 'cancelled')
  const handleReactivate = (id: string) => patchStatus(id, 'confirmed')

  const handleSave = async (upd: Appointment): Promise<string | null> => {
    try {
      const res = await api.patch<{ appointment?: Appointment }>(`/api/admin/appointments/${upd.id}`, {
        clientName:         upd.clientName,
        clientPhone:        upd.clientPhone,
        clientEmail:        upd.clientEmail,
        professionalId:     upd.professionalId,
        serviceDuration:    upd.serviceDuration,
        servicePrice:       upd.servicePrice,
        clientNotes:        upd.clientNotes,
        professionalNotes:  upd.professionalNotes,
        start:              upd.start,
        end:                upd.end,
      })
      setAppointments(p => p.map(a => a.id === upd.id ? (res.data.appointment ?? upd) : a))
      return null
    } catch (err: any) {
      return safeErrorMessage(err, 'No se pudo guardar el turno.')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px', fontFamily: "'Lato', sans-serif" }}>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Turnos</h1>
          <p style={{ fontSize: '16px', color: '#000', margin: 0 }}>Visualizá y gestioná todos los turnos</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 20px', border: 'none', borderRadius: '9px',
            background: '#069494', color: '#fff', cursor: 'pointer',
            fontSize: '15px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
          }}
        >
          <Plus size={16} /> Crear turno manual
        </button>
      </div>

      <div style={{ display: 'flex', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '16px', overflow: 'hidden', flex: 1, minHeight: '600px', boxShadow: '0 4px 24px rgba(6,148,148,0.06)' }}>

        <div style={{ width: filterCollapsed ? '44px' : '180px', minWidth: filterCollapsed ? '44px' : '180px', transition: 'width 0.25s ease, min-width 0.25s ease', borderRight: '1px solid #e8e8e8', overflow: 'hidden' }}>
          <ProfessionalFilter
            professionals={professionals}
            selectedIds={selectedIds}
            onToggle={id => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            onSelectAll={() => setSelectedIds(selectedIds.length === professionals.length ? [] : professionals.map(p => p.id))}
            collapsed={filterCollapsed}
            onToggleCollapse={() => setFilterCollapsed(c => !c)}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <ToolbarBtn onClick={() => navigate(-1)}><ChevronLeft size={16} /></ToolbarBtn>
              <ToolbarBtn onClick={() => navigate(1)}><ChevronRight size={16} /></ToolbarBtn>
              <ToolbarBtn onClick={goToday}>Hoy</ToolbarBtn>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#000', flex: 1, textAlign: 'center', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
              {getTitle()}
            </span>
            <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '8px', padding: '3px', gap: '2px' }}>
              {(['month','week','day'] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: '6px 14px', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Lato', sans-serif", background: view === v ? '#069494' : 'transparent', color: view === v ? '#fff' : '#000', transition: 'all 0.15s ease' }}>
                  {{ month: 'Mes', week: 'Semana', day: 'Día' }[v]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {view === 'week'  && <CalendarWeek  appointments={filtered} professionals={professionals} weekStart={getWeekStart(currentDate)} onEventClick={setModalAppt} />}
            {view === 'month' && <CalendarMonth appointments={filtered} professionals={professionals} month={currentDate}                    onEventClick={setModalAppt} />}
            {view === 'day'   && <CalendarDay   appointments={filtered} professionals={professionals} day={currentDate}                      onEventClick={setModalAppt} />}
          </div>
        </div>
      </div>

      {modalAppt && (
        <AppointmentModal
          appointment={modalAppt}
          professionals={professionals}
          onClose={() => setModalAppt(null)}
          onCancel={handleCancel}
          onReactivate={handleReactivate}
          onSave={handleSave}
        />
      )}

      {showCreate && (
        <CreateAppointmentModal
          professionals={professionals}
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

function ToolbarBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 12px', border: '1px solid #e0e0e0', borderRadius: '7px', background: h ? '#f0fafa' : '#f5f5f5', color: h ? '#069494' : '#000', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: "'Lato', sans-serif", transition: 'all 0.15s ease' }}>
      {children}
    </button>
  )
}