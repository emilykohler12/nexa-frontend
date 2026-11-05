// Reglas de cancelación y devolución de la seña (fase 3 del backend, cancellationRules.ts). El frontend solo
// adelanta el resultado para que la usuaria sepa qué va a pasar: la decisión real la toma el backend.
// El sistema únicamente MARCA la seña como devuelta; el dinero se devuelve por fuera.
import { appointmentInstant } from '@/shared/utils/argentinaTime'

export type CancelledBy = 'client' | 'studio' | 'system'
export type NoticeChannel = 'whatsapp' | 'call' | 'in_person' | 'other'
export type StaffRole = 'admin' | 'professional'

export const NOTICE_CHANNEL_LABELS: Record<NoticeChannel, string> = {
  whatsapp: 'WhatsApp', call: 'Llamada', in_person: 'En persona', other: 'Otro',
}
export const NOTICE_CHANNELS = Object.keys(NOTICE_CHANNEL_LABELS) as NoticeChannel[]

export const NOTICE_NOTE_MAX_LENGTH = 200
// La profesional no puede cargar un aviso de más de estas horas atrás; ese caso lo carga la administradora.
export const PROFESSIONAL_NOTICE_MAX_HOURS = 48

export interface RefundRule {
  cancellationHours: number
  refundPolicy:      'full' | 'none'
}

// Lo que el personal manda en el PATCH al cancelar un turno (status 'cancelled').
export interface StaffCancellation {
  cancelledBy:     'client' | 'studio'
  clientNoticeAt?: string          // ISO
  noticeChannel?:  NoticeChannel
  noticeNote?:     string
}

// Objeto `cancellation` del detalle del turno (admin y profesional); solo viene en turnos cancelados.
export interface CancellationDetail {
  cancelledBy:    CancelledBy | null
  cancelledAt:    string | null
  refunded:       boolean
  noticeAt:       string | null
  noticeHours:    number | null
  noticeChannel:  NoticeChannel | null
  noticeNote:     string | null
  noticeLoadedBy: { id: string; name: string } | null
  noticeLoadedAt: string | null
}

const HOUR_MS = 3_600_000

// La seña está paga cuando se confirmó el pago: 'partial' (seña paga) o 'paid' (todo cobrado).
export function isDepositPaid(paymentStatus?: string | null): boolean {
  return paymentStatus === 'partial' || paymentStatus === 'paid'
}

// Horas entre el aviso (o ahora) y el inicio del turno. Negativas si el aviso es posterior al inicio.
export function noticeHoursBefore(date: string, time: string, noticeAt: Date): number {
  return (appointmentInstant(date, time).getTime() - noticeAt.getTime()) / HOUR_MS
}

// «13 h 0 min». Los minutos se truncan (nunca se redondea hacia arriba): 11 h 59 min no puede verse como 12 h.
export function formatHours(hours: number): string {
  const totalMinutes = Math.floor(Math.abs(hours) * 60 + 1e-6)
  return `${Math.floor(totalMinutes / 60)} h ${totalMinutes % 60} min`
}

export type RefundOutcome =
  | { kind: 'no_deposit' }
  | { kind: 'unknown' }
  | { kind: 'refund' }
  | { kind: 'retained'; reason: 'policy_none' | 'late' | 'after_start' }

// Mismo criterio que decideRefund del backend: cancela el estudio, se devuelve toda la seña; cancela la clienta,
// se devuelve con `cancellationHours` o más de anticipación (y si la política no es «ninguna»).
export function decideRefund(p: {
  rule:        RefundRule | null
  cancelledBy: 'client' | 'studio'
  paid:        boolean
  hours:       number
}): RefundOutcome {
  if (!p.paid) return { kind: 'no_deposit' }
  if (p.cancelledBy === 'studio') return { kind: 'refund' }
  if (!p.rule) return { kind: 'unknown' }
  if (p.rule.refundPolicy === 'none') return { kind: 'retained', reason: 'policy_none' }
  if (p.hours >= p.rule.cancellationHours) return { kind: 'refund' }
  return { kind: 'retained', reason: p.hours < 0 ? 'after_start' : 'late' }
}

