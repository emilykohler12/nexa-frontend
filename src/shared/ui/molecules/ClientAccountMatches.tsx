// Debajo del nombre en el turno manual: si ya hay una cuenta de la clienta se ofrece elegirla; si no, avisa que se va a
// crear una nueva. Al elegirla, el formulario completa nombre, teléfono y correo, y el turno queda en SU cuenta.
import { UserCheck, UserPlus } from 'lucide-react'

export interface ClientMatch { id: string; name: string; email: string; phone: string }

interface Props {
  matches:  ClientMatch[]
  // El texto ya se buscó (no mostrar «no hay cuenta» mientras todavía se busca).
  searched: boolean
  selected: ClientMatch | null
  onSelect: (client: ClientMatch) => void
  onClear:  () => void
}

export function ClientAccountMatches({ matches, searched, selected, onSelect, onClear }: Props) {
  if (selected) {
    return (
      <div role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 12px', background: 'rgba(6,148,148,0.08)', border: '1px solid rgba(6,148,148,0.25)', borderRadius: '8px', fontSize: '13px', color: '#000' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={14} color="#069494" /> Cuenta existente: <strong>{selected.name}</strong> · {selected.email}
        </span>
        <button type="button" onClick={onClear} style={{ background: 'transparent', border: 'none', color: '#069494', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}>
          Quitar
        </button>
      </div>
    )
  }
  if (matches.length > 0) {
    return (
      <div role="listbox" aria-label="Cuentas de clientas existentes" style={{ border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
        <p style={{ margin: 0, padding: '6px 12px', fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#fafafa' }}>
          Ya tiene cuenta — tocá para elegirla
        </p>
        {matches.map(m => (
          <button
            key={m.id}
            type="button"
            role="option"
            aria-selected={false}
            onClick={() => onSelect(m)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', padding: '8px 12px', border: 'none', borderTop: '1px solid #f0f0f0', background: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: "'Lato', sans-serif" }}
          >
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>{m.name}</span>
            <span style={{ fontSize: '12px', color: '#555' }}>{m.email}{m.phone ? ` · ${m.phone}` : ''}</span>
          </button>
        ))}
      </div>
    )
  }
  if (searched) {
    return (
      <p style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#444' }}>
        <UserPlus size={14} /> No hay una cuenta con ese nombre: se va a crear una nueva con estos datos.
      </p>
    )
  }
  return null
}
