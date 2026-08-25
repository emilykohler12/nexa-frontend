import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardCard } from "@/shared/ui/dashboard/DashboardCard";
import { TooltipBox } from "@/shared/ui/dashboard/TooltipBox";
import { formatCurrency } from "@/shared/utils/format";
import type { ServiceStat } from "./types";
import "./dashboard.css";

interface Props {
  data: ServiceStat[];
}

export function ServiceStats({ data }: Props) {
  if (data.length === 0) {
    return (
      <DashboardCard title="Servicios más realizados">
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', padding: '24px 0', margin: 0 }}>
          Todavía no hay datos de servicios
        </p>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard title="Servicios más realizados">
      <div className="service-stats-layout">
        <div className="service-stats-pie">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="count" paddingAngle={2}>
                {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox>
                      <p style={{ fontSize: "13px", color: "#ccc", margin: "0 0 4px", fontWeight: 600 }}>
                        {payload[0].payload.name}
                      </p>
                      <p style={{ fontSize: "15px", color: "#fff", margin: "0 0 2px", fontWeight: 600 }}>
                        {payload[0].payload.count} turnos
                      </p>
                      <p style={{ fontSize: "18px", color: "#4dd0d0", margin: 0, fontWeight: 700 }}>
                        {formatCurrency(payload[0].payload.revenue)}
                      </p>
                    </TooltipBox>
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="service-stats-list">
          {data.map((service, i) => (
            <div key={i} className="service-stats-row">
              <span className="service-stats-dot" style={{ background: service.color }} />
              <span className="service-stats-name">{service.name}</span>
              <span className="service-stats-count">{service.count} turnos</span>
              <span className="service-stats-revenue">{formatCurrency(service.revenue)}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}