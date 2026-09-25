import { LegalDocumentPage } from './LegalDocumentPage'

export function CancellationPolicyPage() {
  return (
    <LegalDocumentPage title="Política de Cancelación y No-Show">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>1. Cancelación dentro de Plazo</h2>
          <p>Las cancelaciones realizadas <strong>con 12 horas o más de anticipación</strong> a la hora del turno serán <strong>100% reembolsables</strong>. Se devuelve el monto total incluyendo la seña (depósito).</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>2. Cancelación Fuera de Plazo</h2>
          <p>Las cancelaciones realizadas <strong>menos de 12 horas antes</strong> del turno <strong>pierden la seña</strong> (depósito). El monto restante será reembolsado. Nota: Si cancelaste pero no pagaste, no hay reembolso.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>3. No-Show (No Asistencia)</h2>
          <p>Si no asistes al turno programado y <strong>no lo cancelaste 12 horas antes</strong>, <strong>pierdes la seña</strong> (100% de lo pagado como depósito). El profesional no está obligado a devolver dinero en este caso.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>4. Cancelación Parcial (Combos)</h2>
          <p>Si contrataste un combo (servicios simultáneos) y cancelas <strong>parcialmente</strong>, solo se anulan los servicios indicados. La seña se ajusta según los servicios remanentes.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>5. Depósitos (Seña)</h2>
          <p>La seña es un <strong>depósito obligatorio</strong> para reservar tu turno. Sirve para asegurar tu compromiso. Si cancelas con plazo, recuperas la seña + el resto. Si no cumples, la pierdes.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>6. Reprogramación</h2>
          <p>Puedes reprogramar tu turno a otra fecha/hora <strong>sin costo</strong> siempre que lo hagas <strong>con 12 horas de anticipación</strong>. Los cambios fuera de plazo pueden sujetos a disponibilidad.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>7. Cumplimiento Legal</h2>
          <p>Esta política cumple con la Ley 24.240 (Defensa del Consumidor) y regulaciones sobre comercio electrónico en Argentina. Las sumas de dinero se especifican en moneda de curso legal.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>8. Excepciones</h2>
          <p>El profesional puede aceptar excepciones (cancelación sin seña, reembolso tardío) por razones de fuerza mayor. Consulta a través de WhatsApp.</p>
        </section>
      </div>
    </LegalDocumentPage>
  )
}
