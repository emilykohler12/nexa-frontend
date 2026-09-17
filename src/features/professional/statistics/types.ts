export interface ServiceStat {
  name:      string
  attended:  number
  revenue:   number
  cancelled: number
}

export interface HeatmapRow {
  day:       string
  morning:   number
  afternoon: number
  evening:   number
}

export interface ProfessionalDashboardData {
  futureConfirmedAppointments: number
  hoursWorked:                 number
  occupancyPercent:            number
  totalRevenue:                number
  avgRating:                   number
  serviceStats:                ServiceStat[]
  heatmap:                     HeatmapRow[]
}
