import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BalancePaymentForm } from './BalancePaymentForm'
import { suggestedBalance } from '@/shared/utils/balancePayment'

describe('suggestedBalance (monto sugerido)', () => {
  it('es el precio menos la seña paga y lo ya cobrado', () => {
    expect(suggestedBalance({ servicePrice: 10000, depositAmount: 4000, paymentStatus: 'partial' })).toBe(6000)
    expect(suggestedBalance({ servicePrice: 10000, depositAmount: 4000, paymentStatus: 'partial', balancePayment: { method: 'cash', amount: 2000 } })).toBe(4000)
  })

  it('sin seña paga se sugiere el servicio completo', () => {
    expect(suggestedBalance({ servicePrice: 8000, depositAmount: 3000, paymentStatus: 'pending' })).toBe(8000)
  })
})

describe('BalancePaymentForm (administrador y profesional)', () => {
  it('propone lo que falta, deja elegir la forma de pago y manda método y monto', async () => {
    const onRegister = vi.fn().mockResolvedValue(null)
    const user = userEvent.setup()
    render(<BalancePaymentForm servicePrice={10000} depositAmount={4000} paymentStatus="partial" status="confirmed" onRegister={onRegister} />)

    expect(screen.getByLabelText('Monto cobrado')).toHaveValue(6000)
    await user.selectOptions(screen.getByLabelText('Forma de pago'), 'card')
    await user.click(screen.getByRole('button', { name: 'Registrar cobro' }))

    expect(onRegister).toHaveBeenCalledWith({ method: 'card', amount: 6000 })
  })

  it('las cuatro formas de pago están disponibles', () => {
    render(<BalancePaymentForm servicePrice={1000} paymentStatus="pending" status="confirmed" onRegister={vi.fn()} />)
    const options = screen.getAllByRole('option').map(o => (o as HTMLOptionElement).value)
    expect(options).toEqual(['cash', 'transfer', 'card', 'other'])
  })

  it('muestra el mensaje del servidor cuando rechaza el cobro', async () => {
    const onRegister = vi.fn().mockResolvedValue('El monto supera lo que falta cobrar ($500)')
    const user = userEvent.setup()
    render(<BalancePaymentForm servicePrice={1000} paymentStatus="pending" status="confirmed" onRegister={onRegister} />)

    await user.click(screen.getByRole('button', { name: 'Registrar cobro' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El monto supera lo que falta cobrar ($500)')
  })

  it('no ofrece cobrar un turno cancelado y, si ya está pagado, muestra el cobro registrado', () => {
    const { rerender } = render(<BalancePaymentForm servicePrice={1000} paymentStatus="pending" status="cancelled" onRegister={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Registrar cobro' })).not.toBeInTheDocument()

    rerender(<BalancePaymentForm servicePrice={1000} paymentStatus="paid" status="confirmed" balancePayment={{ method: 'transfer', amount: 600, collectedByName: 'Lucía' }} onRegister={vi.fn()} />)
    expect(screen.getByText(/Saldo cobrado en el local: \$600 en Transferencia — registrado por Lucía/)).toBeInTheDocument()
  })
})
