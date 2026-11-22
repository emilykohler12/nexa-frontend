import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProfessionalDetail } from './ProfessionalDetail'
import { ProfessionalCard } from './ProfessionalCard'
import type { AdminProfessional } from './types'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: { services: [], history: [] } }), patch: vi.fn() },
}))

const person: AdminProfessional = {
  id: 'p1', name: 'Lucía Gómez', photo: null, specialty: 'Uñas', services: ['s1'],
  commissionType: 'earned', commissionPct: 50, status: 'active', role: 'professional',
  phone: '3764111111', email: 'lucia@test.local',
  socials: { instagram: 'https://instagram.com/lucia', facebook: null, tiktok: null, twitter: null },
  schedule: { monday: { start: '09:00', end: '18:00' }, tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null },
  daysOff: [], vacationFrom: null, vacationTo: null, createdAt: '2026-01-01T00:00:00.000Z',
  joinedAt: '2026-01-01', joinedAtIsDefault: false,
  metrics: { totalAppointments: 4, totalClients: 3, totalRevenue: 40000, rating: 4.5 },
}
const admin: AdminProfessional = { ...person, role: 'admin' }

const detail = (p: AdminProfessional) =>
  render(<MemoryRouter><ProfessionalDetail professional={p} onBack={vi.fn()} onSave={vi.fn()} /></MemoryRouter>)

beforeEach(() => { vi.clearAllMocks() })

describe('Profesionales (admin): el perfil de una administradora solo tiene los datos básicos', () => {
  it('la administradora no tiene Rendimiento, especialidad, redes, servicios, horarios ni vacaciones', () => {
    detail(admin)

    expect(screen.queryByRole('button', { name: 'Rendimiento' })).not.toBeInTheDocument()
    expect(screen.queryByText('Especialidad')).not.toBeInTheDocument()
    expect(screen.queryByText('Redes sociales')).not.toBeInTheDocument()
    expect(screen.queryByText('Servicios que realiza')).not.toBeInTheDocument()
    expect(screen.queryByText('Horarios laborales')).not.toBeInTheDocument()
    expect(screen.queryByText('Vacaciones', { selector: 'p' })).not.toBeInTheDocument()
    // lo básico sigue
    expect(screen.getByText('Datos personales')).toBeInTheDocument()
    expect(screen.getByText('Fecha de ingreso al estudio')).toBeInTheDocument()
  })

  it('si vuelve a ser profesional reaparece todo (los datos nunca se borraron)', () => {
    detail(person)

    expect(screen.getByRole('button', { name: 'Rendimiento' })).toBeInTheDocument()
    expect(screen.getByText('Especialidad')).toBeInTheDocument()
    expect(screen.getByText('Redes sociales')).toBeInTheDocument()
    expect(screen.getByText('Servicios que realiza')).toBeInTheDocument()
    expect(screen.getByText('Horarios laborales')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Uñas')).toBeInTheDocument()
  })

  it('la tarjeta de la administradora muestra solo nombre, rol y estado (sin especialidad ni métricas)', () => {
    render(<ProfessionalCard professional={admin} onClick={vi.fn()} onToggleRole={vi.fn()} onToggleStatus={vi.fn()} />)

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.queryByText('Uñas')).not.toBeInTheDocument()
    expect(screen.queryByText('Turnos totales')).not.toBeInTheDocument()
    expect(screen.queryByText('Facturación total')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar admin' })).toBeInTheDocument()
  })

  it('la tarjeta de una profesional sí muestra especialidad y métricas', () => {
    render(<ProfessionalCard professional={person} onClick={vi.fn()} onToggleRole={vi.fn()} onToggleStatus={vi.fn()} />)

    expect(screen.getByText('Uñas')).toBeInTheDocument()
    expect(screen.getByText('Turnos totales')).toBeInTheDocument()
  })
})