// Texto del resultado en el diálogo del personal, antes de confirmar.
export function describeStaffOutcome(o: RefundOutcome, p: { cancelledBy: 'client' | 'studio'; hours: number; rule: RefundRule | null }): string {
  if (o.kind === 'no_deposit') return 'No hay seña paga para devolver.'
  if (o.kind === 'unknown') return 'No pudimos consultar la política de devolución: el resultado lo calcula el servidor al confirmar.'
  if (p.cancelledBy === 'studio') return 'Se devuelve toda la seña.'
  const ahead = `Avisó con ${formatHours(p.hours)} de anticipación`
  if (o.kind === 'refund') return `${ahead}: se devuelve la seña.`
  if (o.reason === 'after_start') return 'El aviso es posterior al inicio del turno: la seña queda retenida.'
  if (o.reason === 'policy_none') return `${ahead}: la seña queda retenida. La política del estudio es no devolver la seña cuando cancela la clienta.`
  return `${ahead}: la seña queda retenida. El plazo para recuperarla es de ${p.rule?.cancellationHours} h.`
}

// Texto del resultado para la clienta que cancela desde la app, antes de confirmar.
export function describeClientOutcome(o: RefundOutcome, p: { hours: number; rule: RefundRule | null }): string {
  switch (o.kind) {
    case 'no_deposit': return 'Este turno no tiene seña paga, así que no hay nada para devolver.'
    case 'unknown':    return 'Si la seña se devuelve o queda retenida depende del tiempo que falte para el turno. Te lo mostramos al cancelar.'
    case 'refund':     return `Faltan ${formatHours(p.hours)} para el turno: se te devuelve la seña.`
    case 'retained':
      if (o.reason === 'after_start') return 'El turno ya empezó: la seña queda retenida.'
      if (o.reason === 'policy_none') return 'Por la política del estudio, la seña no se devuelve cuando cancela la clienta: queda retenida.'
      return `Faltan ${formatHours(p.hours)} para el turno y el plazo para recuperar la seña es de ${p.rule?.cancellationHours} h: la seña queda retenida.`
  }
}

// ── Hora de aviso ────────────────────────────────────────────────────────────
// Los turnos y el estudio están en hora de Argentina (UTC-3, sin horario de verano). El campo de fecha y hora se
// lee y se escribe en esa hora, así el resultado no depende de la zona del navegador.
const ARGENTINA_OFFSET_MS = 3 * HOUR_MS

// «YYYY-MM-DDTHH:mm» en hora de Argentina (formato de <input type="datetime-local">). Se corre el instante −3 h
// y se lee en UTC a propósito: es la hora de pared de Argentina.
export function toArgentinaInput(at: Date): string {
  return new Date(at.getTime() - ARGENTINA_OFFSET_MS).toISOString().slice(0, 16)
}

export function fromArgentinaInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const at = new Date(`${value}:00-03:00`)
  return Number.isNaN(at.getTime()) ? null : at
}

export type NoticeProblem = 'invalid' | 'future' | 'too_old'

export const NOTICE_PROBLEM_MESSAGES: Record<NoticeProblem, string> = {
  invalid: 'Indicá el día y la hora en que avisó la clienta.',
  future:  'La hora de aviso no puede ser futura.',
  too_old: `Un aviso de hace más de ${PROFESSIONAL_NOTICE_MAX_HOURS} horas lo tiene que cargar la administradora.`,
}

export function checkNoticeTime(p: { noticeAt: Date | null; now: Date; role: StaffRole }): NoticeProblem | null {
  if (!p.noticeAt) return 'invalid'
  if (p.noticeAt.getTime() > p.now.getTime()) return 'future'
  if (p.role === 'professional' && p.now.getTime() - p.noticeAt.getTime() > PROFESSIONAL_NOTICE_MAX_HOURS * HOUR_MS) return 'too_old'
  return null
}
