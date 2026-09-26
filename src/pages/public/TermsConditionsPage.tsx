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
            <li>Cumplir con los plazos de cancelación detallados en la sección 4</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>4. Política de Cancelación y No-Show</h2>
          <p>Las cancelaciones de turnos deben realizarse con <strong>12 horas de anticipación</strong>. Las cancelaciones tardías o no-shows pueden resultar en la pérdida de la seña.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>4.1 Cancelación dentro de Plazo</h2>
          <p>Las cancelaciones realizadas <strong>con 12 horas o más de anticipación</strong> a la hora del turno serán <strong>100% reembolsables</strong>. Se devuelve el monto total incluyendo la seña (depósito).</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>4.2 Cancelación Fuera de Plazo</h2>
          <p>Las cancelaciones realizadas <strong>menos de 12 horas antes</strong> del turno <strong>pierden la seña</strong> (depósito). El monto restante será reembolsado. Nota: Si cancelaste pero no pagaste, no hay reembolso.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>4.3 No-Show (No Asistencia)</h2>
          <p>Si no asistes al turno programado y <strong>no lo cancelaste 12 horas antes</strong>, <strong>pierdes la seña</strong> (100% de lo pagado como depósito). El profesional no está obligado a devolver dinero en este caso.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>4.4 Cancelación Parcial (Combos)</h2>
          <p>Si contrataste un combo (servicios simultáneos) y cancelas <strong>parcialmente</strong>, solo se anulan los servicios indicados. La seña se ajusta según los servicios remanentes.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>4.5 Depósitos (Seña)</h2>
          <p>La seña es un <strong>depósito obligatorio</strong> para reservar tu turno. Sirve para asegurar tu compromiso. Si cancelas con plazo, recuperas la seña + el resto. Si no cumples, la pierdes.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>4.6 Reprogramación</h2>
          <p>Puedes reprogramar tu turno a otra fecha/hora <strong>sin costo</strong> siempre que lo hagas <strong>con 12 horas de anticipación</strong>. Los cambios fuera de plazo pueden estar sujetos a disponibilidad.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>4.7 Cumplimiento Legal</h2>
          <p>Esta política cumple con la Ley 24.240 (Defensa del Consumidor) y regulaciones sobre comercio electrónico en Argentina. Las sumas de dinero se especifican en moneda de curso legal.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>4.8 Excepciones</h2>
          <p>El profesional puede aceptar excepciones (cancelación sin seña, reembolso tardío) por razones de fuerza mayor. Consulta a través de WhatsApp.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>5. Pagos</h2>
          <p>Los pagos pueden realizarse a través de:</p>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>Mercado Pago (transferencia bancaria, tarjeta de crédito)</li>
            <li>Coordinación directa por WhatsApp</li>
          </ul>
          <p style={{ marginTop: '12px' }}>Al confirmar el pago, aceptas los términos de pago y la Política de Cancelación de la sección 4.</p>
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
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>8. Política de Cookies</h2>
          <p>Esta plataforma utiliza cookies de sesión para autenticación.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>8.1 ¿Qué son las Cookies?</h2>
          <p>Las cookies son pequeños archivos almacenados en tu dispositivo que permiten a la plataforma recordar información sobre ti entre visitas.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>8.2 Cookies que Usamos</h2>
          <p><strong>Cookies de Sesión (Obligatorias):</strong></p>
          <ul style={{ marginLeft: '20px' }}>
            <li><code>access_token</code> (JWT): Token de autenticación, válido 15 minutos</li>
            <li><code>refresh_token</code> (JWT): Token para renovar sesión, válido 7 días</li>
          </ul>
          <p style={{ marginTop: '16px' }}><strong>Cookies de SDKs Deshabilitados:</strong></p>
          <p>Aunque los botones de login de Google y Facebook han sido deshabilitados, los SDKs pueden estar presentes en el código base y pueden setear cookies propias (Google Analytics, Meta Pixel) en navegadores que los cargan. Estamos trabajando en remover estos completamente.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>8.3 Control de Cookies</h2>
          <p>Puedes controlar y eliminar cookies desde tu navegador (Chrome, Firefox, Safari, etc.). Eliminar cookies te desconectará de la plataforma.</p>
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
