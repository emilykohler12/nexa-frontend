import { useState, useEffect } from 'react';
import { api } from '@/shared/utils/api';
import { formatCurrency } from '@/shared/utils/format';
import type { AdminProfessional, ProfessionalAppointmentHistory } from '../types';
import '../professionals.css';

interface Props {
  professional: AdminProfessional;
}

function ratingStars(rating: number) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '☆' : '') + '✩'.repeat(empty);
}

export function PerformanceTab({ professional: p }: Props) {
  const [history, setHistory] = useState<ProfessionalAppointmentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ history: ProfessionalAppointmentHistory[] }>(`/api/professionals/${p.id}/history`)
      // Defensivo: solo turnos que el admin o el profesional ya marcaron como
      // finalizados cuentan como "realizados" acá — nunca los próximos/confirmados.
      .then(res => setHistory((res.data.history ?? []).filter(a => a.status === 'finished')))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [p.id]);

  return (
    <div>
      <div className="perf-kpis">
        <div className="perf-kpi">
          <div className="perf-kpi-value">{p.metrics.totalAppointments}</div>
          <div className="perf-kpi-label">Turnos totales</div>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-value">{p.metrics.totalClients}</div>
          <div className="perf-kpi-label">Clientes atendidos</div>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-value">{formatCurrency(p.metrics.totalRevenue)}</div>
          <div className="perf-kpi-label">Facturación total</div>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-value rating-stars" title={`${p.metrics.rating} / 5`}>
            {ratingStars(p.metrics.rating)}
          </div>
          <div className="perf-kpi-label">{p.metrics.rating} / 5</div>
          <div className="perf-kpi-sub">promedio de reseñas de clientes</div>
        </div>
      </div>

      <div className="prof-section" style={{ marginTop: 16 }}>
        <p className="prof-section-title">Turnos realizados</p>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '32px', color: '#000', fontSize: '15px', fontFamily: "'Lato', sans-serif" }}>
            Cargando...
          </p>
        ) : history.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px', color: '#000', fontSize: '15px', fontFamily: "'Lato', sans-serif" }}>
            Todavía no hay turnos realizados
          </p>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'auto' }}>
            <table style={{ width: '100%', minWidth: '520px', borderCollapse: 'collapse', fontSize: '15px', fontFamily: "'Lato', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  {['Servicio', 'Cliente', 'Fecha', 'Precio'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(appt => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '13px 16px', color: '#000', fontWeight: 700 }}>{appt.service}</td>
                    <td style={{ padding: '13px 16px', color: '#000' }}>{appt.client}</td>
                    <td style={{ padding: '13px 16px', color: '#000' }}>
                      {new Date(appt.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })} · {appt.time}
                    </td>
                    <td style={{ padding: '13px 16px', color: '#069494', fontWeight: 700 }}>
                      ${appt.price.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
