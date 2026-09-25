import { LegalDocumentPage } from './LegalDocumentPage'

export function TermsConditionsPage() {
  return (
    <LegalDocumentPage title="Términos y Condiciones">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>1. Aceptación de Términos</h2>
          <p>Al acceder y utilizar esta plataforma, aceptas estar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna de las disposiciones, no debes utilizar el servicio.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>2. Descripción del Servicio</h2>
          <p>Esta plataforma permite a clientes:</p>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>Reservar turnos de servicios profesionales</li>
            <li>Comprar productos</li>
            <li>Coordinar pagos y entregas</li>
            <li>Comunicarse con profesionales a través de WhatsApp</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>3. Responsabilidades del Usuario</h2>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>Proporcionar información correcta y completa al registrarse</li>
            <li>Mantener la confidencialidad de tu contraseña</li>
            <li>No utilizar la plataforma para actividades ilícitas o fraudulentas</li>
            <li>Cumplir con los plazos de cancelación según la Política de Cancelación</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>4. Política de Cancelación</h2>
          <p>Las cancelaciones de turnos deben realizarse con <strong>12 horas de anticipación</strong>. Las cancelaciones tardías o no-shows pueden resultar en la pérdida de la seña. Consulta nuestra Política de Cancelación para más detalles.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>5. Pagos</h2>
          <p>Los pagos pueden realizarse a través de:</p>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>Mercado Pago (transferencia bancaria, tarjeta de crédito)</li>
            <li>Coordinación directa por WhatsApp</li>
          </ul>
          <p style={{ marginTop: '12px' }}>Al confirmar el pago, aceptas los términos de pago y la Política de Cancelación.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>6. Limitación de Responsabilidad</h2>
          <p>La plataforma se proporciona "tal como está". El propietario del negocio no es responsable por:</p>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>Interrupciones del servicio por razones técnicas o de mantenimiento</li>
            <li>Daños indirectos derivados del uso de la plataforma</li>
            <li>Pérdida de datos o información personal (ver Política de Privacidad)</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>7. Privacidad y Datos Personales</h2>
          <p>El tratamiento de tus datos personales se rige por nuestra Política de Privacidad. Al utilizar este servicio, aceptas que tus datos sean recopilados, almacenados y procesados según lo descrito en dicha política.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>8. Cookies</h2>
          <p>Esta plataforma utiliza cookies de sesión para autenticación. Consulta nuestra Política de Cookies para más información.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>9. Modificación de Términos</h2>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia inmediatamente al ser publicados. Tu uso continuado de la plataforma implica aceptación de los términos modificados.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>10. Contacto</h2>
          <p>Para consultas sobre estos términos, contáctanos a través de WhatsApp o el formulario de contacto en el sitio web.</p>
        </section>

      </div>
    </LegalDocumentPage>
  )
}
