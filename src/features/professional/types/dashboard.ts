export interface DashboardStats {
  todayAppointments:  number
  nextClientName:     string | null
  nextClientTime:     string | null
  monthRevenue:       number
  monthServices:      number
  newClients:         number
  recurringClients:   number
  totalClients:       number
  avgRating:          number
  hoursWorked:        number
  occupancyPercent:   number
}

export interface RevenuePoint {
  label:   string
  revenue: number
  count:   number
}