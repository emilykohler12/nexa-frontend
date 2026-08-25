export * from './types';
export * from './day.data';
export * from './week.data';
export * from './month.data';
export * from './year.data';

import { dayData }   from './day.data';
import { weekData }  from './week.data';
import { monthData } from './month.data';
import { yearData }  from './year.data';
import type { PeriodFilter, DashboardData } from './types';

export const dashboardData: Record<PeriodFilter, DashboardData> = {
  day:   dayData,
  week:  weekData,
  month: monthData,
  year:  yearData,
};