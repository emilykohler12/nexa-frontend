import { LegalDocumentPage } from './LegalDocumentPage'

export function ARCORightsPage() {
  return (
    <LegalDocumentPage title="Derechos ARCO">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>¿Qué son los Derechos ARCO?</h2>
          <p>Son derechos que te protegen según la Ley 25.326 de Protección de Datos Personales en Argentina. ARCO significa:</p>
          <ul style={{ marginLeft: '20px' }}>
            <li><strong>A</strong>cceso: Puedes solicitar qué datos personales tenemos sobre ti</li>
            <li><strong>R</strong>ectificación: Puedes corregir datos incorrectos o incompletos</li>
            <li><strong>C</strong>ancelación: Puedes solicitar que borremos tus datos</li>
            <li><strong>O</strong>posición: Puedes rechazar cómo usamos tus datos</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>1. Derecho de Acceso</h2>
          <p><strong>¿Qué es?</strong> Puedes solicitar una copia de todos tus datos personales que poseemos.</p>
          <p><strong>Cómo hacerlo:</strong> Envía un email a <strong>derechos.arco@[dominio]</strong> con el asunto "Solicitud de Acceso ARCO" e indicando tu email registrado.</p>
          <p><strong>Plazo:</strong> Responderemos en <strong>máximo 10 días hábiles</strong>.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>2. Derecho de Rectificación</h2>
          <p><strong>¿Qué es?</strong> Puedes corregir información incompleta, imprecisa o desactualizada sobre ti.</p>
          <p><strong>Datos que puedes rectificar:</strong> Nombre, email, teléfono, dirección, datos de identificación.</p>
          <p><strong>Cómo hacerlo:</strong> Accede a tu perfil y edita los datos directamente, O envía un email a derechos.arco@[dominio] especificando qué datos son incorrectos y la información correcta.</p>
          <p><strong>Plazo:</strong> Máximo <strong>5 días hábiles</strong> para confirmar la rectificación.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>3. Derecho de Cancelación (Derecho al Olvido)</h2>
          <p><strong>¿Qué es?</strong> Puedes solicitar que eliminemos tus datos personales.</p>
          <p><strong>Limitaciones:</strong> No podemos eliminar datos si:</p>
          <ul style={{ marginLeft: '20px' }}>
            <li>Existen obligaciones fiscales o legales que lo requieran (ej: historial de pagos debe guardarse 5 años)</li>
            <li>Hay transacciones pendientes o disputas</li>
            <li>Es necesario para resolver conflictos legales</li>
          </ul>
          <p><strong>¿Qué sí eliminamos?</strong> Datos innecesarios para la prestación del servicio (perfiles parciales, logs históricos).</p>
          <p><strong>Cómo hacerlo:</strong> Envía un email a derechos.arco@[dominio] con el asunto "Solicitud de Cancelación ARCO".</p>
          <p><strong>Plazo:</strong> Máximo <strong>10 días hábiles</strong>.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>4. Derecho de Oposición</h2>
          <p><strong>¿Qué es?</strong> Puedes rechazar que usemos tus datos para ciertos propósitos (marketing, análisis, etc.).</p>
          <p><strong>Ejemplos:</strong> "No quiero recibir correos promocionales", "No quiero que analicen mis compras para ofertas".</p>
          <p><strong>Cómo hacerlo:</strong> Envía un email a derechos.arco@[dominio] indicando a qué tratamiento de datos te opones.</p>
          <p><strong>Plazo:</strong> Máximo <strong>5 días hábiles</strong> para acatar la oposición.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>5. Procedimiento y Plazos</h2>
          <ul style={{ marginLeft: '20px' }}>
            <li><strong>Medio de contacto:</strong> Email a derechos.arco@[dominio]</li>
            <li><strong>Información necesaria:</strong> Tu email registrado, DNI/pasaporte para verificación</li>
            <li><strong>Respuesta:</strong> Confirmaremos recepción dentro de 24 horas</li>
            <li><strong>Resolución:</strong> Entre 5-10 días hábiles según el tipo de solicitud</li>
            <li><strong>Formato de respuesta:</strong> Por email con adjunto PDF o acceso a portal seguro</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>6. Verificación de Identidad</h2>
          <p>Para procesar tu solicitud, necesitamos verificar que eres tú. Podemos solicitar:</p>
          <ul style={{ marginLeft: '20px' }}>
            <li>Foto de tu DNI/pasaporte (se descarta después)</li>
            <li>Confirmación de dirección o teléfono registrado</li>
            <li>Respuesta a preguntas de seguridad</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>7. Recurso ante Autoridad</h2>
          <p>Si no estás conforme con nuestra respuesta, puedes presentar una queja ante la <strong>Autoridad de Protección de Datos</strong> (en Argentina, esta función puede variar según jurisdicción local).</p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>8. Sin Costo</h2>
          <p>El ejercicio de tus derechos ARCO <strong>no tiene costo</strong>. No podemos cobrarte por acceder, rectificar o cancelar tus datos.</p>
        </section>
      </div>
    </LegalDocumentPage>
  )
}
