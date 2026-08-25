import { useState, useEffect, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { ACTIVITY_MODULE_LABEL, ACTIVITY_LEVEL_CONFIG } from '@/app/data/admin/activity.data'
import type { ActivityLog, ActivityModule, ActivityLevel } from '@/app/data/admin/activity.data'
import './ActivityPage.css'

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterUser,   setFilterUser]   = useState('')
  const [filterDate,   setFilterDate]   = useState('')
  const [filterModule, setFilterModule] = useState<ActivityModule | ''>('')
  const [filterLevel,  setFilterLevel]  = useState<ActivityLevel  | ''>('')
  const [expanded,     setExpanded]     = useState<string | null>(null)

  useEffect(() => {
    api.get<{ logs: ActivityLog[] }>('/api/admin/activity')
      .then(res => setLogs(res.data.logs ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => logs.filter(log => {
    if (filterUser   && !log.user.toLowerCase().includes(filterUser.toLowerCase())) return false
    if (filterDate   && !log.timestamp.startsWith(filterDate)) return false
    if (filterModule && log.module !== filterModule) return false
    if (filterLevel  && log.level  !== filterLevel)  return false
    return true
  }), [logs, filterUser, filterDate, filterModule, filterLevel])

  const clearFilters = () => { setFilterUser(''); setFilterDate(''); setFilterModule(''); setFilterLevel('') }
  const hasActiveFilters = filterUser || filterDate || filterModule || filterLevel

  return (
    <div className="activity-page">

      <div className="activity-header">
        <h1>Actividad</h1>
        <p>Registro de todas las acciones del sistema</p>
      </div>

      <div className="activity-filters">
        <div className="activity-filter-field">
          <span className="activity-filter-label">Usuario</span>
          <input className="activity-input" placeholder="Buscar por usuario..." value={filterUser} onChange={e => setFilterUser(e.target.value)} />
        </div>
        <div className="activity-filter-field">
          <span className="activity-filter-label">Fecha</span>
          <input className="activity-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
        <div className="activity-filter-field">
          <span className="activity-filter-label">Módulo</span>
          <select className="activity-input" value={filterModule} onChange={e => setFilterModule(e.target.value as ActivityModule | '')}>
            <option value="">Todos</option>
            {(Object.entries(ACTIVITY_MODULE_LABEL) as [ActivityModule, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="activity-filter-field">
          <span className="activity-filter-label">Nivel</span>
          <select className="activity-input" value={filterLevel} onChange={e => setFilterLevel(e.target.value as ActivityLevel | '')}>
            <option value="">Todos</option>
            {(Object.entries(ACTIVITY_LEVEL_CONFIG) as [ActivityLevel, { label: string; color: string }][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="activity-clear-btn">Limpiar filtros</button>
        )}
      </div>

      <p className="activity-count">
        {filtered.length} registro{filtered.length !== 1 ? 's' : ''}{hasActiveFilters ? ' (filtrados)' : ''}
      </p>

      {loading ? (
        <p className="activity-loading">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="activity-empty">
          {logs.length === 0 ? 'Todavía no hay actividad registrada' : 'No hay registros que coincidan con los filtros'}
        </p>
      ) : (
        <div className="activity-list">
          {filtered.map(log => {
            const level  = ACTIVITY_LEVEL_CONFIG[log.level]
            const module = ACTIVITY_MODULE_LABEL[log.module]
            const isOpen = expanded === log.id
            return (
              <div key={log.id} className="activity-row">
                <div className="activity-row-main" onClick={() => setExpanded(isOpen ? null : log.id)}>
                  <span className="activity-dot" style={{ background: level.color }} />
                  <span className="activity-module-pill" style={{ background: `${level.color}15`, color: level.color }}>
                    {module}
                  </span>
                  <span className="activity-time">{formatTimestamp(log.timestamp)}</span>
                  <span className="activity-action">{log.action}</span>
                  <span className="activity-user">{log.user}</span>
                  {log.detail && (
                    <ChevronDown size={16} className={`activity-chevron ${isOpen ? 'activity-chevron--open' : ''}`} />
                  )}
                </div>
                {isOpen && log.detail && (
                  <div className="activity-detail">
                    <p><strong>Detalle:</strong> {log.detail}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
