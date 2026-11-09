import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VacationSection } from './VacationSection'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({ api: { get: vi.fn(), patch: vi.fn() } }))

const apiError = (status: number, data: { error?: string; code?: string }) => ({ response: { status, data } })

describe('VacationSection (profesional): sus propias vacaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockResolvedValue({ data: { profile: { vacationFrom: null, vacationTo: null } } } as never)
    vi.mocked(api.patch).mockResolvedValue({ data: {} } as never)
  })

  it('carga las vacaciones guardadas', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { profile: { vacationFrom: '2027-01-10', vacationTo: '2027-01-24' } } } as never)
    render(<VacationSection />)

    expect(await screen.findByLabelText('Desde')).toHaveValue('2027-01-10')
    expect(screen.getByLabelText('Hasta')).toHaveValue('2027-01-24')
  })

  it('guarda las dos fechas en su propio perfil', async () => {
    const user = userEvent.setup()
    render(<VacationSection />)

    fireEvent.change(await screen.findByLabelText('Desde'), { target: { value: '2027-02-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2027-02-15' } })
    await user.click(screen.getByRole('button', { name: 'Guardar vacaciones' }))

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/api/professional/profile', { vacationFrom: '2027-02-01', vacationTo: '2027-02-15' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Vacaciones guardadas')
  })

  it('no manda nada si el inicio es posterior al fin, y lo explica', async () => {
    const user = userEvent.setup()
    render(<VacationSection />)

    fireEvent.change(await screen.findByLabelText('Desde'), { target: { value: '2027-03-10' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2027-03-01' } })
    await user.click(screen.getByRole('button', { name: 'Guardar vacaciones' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El inicio de las vacaciones no puede ser posterior al fin')
    expect(api.patch).not.toHaveBeenCalled()
  })

  it('muestra el mensaje del servidor si rechaza las fechas', async () => {
    vi.mocked(api.patch).mockRejectedValue(apiError(400, { error: 'El inicio de las vacaciones no puede ser posterior al fin', code: 'VALIDATION_ERROR' }))
    const user = userEvent.setup()
    render(<VacationSection />)

    fireEvent.change(await screen.findByLabelText('Desde'), { target: { value: '2027-03-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2027-03-10' } })
    await user.click(screen.getByRole('button', { name: 'Guardar vacaciones' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El inicio de las vacaciones no puede ser posterior al fin')
  })

  it('«Quitar vacaciones» las borra con null', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { profile: { vacationFrom: '2027-01-10', vacationTo: '2027-01-24' } } } as never)
    const user = userEvent.setup()
    render(<VacationSection />)

    await user.click(await screen.findByRole('button', { name: 'Quitar vacaciones' }))

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/api/professional/profile', { vacationFrom: null, vacationTo: null }))
    expect(screen.getByLabelText('Desde')).toHaveValue('')
  })
})
