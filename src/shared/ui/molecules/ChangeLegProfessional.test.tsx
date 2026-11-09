import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangeLegProfessional } from './ChangeLegProfessional'

const options = [{ id: 'p1', name: 'Lucía' }, { id: 'p2', name: 'Marina' }, { id: 'p3', name: 'Sol' }]

describe('ChangeLegProfessional (combos)', () => {
  it('ofrece las otras profesionales (no la actual) y manda la elegida', async () => {
    const onChange = vi.fn().mockResolvedValue(null)
    const user = userEvent.setup()
    render(<ChangeLegProfessional currentId="p1" options={options} onChange={onChange} />)

    const names = screen.getAllByRole('option').map(o => o.textContent)
    expect(names).toEqual(['Cambiar profesional…', 'Marina', 'Sol'])
    expect(screen.getByRole('button', { name: 'Cambiar' })).toBeDisabled()

    await user.selectOptions(screen.getByLabelText('Nueva profesional'), 'p3')
    await user.click(screen.getByRole('button', { name: 'Cambiar' }))

    expect(onChange).toHaveBeenCalledWith('p3')
  })

  it('muestra el mensaje del servidor si rechaza el cambio', async () => {
    const onChange = vi.fn().mockResolvedValue('Esa profesional no realiza este servicio')
    const user = userEvent.setup()
    render(<ChangeLegProfessional currentId="p1" options={options} onChange={onChange} />)

    await user.selectOptions(screen.getByLabelText('Nueva profesional'), 'p2')
    await user.click(screen.getByRole('button', { name: 'Cambiar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Esa profesional no realiza este servicio')
  })
})
