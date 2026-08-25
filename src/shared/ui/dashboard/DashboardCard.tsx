import type { ReactNode } from "react";
import "./DashboardCard.css";

interface Props {
  title: string;
  children: ReactNode;
}

export function DashboardCard({ title, children }: Props) {
  return (
    <div className="dashboard-card">
      <p className="dashboard-card-label">{title}</p>
      {children}
    </div>
  );
}