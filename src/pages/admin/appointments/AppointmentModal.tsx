import { useState } from 'react';
import {
  X, Phone, Mail, User, Scissors, Clock,
  DollarSign, FileText, Calendar, ChevronDown,
  AlertCircle, Users, Image as ImageIcon, Tag,
} from 'lucide-react';
import type { Appointment, BalancePaymentMethod } from './types';
import type { Professional } from './types';

interface Props {
  appointment: Appointment | null;
  professionals: Professional[];
  onClose: () => void;
  onCancel: (id: string) => Promise<string | null>;
  onReactivate: (id: string) => Promise<string | null>;
  onSave: (updated: Appointment) => Promise<string | null>;
  onRegisterBalancePayment: (id: string, data: { method: BalancePaymentMethod; amount: number }) => Promise<string | null>;
}

const BALANCE_METHOD_LABEL: Record<BalancePaymentMethod, string> = {
  cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta', other: 'Otro',
};

const STATUS_LABELS = {
  confirmed: 'Confirmado',
  pending:   'Pendiente',
  finished:  'Realizado',
  cancelled: 'Cancelado',
  no_show:   'No asistió',
};

const STATUS_STYLES = {
  confirmed: { bg: 'rgba(6,148,148,0.1)',   color: '#069494' },
  pending:   { bg: 'rgba(212,175,55,0.15)', color: '#b8960c' },
  finished:  { bg: 'rgba(76,175,80,0.12)',  color: '#4caf50' },
  cancelled: { bg: 'rgba(229,57,53,0.1)',   color: '#e53935' },
  no_show:   { bg: 'rgba(0,0,0,0.08)',      color: '#555'    },
};

// Un turno "cancelado" por falta de pago nunca llegó a confirmarse — distinto
// de una cancelación real hecha por el cliente/staff.
function statusLabelFor(appointment: Appointment): string {
  if (appointment.status === 'cancelled' && appointment.cancelReason === 'unpaid_expired') return 'No se pagó a tiempo';
  return STATUS_LABELS[appointment.status];
}
function statusStyleFor(appointment: Appointment) {
  if (appointment.status === 'cancelled' && appointment.cancelReason === 'unpaid_expired') return { bg: 'rgba(0,0,0,0.06)', color: '#777' };
  return STATUS_STYLES[appointment.status];
}

