import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { BALANCE_METHOD_LABEL, suggestedBalance, type BalanceMethod, type BalancePaymentInfo } from '@/shared/utils/balancePayment'

interface Props {
  servicePrice:   number
  depositAmount?: number
  paymentStatus?: string
  status?:        string
  balancePayment?: BalancePaymentInfo | null
  // Devuelve el mensaje de error del servidor, o null si salió bien.
  onRegister:     (data: { method: BalanceMethod; amount: number }) => Promise<string | null>
}

// «Registrar cobro» en el local: la usan el administrador y la profesional (en sus turnos). Elige la forma de pago,
// propone lo que falta cobrar y muestra tal cual el mensaje del servidor si rechaza el cobro.
export function BalancePaymentForm(props: Props) {
  const { servicePrice, depositAmount, paymentStatus, status, balancePayment, onRegister } = props
  const suggested = suggestedBalance({ servicePrice, depositAmount, paymentStatus, balancePayment })
  const [method, setMethod] = useState<BalanceMethod>('cash')
  const [amount, setAmount] = useState(suggested)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  if (paymentStatus === 'paid') {
    return (
      <p style={{ margin: 0, fontSize: '14px', color: '#000', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <DollarSign size={14} />
        {balancePayment
          ? `Saldo cobrado en el local: $${balancePayment.amount.toLocaleString('es-AR')} en ${BALANCE_METHOD_LABEL[balancePayment.method]}${balancePayment.collectedByName ? ` — registrado por ${balancePayment.collectedByName}` : ''}`
          : 'Pagado por completo'}
      </p>
    )
  }

  // No se cobra sobre un turno cancelado o no asistido (el servidor también lo rechaza).
  if (status && ['cancelled', 'cancelled_no_show', 'no_show_auto'].includes(status)) return null

  const submit = async () => {
    setSaving(true)
    setError(null)
    const err = await onRegister({ method, amount })
    setSaving(false)
    if (err) setError(err)
  }

  const fieldStyle = { background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', color: '#000', fontFamily: "'Lato', sans-serif", outline: 'none' } as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Registrar cobro del saldo (en el local)
      </label>
      {balancePayment && (
        <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
          Ya cobrado: ${balancePayment.amount.toLocaleString('es-AR')}. Falta ${suggested.toLocaleString('es-AR')}.
        </p>
      )}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select
          aria-label="Forma de pago"
          value={method}
          onChange={e => setMethod(e.target.value as BalanceMethod)}
          style={{ ...fieldStyle, flex: '1 1 130px' }}
        >
          {(Object.keys(BALANCE_METHOD_LABEL) as BalanceMethod[]).map(m => (
            <option key={m} value={m}>{BALANCE_METHOD_LABEL[m]}</option>
          ))}
        </select>
        <input
          aria-label="Monto cobrado"
          type="number"
          min={1}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          style={{ ...fieldStyle, flex: '1 1 90px' }}
        />
        <button
          type="button"
          disabled={saving || !(amount > 0)}
          onClick={submit}
          style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', background: '#069494', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: saving || !(amount > 0) ? 'not-allowed' : 'pointer', opacity: saving || !(amount > 0) ? 0.6 : 1, fontFamily: "'Lato', sans-serif" }}
        >
          {saving ? 'Guardando...' : 'Registrar cobro'}
        </button>
      </div>
      {error && <p role="alert" style={{ margin: 0, fontSize: '13px', color: '#e53935' }}>{error}</p>}
    </div>
  )
}
