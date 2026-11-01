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

// Fecha («YYYY-MM-DD») de un instante en hora de Argentina (America/Argentina/Buenos_Aires), sin importar la zona del
// navegador. `toISOString()` da la fecha en UTC y desde las 21:00 de Argentina ya devuelve «mañana».
const ARGENTINA_TZ = 'America/Argentina/Buenos_Aires'
const argentinaDateParts = new Intl.DateTimeFormat('en-US', {
  timeZone: ARGENTINA_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
})

export function argentinaDateOf(at: Date): string {
  const parts = argentinaDateParts.formatToParts(at)
  const pick = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${pick('year')}-${pick('month')}-${pick('day')}`
}

export function todayInArgentina(now: Date = new Date()): string {
  return argentinaDateOf(now)
}
