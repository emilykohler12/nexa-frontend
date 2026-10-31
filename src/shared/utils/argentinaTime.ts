// Los turnos son texto en hora de Argentina (UTC-3, sin horario de verano): "YYYY-MM-DD" + "HH:mm".
// Para comparar con "ahora" se arma el instante real del turno con el offset fijo, así el resultado
// no depende de la zona horaria del navegador. No usar `new Date('YYYY-MM-DD')` ni `toISOString()`
// para esto: dan la fecha en UTC.
const MINUTE = 60_000

export function appointmentInstant(date: string, time: string): Date {
  return new Date(`${date}T${time}:00-03:00`)
}

// Minutos transcurridos desde la hora de inicio del turno (negativo si todavía no empezó).
export function minutesSinceStart(date: string, time: string, now: Date = new Date()): number {
  return (now.getTime() - appointmentInstant(date, time).getTime()) / MINUTE
}
