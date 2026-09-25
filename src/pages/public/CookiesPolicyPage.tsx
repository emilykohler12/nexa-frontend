import { LegalDocumentPage } from './LegalDocumentPage'

export function CookiesPolicyPage() {
  return (
    <LegalDocumentPage title="Política de Cookies">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>¿Qué son las Cookies?</h2>
          <p>Las cookies son pequeños archivos almacenados en tu dispositivo que permiten a la plataforma recordar información sobre ti entre visitass.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>Cookies que Usamos</h2>
          <p><strong>Cookies de Sesión (Obligatorias):</strong></p>
          <ul style={{ marginLeft: '20px' }}>
            <li><code>access_token</code> (JWT): Token de autenticación, válido 15 minutos</li>
            <li><code>refresh_token</code> (JWT): Token para renovar sesión, válido 7 días</li>
          </ul>
          <p style={{ marginTop: '16px' }}><strong>Cookies de SDKs Deshabilitados:</strong></p>
          <p>Aunque los botones de login de Google y Facebook han sido deshabilitados, los SDKs pueden estar presentes en el código base y pueden setear cookies propias (Google Analytics, Meta Pixel) en navegadores que los cargan. Estamos trabajando en remover estos completamente.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>Control de Cookies</h2>
          <p>Puedes controlar y eliminar cookies desde tu navegador (Chrome, Firefox, Safari, etc.). Eliminar cookies te desconectará de la plataforma.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', marginBottom: '12px' }}>Cambios</h2>
          <p>Esta política se puede actualizar. Los cambios entran en vigencia inmediatamente.</p>
        </section>
      </div>
    </LegalDocumentPage>
  )
}
