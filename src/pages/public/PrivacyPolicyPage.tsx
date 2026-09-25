import { LegalDocumentPage } from './LegalDocumentPage'

export function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage title="Política de Privacidad">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>1. Datos que Recopilamos</h2>
          <p><strong>Registro:</strong> Nombre, email, teléfono, género (opcional), contraseña hasheada. <strong>Turnos:</strong> Servicio, profesional, fecha/hora, alergias, estado. <strong>Compras:</strong> Productos, direcciones, historial. <strong>Técnicos:</strong> IP, navegador, cookies de sesión.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>2. Propósitos</h2>
          <p>Gestionar turnos, procesar pagos, enviar notificaciones, mejorar el servicio, detectar fraude, cumplir obligaciones fiscales.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>3. Retención</h2>
          <ul style={{ marginLeft: '20px' }}>
            <li><strong>Perfil:</strong> Mientras esté activa; se anonimiza 90 días después de cancelar</li>
            <li><strong>Turnos/Compras:</strong> 5 años (obligación fiscal)</li>
            <li><strong>Logs:</strong> 30 días</li>
            <li><strong>Tokens:</strong> 15 min (access), 7 días (refresh)</li>
          </ul>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>4. Terceros</h2>
          <p><strong>Supabase/AWS us-east-1:</strong> Datos completos (base de datos). <strong>Mercado Pago:</strong> Nombre, email, monto. <strong>WhatsApp/Meta:</strong> Teléfono, mensajes. <strong>Meta (IA):</strong> Interacciones anónimas si chatbot activo.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>5. ⚠️ Transferencia Internacional (Art. 12)</h2>
          <p>Tus datos se transfieren a <strong>AWS us-east-1 (EE.UU.)</strong> y estarán sujetos a leyes estadounidenses. <strong>Al usar la plataforma, consenttes esta transferencia.</strong> Si no aceptas, no uses el servicio.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>6. Seguridad</h2>
          <p>Contraseñas hasheadas (bcrypt), JWT, HTTPS, cifrado en reposo, backups automáticos. Ningún sistema es 100% seguro.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>7. Derechos ARCO</h2>
          <p>Tienes derecho a Acceso, Rectificación, Cancelación y Oposición. Ver <a href="/derechos-arco" style={{ color: '#069494' }}>Procedimiento ARCO</a>.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>8. Cookies</h2>
          <p>Ver <a href="/politica-cookies" style={{ color: '#069494' }}>Política de Cookies</a>.</p>
        </section>
      </div>
    </LegalDocumentPage>
  )
}
