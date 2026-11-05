import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TodayAppointments } from './TodayAppointments'
import type { Appointment } from '@/features/professional/types/appointment'

const appointment = (id: string, name: string, date: string): Appointment => ({
  id, date, time: '22:00', duration: 60, status: 'confirmed', serviceName: 'Corte', servicePrice: 10000,
  client: { id: 'c1', name, phone: '', email: '', photo: null, allergies: '', notes: '' },
} as unknown as Appointment)

function renderToday(list: Appointment[]) {
  render(<MemoryRouter><TodayAppointments appointments={list} primary="#069494" accent="#d4af37" /></MemoryRouter>)
}

describe('Turnos de hoy (inicio de la profesional): hoy es el día de Argentina', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }) })
  afterEach(() => { vi.useRealTimers() })

  it('a las 20:59 muestra los turnos de hoy', () => {
    vi.setSystemTime(new Date('2026-10-31T20:59:00-03:00'))
    renderToday([appointment('1', 'Ana', '2026-10-31'), appointment('2', 'Berta', '2026-11-01')])

    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.queryByText('Berta')).not.toBeInTheDocument()
  })

  it('a las 21:30 (ya es el día siguiente en UTC) sigue mostrando los turnos de hoy y no los de mañana', () => {
    vi.setSystemTime(new Date('2026-10-31T21:30:00-03:00'))
    renderToday([appointment('1', 'Ana', '2026-10-31'), appointment('2', 'Berta', '2026-11-01')])

    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.queryByText('Berta')).not.toBeInTheDocument()
  })

  it('a las 23:59 todavía es hoy', () => {
    vi.setSystemTime(new Date('2026-10-31T23:59:00-03:00'))
    renderToday([appointment('1', 'Ana', '2026-10-31')])

    expect(screen.getByText('Ana')).toBeInTheDocument()
  })

  it('pasada la medianoche pasa al día nuevo', () => {
    vi.setSystemTime(new Date('2026-11-01T00:01:00-03:00'))
    renderToday([appointment('1', 'Ana', '2026-10-31'), appointment('2', 'Berta', '2026-11-01')])

    expect(screen.queryByText('Ana')).not.toBeInTheDocument()
    expect(screen.getByText('Berta')).toBeInTheDocument()
  })
})