export function AppointmentModal({
  appointment, professionals, onClose, onCancel, onReactivate, onSave, onRegisterBalancePayment,
}: Props) {
  const [editing, setEditing]             = useState(false);
  const [form, setForm]                   = useState<Appointment | null>(appointment);
  const [editDate, setEditDate]           = useState('');
  const [editTime, setEditTime]           = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [actionError, setActionError]     = useState<string | null>(null);

  if (!appointment || !form) return null;

  const startEditing = () => {
    const start = new Date(appointment.start);
    setEditDate(start.toISOString().split('T')[0]);
    setEditTime(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`);
    setEditing(true);
  };

  const prof = professionals.find(p => p.id === appointment.professionalId);
  const profColor = prof?.color ?? '#069494';

  const update = (fields: Partial<Appointment>) =>
    setForm(f => f ? { ...f, ...fields } : f);

  const handleSave = async () => {
    setSaving(true);
    setActionError(null);
    // Recalcula el inicio/fin del turno con la fecha/hora elegidas — así "Editar"
    // también sirve para reprogramar sin un flujo aparte.
    const [h, m] = editTime.split(':').map(Number);
    const newStart = new Date(`${editDate}T00:00:00`);
    newStart.setHours(h, m, 0, 0);
    const newEnd = new Date(newStart.getTime() + form.serviceDuration * 60000);
    const updated: Appointment = { ...form, start: newStart.toISOString(), end: newEnd.toISOString() };
    const error = await onSave(updated);
    setSaving(false);
    if (error) { setActionError(error); return; }
    setEditing(false);
  };
  const handleDiscard = () => { setForm(appointment); setEditing(false); setActionError(null); };
  const handleCancel = async () => {
    setSaving(true);
    setActionError(null);
    const error = await onCancel(appointment.id);
    setSaving(false);
    if (error) { setActionError(error); setConfirmCancel(false); return; }
    onClose();
  };
  const handleReactivate = async () => {
    setSaving(true);
    setActionError(null);
    const error = await onReactivate(appointment.id);
    setSaving(false);
    if (error) { setActionError(error); return; }
    onClose();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Franja de color del profesional */}
        <div style={{
          height: '5px',
          background: `linear-gradient(90deg, ${profColor}, ${profColor}99)`,
          borderRadius: '16px 16px 0 0',
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px 14px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: profColor, flexShrink: 0,
            }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', margin: 0 }}>
              Detalle del turno
            </h2>
            <span style={{
              fontSize: '12px', fontWeight: 600,
              padding: '3px 10px', borderRadius: '20px',
              background: statusStyleFor(appointment).bg,
              color: statusStyleFor(appointment).color,
            }}>
              {statusLabelFor(appointment)}
            </span>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#aaa', padding: '4px', borderRadius: '6px',
            display: 'flex', alignItems: 'center',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Fecha y hora */}
          {editing ? (
            <Section>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <EditField label="Fecha" type="date" value={editDate} onChange={setEditDate} />
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <EditField label="Hora" type="time" value={editTime} onChange={setEditTime} />
                </div>
              </div>
            </Section>
          ) : (
            <Section>
              <InfoRow icon={<Calendar size={14} />} label="Fecha">
                {formatDate(appointment.start)}
              </InfoRow>
              <InfoRow icon={<Clock size={14} />} label="Horario">
                {formatTime(appointment.start)} — {formatTime(appointment.end)}
              </InfoRow>
            </Section>
          )}

          <Divider />

          {/* Datos del cliente */}
          <SectionTitle color={profColor}>Cliente</SectionTitle>
          <Section>
            {editing ? (
              <>
                <EditField label="Nombre" value={form.clientName}
                  onChange={v => update({ clientName: v, title: v })} />
                <EditField label="Teléfono" value={form.clientPhone}
                  onChange={v => update({ clientPhone: v })} />
                <EditField label="Email" value={form.clientEmail}
                  onChange={v => update({ clientEmail: v })} />
              </>
            ) : (
              <>
                <InfoRow icon={<User size={14} />} label="Nombre">{appointment.clientName}</InfoRow>
                <InfoRow icon={<Phone size={14} />} label="Teléfono">{appointment.clientPhone}</InfoRow>
                <InfoRow icon={<Mail size={14} />} label="Email">{appointment.clientEmail}</InfoRow>
              </>
            )}
          </Section>

          {appointment.details && (
            appointment.details.allergies || appointment.details.accompanied || appointment.details.designPreference?.value ||
            appointment.details.hasOtherSalonPolish || appointment.details.isNailReconstruction || appointment.details.hairLength ||
            appointment.details.wantsExtensions || appointment.details.skinType
          ) && (
            <>
              <Divider />
              <SectionTitle color={profColor}>Info cargada por el cliente</SectionTitle>
              <Section>
                {appointment.details.allergies && (
                  <InfoRow icon={<AlertCircle size={14} color="#e53935" />} label="Alergias">
                    <span style={{ color: '#e53935' }}>{appointment.details.allergies}</span>
                  </InfoRow>
                )}
                {appointment.details.accompanied && (
                  <InfoRow icon={<Users size={14} />} label="Acompañante">
                    {appointment.details.companionName || 'Viene acompañado/a'}
                  </InfoRow>
                )}
                {appointment.details.designPreference?.value && (
                  appointment.details.designPreference.type === 'image' ? (
                    <div>
                      <InfoRow icon={<ImageIcon size={14} />} label="Diseño de referencia">imagen</InfoRow>
                      <img
                        src={appointment.details.designPreference.value}
                        alt="Diseño de referencia"
                        style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px', marginTop: '6px' }}
                      />
                    </div>
                  ) : (
                    <InfoRow icon={<FileText size={14} />} label="Diseño">{appointment.details.designPreference.value}</InfoRow>
                  )
                )}
                {appointment.details.hasOtherSalonPolish && (
                  <InfoRow icon={<AlertCircle size={14} color="#d4af37" />} label="Esmaltado previo">Tiene de otro salón para retirar</InfoRow>
                )}
                {appointment.details.isNailReconstruction && (
                  <InfoRow icon={<FileText size={14} />} label="Reconstrucción">
                    {appointment.details.nailReconstructionCount ? `${appointment.details.nailReconstructionCount} uñas` : 'Sí'}
                  </InfoRow>
                )}
                {appointment.details.hairLength && (
                  <InfoRow icon={<FileText size={14} />} label="Largo de cabello">{appointment.details.hairLength}</InfoRow>
                )}
                {appointment.details.wantsExtensions && (
                  <InfoRow icon={<FileText size={14} />} label="Extensiones">Sí</InfoRow>
                )}
                {appointment.details.skinType && (
                  <InfoRow icon={<FileText size={14} />} label="Tipo de piel">{appointment.details.skinType}</InfoRow>
                )}
              </Section>
            </>
          )}

          <Divider />

          {/* Servicio */}
          <SectionTitle color={profColor}>
            Servicio{appointment.isSimultaneous ? ' — servicios simultáneos' : ''}
          </SectionTitle>
          <Section>
            {!editing && appointment.isSimultaneous ? (
              // Combo: se listan TODOS los servicios (este + los simultáneos),
              // cada uno con su propia duración, precio y profesional.
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { appointmentId: appointment.id, serviceName: appointment.serviceName, professionalId: appointment.professionalId, professionalName: appointment.professionalName, duration: appointment.serviceDuration, price: appointment.servicePrice },
                  ...(appointment.simultaneousWith ?? []),
                ].map(leg => {
                  const legColor = professionals.find(p => p.id === leg.professionalId)?.color ?? profColor;
                  return (
                    <div key={leg.appointmentId} style={{ padding: '10px 12px', background: '#f8f8f8', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: '#111' }}>
                        <Scissors size={13} /> {leg.serviceName}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#555' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={12} /> {leg.duration} min</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><DollarSign size={12} /> ${leg.price.toLocaleString('es-AR')}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: legColor, display: 'inline-block' }} />
                          {leg.professionalName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <InfoRow icon={<Scissors size={14} />} label="Servicio">
                {appointment.serviceName}
              </InfoRow>
            )}

            {editing ? (
              <>
                <EditField label="Duración (min)" value={String(form.serviceDuration)}
                  onChange={v => update({ serviceDuration: Number(v) })} type="number" />
                <EditField label="Precio ($)" value={String(form.servicePrice)}
                  onChange={v => update({ servicePrice: Number(v) })} type="number" />
                {/* Selector de profesional */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Profesional
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={form.professionalId}
                      onChange={e => {
                        const selected = professionals.find(p => p.id === e.target.value);
                        if (selected) update({
                          professionalId: selected.id,
                          professionalName: selected.name,
                          backgroundColor: selected.color,
                          borderColor: selected.color,
                        });
                      }}
                      style={{
                        width: '100%', appearance: 'none',
                        background: '#f8f8f8', border: '1px solid #e5e5e5',
                        borderRadius: '8px', padding: '8px 32px 8px 12px',
                        fontSize: '14px', color: '#000',
                        fontFamily: "'Lato', sans-serif",
                        cursor: 'pointer', outline: 'none',
                      }}
                    >
                      {professionals.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{
                      position: 'absolute', right: '10px', top: '50%',
                      transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none',
                    }} />
                  </div>
                </div>
              </>
            ) : !appointment.isSimultaneous ? (
              // Turno normal: la lista de arriba ya cubre el caso del combo.
              <>
                <InfoRow icon={<Clock size={14} />} label="Duración">
                  {appointment.serviceDuration} min
                </InfoRow>
                <InfoRow icon={<DollarSign size={14} />} label="Precio">
                  ${appointment.servicePrice.toLocaleString('es-AR')}
                </InfoRow>
                <InfoRow icon={<User size={14} />} label="Profesional">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: profColor, display: 'inline-block',
                    }} />
                    {appointment.professionalName}
                  </span>
                </InfoRow>
              </>
            ) : null}

            {appointment.status === 'cancelled' && appointment.paymentStatus === 'refunded' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)',
                borderRadius: '10px', padding: '10px 12px', margin: '4px 0',
                fontSize: '13px', fontWeight: 700, color: '#8a6800',
              }}>
                <DollarSign size={14} />
                Seña a devolver — canceló dentro del plazo, contactalo para coordinar el reembolso.
              </div>
            )}

            {((appointment.selectedZones?.length ?? 0) > 0 || (appointment.selectedPackages?.length ?? 0) > 0) && (
              <InfoRow icon={<Tag size={14} />} label="Zonas y paquetes elegidos">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {appointment.selectedZones?.map((z, i) => (
                    <span key={`z-${i}`}>{z.name} · {z.duration} min · ${z.price.toLocaleString('es-AR')}</span>
                  ))}
                  {appointment.selectedPackages?.map((p, i) => (
                    <span key={`p-${i}`}>{p.name} (paquete) · {p.duration} min · ${p.price.toLocaleString('es-AR')}</span>
                  ))}
                </div>
              </InfoRow>
            )}
          </Section>

          {!editing && !['cancelled', 'no_show'].includes(appointment.status) && (
            <>
              <Divider />
              <SectionTitle color={profColor}>
                <DollarSign size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                Pago
              </SectionTitle>
              <Section>
                {appointment.depositAmount !== undefined && (
                  <InfoRow icon={<DollarSign size={14} />} label="Seña (Mercado Pago)">
                    ${appointment.depositAmount.toLocaleString('es-AR')} — {appointment.paymentStatus === 'pending' ? 'sin pagar' : appointment.paymentStatus === 'refunded' ? 'reembolsada' : 'pagada'}
                  </InfoRow>
                )}
                <BalancePaymentSection appointment={appointment} onRegister={onRegisterBalancePayment} />
              </Section>
            </>
          )}

          <Divider />

          {/* Observaciones del profesional */}
          <SectionTitle color={profColor}>
            <FileText size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
            Observaciones del profesional
          </SectionTitle>
          <textarea
            readOnly={!editing}
            value={form.professionalNotes ?? ''}
            onChange={e => update({ professionalNotes: e.target.value })}
            rows={3}
            placeholder="Llegó tarde, actitud, diseño realizado, notas post-turno..."
            style={{
              width: '100%', background: editing ? '#f8f8f8' : '#fafafa',
              border: '1px solid #eeeeee', borderRadius: '8px',
              padding: '10px 12px', fontSize: '14px', color: '#000',
              fontFamily: "'Lato', sans-serif",
              resize: 'vertical', outline: 'none',
              cursor: editing ? 'text' : 'default',
            }}
          />
        </div>

        {actionError && (
          <p style={{ margin: '0 24px', padding: '10px 14px', background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: '8px', color: '#e53935', fontSize: '13px', fontWeight: 600 }}>
            {actionError}
          </p>
        )}

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex', gap: '8px', justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}>
          {confirmCancel ? (
            <>
              <span style={{ fontSize: '13px', color: '#000', alignSelf: 'center', marginRight: 'auto' }}>
                ¿Confirmar cancelación?
              </span>
              <Btn onClick={() => setConfirmCancel(false)} variant="ghost">No</Btn>
              <Btn onClick={handleCancel} variant="danger" disabled={saving}>{saving ? 'Cancelando...' : 'Sí, cancelar'}</Btn>
            </>
          ) : editing ? (
            <>
              <Btn onClick={handleDiscard} variant="ghost" disabled={saving}>Descartar</Btn>
              <Btn onClick={handleSave} variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Btn>
            </>
          ) : (
            <>
              {appointment.status === 'cancelled' ? (
                <Btn onClick={handleReactivate} variant="success" disabled={saving}>{saving ? 'Reactivando...' : 'Reactivar turno'}</Btn>
              ) : (
                <Btn onClick={() => setConfirmCancel(true)} variant="danger" disabled={saving}>Cancelar turno</Btn>
              )}
              <Btn onClick={startEditing} variant="primary" disabled={saving}>Editar / reprogramar</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p style={{
      fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color, margin: 0,
      display: 'flex', alignItems: 'center', gap: '4px',
    }}>
      {children}
    </p>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: 0 }} />;
}

function InfoRow({ icon, label, children }: {
  icon: React.ReactNode; label: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
      <span style={{ color: '#069494', marginTop: '2px', flexShrink: 0 }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <span style={{ fontSize: '14px', color: '#000', fontWeight: 500 }}>
          {children}
        </span>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{
          background: '#f8f8f8', border: '1px solid #e5e5e5',
          borderRadius: '8px', padding: '8px 12px', fontSize: '14px',
          color: '#000', fontFamily: "'Lato', sans-serif",
          outline: 'none', width: '100%',
        }}
      />
    </div>
  );
}

function Btn({ children, onClick, variant, disabled }: {
  children: React.ReactNode; onClick: () => void;
  variant: 'primary' | 'ghost' | 'danger' | 'success';
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: hovered ? '#047a7a' : '#069494', color: '#fff', border: 'none' },
    ghost:   { background: hovered ? '#f0f0f0' : 'transparent', color: '#000', border: '1px solid #e5e5e5' },
    danger:  { background: hovered ? 'rgba(229,57,53,0.15)' : 'rgba(229,57,53,0.08)', color: '#e53935', border: '1px solid rgba(229,57,53,0.2)' },
    success: { background: hovered ? 'rgba(6,148,148,0.15)' : 'rgba(6,148,148,0.08)', color: '#069494', border: '1px solid rgba(6,148,148,0.25)' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles[variant], padding: '8px 16px', borderRadius: '8px',
        fontSize: '13px', fontFamily: "'Lato', sans-serif",
        fontWeight: 600, transition: 'all 0.15s ease',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function BalancePaymentSection({ appointment, onRegister }: {
  appointment: Appointment;
  onRegister:  (id: string, data: { method: BalancePaymentMethod; amount: number }) => Promise<string | null>;
}) {
  const remaining = Math.max(0, appointment.servicePrice - (appointment.depositAmount ?? 0));
  const [method, setMethod] = useState<BalancePaymentMethod>('cash');
  const [amount, setAmount] = useState(remaining || appointment.servicePrice);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  if (appointment.paymentStatus === 'paid') {
    const bp = appointment.balancePayment;
    return (
      <InfoRow icon={<DollarSign size={14} />} label="Saldo cobrado en el local">
        {bp
          ? `$${bp.amount.toLocaleString('es-AR')} en ${BALANCE_METHOD_LABEL[bp.method]}${bp.collectedByName ? ` — registrado por ${bp.collectedByName}` : ''}`
          : 'Pagado por completo'}
      </InfoRow>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Registrar cobro del saldo (en el local)
      </label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select
          value={method}
          onChange={e => setMethod(e.target.value as BalancePaymentMethod)}
          style={{ flex: '1 1 130px', background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', color: '#000', fontFamily: "'Lato', sans-serif", outline: 'none' }}
        >
          {(Object.keys(BALANCE_METHOD_LABEL) as BalancePaymentMethod[]).map(m => (
            <option key={m} value={m}>{BALANCE_METHOD_LABEL[m]}</option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          style={{ flex: '1 1 90px', background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', color: '#000', fontFamily: "'Lato', sans-serif", outline: 'none' }}
        />
        <Btn
          variant="primary"
          disabled={saving || !(amount > 0)}
          onClick={async () => {
            setSaving(true);
            setError(null);
            const err = await onRegister(appointment.id, { method, amount });
            setSaving(false);
            if (err) setError(err);
          }}
        >
          {saving ? 'Guardando...' : 'Registrar cobro'}
        </Btn>
      </div>
      {error && <p style={{ margin: 0, fontSize: '13px', color: '#e53935' }}>{error}</p>}
    </div>
  );
}