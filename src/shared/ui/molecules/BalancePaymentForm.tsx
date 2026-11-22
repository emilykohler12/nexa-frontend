import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { BALANCE_METHOD_LABEL, suggestedBalance, type BalanceMethod, type BalancePaymentInfo } from '@/shared/utils/balancePayment'

interface Props {
  servicePrice:   number
  depositAmount?: number
  paymentStatus?: string
  status?:        string
  balancePayment?: BalancePaymentInfo | null
  // «Registrado por X»: lo ve el administrador; la profesional solo ve sus propios turnos y no hace falta decírselo.
  showCollector?: boolean
  // Devuelve el mensaje de error del servidor, o null si salió bien. `replace` = corregir lo ya cobrado (el monto reemplaza
  // al total cobrado y puede ser más o menos de lo que faltaba).
  onRegister:     (data: { method: BalanceMethod; amount: number; replace?: boolean }) => Promise<string | null>
}

// «Registrar cobro» en el local: la usan el administrador (cualquier turno) y la profesional (solo los suyos). Elige la forma
// de pago, propone lo que falta cobrar y muestra tal cual el mensaje del servidor si rechaza el cobro. Una vez cobrado se
// puede «Corregir monto» (por si fue más o menos).
export function BalancePaymentForm(props: Props) {
  const { servicePrice, depositAmount, paymentStatus, status, balancePayment, showCollector = true, onRegister } = props
  const suggested = suggestedBalance({ servicePrice, depositAmount, paymentStatus, balancePayment })
  const [correcting, setCorrecting] = useState(false)
  const [method, setMethod] = useState<BalanceMethod>('cash')
  const [amount, setAmount] = useState(suggested)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const fieldStyle = { background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', color: '#000', fontFamily: "'Lato', sans-serif", outline: 'none' } as const
  const linkBtn = { background: 'none', border: 'none', padding: 0, color: '#069494', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'Lato', sans-serif" } as const

  const cancelled = !!status && ['cancelled', 'cancelled_no_show', 'no_show_auto'].includes(status)

  const startCorrecting = () => {
    if (!balancePayment) return
    setMethod(balancePayment.method)
    setAmount(balancePayment.amount)
    setError(null)
    setCorrecting(true)
  }

  const submit = async (replace: boolean) => {
    setSaving(true)
    setError(null)
    const err = await onRegister(replace ? { method, amount, replace: true } : { method, amount })
    setSaving(false)
    if (err) { setError(err); return }
    if (replace) setCorrecting(false)
  }

  const form = (replace: boolean) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {replace ? 'Corregir lo cobrado en el local' : 'Registrar cobro del saldo (en el local)'}
      </label>
      {!replace && balancePayment && (
        <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
          Ya cobrado: ${balancePayment.amount.toLocaleString('es-AR')}. Falta ${suggested.toLocaleString('es-AR')}.
        </p>
      )}
      {replace && (
        <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
          Escribí el total que se cobró en el local, sea más o menos de lo que correspondía.
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
          onClick={() => submit(replace)}
          style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', background: '#069494', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: saving || !(amount > 0) ? 'not-allowed' : 'pointer', opacity: saving || !(amount > 0) ? 0.6 : 1, fontFamily: "'Lato', sans-serif" }}
        >
          {saving ? 'Guardando...' : replace ? 'Guardar monto' : 'Registrar cobro'}
        </button>
        {replace && (
          <button type="button" onClick={() => { setCorrecting(false); setError(null) }} disabled={saving} style={{ ...fieldStyle, cursor: 'pointer', fontWeight: 600 }}>
            Cancelar
          </button>
        )}
      </div>
      {error && <p role="alert" style={{ margin: 0, fontSize: '13px', color: '#e53935' }}>{error}</p>}
    </div>
  )

  if (correcting && balancePayment && !cancelled) return form(true)

  if (paymentStatus === 'paid') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#000', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <DollarSign size={14} />
          {balancePayment
            ? `Saldo cobrado en el local: $${balancePayment.amount.toLocaleString('es-AR')} en ${BALANCE_METHOD_LABEL[balancePayment.method]}${showCollector && balancePayment.collectedByName ? ` — registrado por ${balancePayment.collectedByName}` : ''}`
            : 'Pagado por completo'}
        </p>
        {balancePayment && !cancelled && (
          <button type="button" onClick={startCorrecting} style={{ ...linkBtn, alignSelf: 'flex-start' }}>Corregir monto</button>
        )}
      </div>
    )
  }

  // No se cobra sobre un turno cancelado o no asistido (el servidor también lo rechaza).
  if (cancelled) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {form(false)}
      {balancePayment && (
        <button type="button" onClick={startCorrecting} style={{ ...linkBtn, alignSelf: 'flex-start' }}>Corregir monto ya cobrado</button>
      )}
    </div>
  )
}
