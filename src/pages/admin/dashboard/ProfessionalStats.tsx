import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DashboardCard } from "@/shared/ui/dashboard/DashboardCard";
import { TooltipBox } from "@/shared/ui/dashboard/TooltipBox";
import { formatCurrency, formatCurrencyCompact } from "@/shared/utils/format";
import type { ProfessionalStat } from "./types";
import "./dashboard.css";

interface Props {
  data: ProfessionalStat[];
}

export function ProfessionalStats({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  const hasActivity = sorted.some(p => p.appointments > 0 || p.revenue > 0);

  return (
    <DashboardCard title="Rendimiento por profesional">
      {sorted.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', padding: '24px 0', margin: 0 }}>
          Todavía no hay profesionales registrados
        </p>
      ) : !hasActivity ? (
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', padding: '24px 0', margin: 0 }}>
          Todavía no hay turnos registrados en este período
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
            <XAxis type="number" domain={[0, 'dataMax']} allowDecimals={false} tickFormatter={formatCurrencyCompact} tick={{ fontSize: 13, fill: "#333", fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 14, fill: "#222", fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TooltipBox>
                    <p style={{ fontSize: "13px", color: "#ccc", margin: "0 0 4px", fontWeight: 600 }}>
                      {payload[0].payload.name}
                    </p>
                    <p style={{ fontSize: "18px", color: "#4dd0d0", margin: "0 0 2px", fontWeight: 700 }}>
                      {formatCurrency(payload[0].payload.revenue)}
                    </p>
                    <p style={{ fontSize: "14px", color: "#fff", margin: 0, fontWeight: 600 }}>
                      {payload[0].payload.appointments} turnos
                    </p>
                  </TooltipBox>
                ) : null
              }
            />
            <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={16}>
              {sorted.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {sorted.length > 0 && (
        <table className="professional-stats-table">
          <thead>
            <tr><th>Profesional</th><th>Turnos</th><th>Ingresos</th><th>Cancel.</th></tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr key={i}>
                <td><span className="professional-stats-dot" style={{ background: p.color }} />{p.name}</td>
                <td>{p.appointments}</td>
                <td>{formatCurrency(p.revenue)}</td>
                <td className={p.cancellations > 0 ? "professional-stats-cancel" : ""}>{p.cancellations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardCard>
  );
}