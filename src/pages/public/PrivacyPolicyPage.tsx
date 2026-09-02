// src/pages/public/PrivacyPolicyPage.tsx
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { ROUTES } from '@/app/config/routes.config'

export function PrivacyPolicyPage() {
  const navigate = useNavigate()
  const { business } = useTenant()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate(ROUTES.HOME)}
        className="flex items-center gap-2 text-sm text-gray-500 mb-8 hover:opacity-70"
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        <ArrowLeft size={16} /> Volver al inicio
      </button>

      <h1
        className="text-3xl mb-2"
        style={{ fontFamily: 'var(--font-playfair)', color: business?.primaryColor }}
      >
        Política de Privacidad
      </h1>
      <p className="text-sm text-gray-400 mb-8" style={{ fontFamily: 'var(--font-lato)' }}>
        Última actualización: 2 de septiembre de 2026.
      </p>

      <div
        className="flex flex-col gap-6 text-sm leading-relaxed text-gray-700"
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        <section>
          <h2 className="font-semibold text-base mb-2" style={{ color: '#333' }}>1. Quién trata tus datos</h2>
          <p>
            <strong>{business?.name ?? 'El negocio'}</strong> es la Responsable del tratamiento de tus datos
            personales: es quien decide para qué se usan y con quién los compartís al reservar un turno o
            comprar un producto.
          </p>
          <p className="mt-2">
            <strong>Kologic</strong> (el software Nexa) actúa como Encargada del tratamiento: presta el
            servicio técnico que almacena y procesa esos datos por cuenta del negocio, y no puede usarlos
            para un fin distinto al de operar el sistema.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2" style={{ color: '#333' }}>2. Qué datos guardamos</h2>
          <p><strong>Al registrarte:</strong> nombre, email, teléfono (opcional), género (opcional).</p>
          <p className="mt-2">
            <strong>Al reservar un turno</strong>, además de qué servicio, con qué profesional y cuándo, y
            solo con tu autorización expresa: alergias puntuales, si venís acompañado/a, y datos propios del
            servicio (tipo de piel, largo de cabello, diseño de referencia).
          </p>
          <p className="mt-2"><strong>Al comprar un producto:</strong> dirección de entrega, teléfono, forma de pago.</p>
          <p className="mt-2"><strong>Al dejar una reseña:</strong> tu puntaje y comentario.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2" style={{ color: '#333' }}>3. Para qué se usan</h2>
          <p>
            Únicamente para gestionar tu turno o compra. No se usan para publicidad de terceros ni se
            venden a nadie.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2" style={{ color: '#333' }}>4. Tus derechos</h2>
          <p>
            En cualquier momento podés pedirnos acceder a tus datos, corregirlos, o suprimirlos: si pedís la
            supresión, anonimizamos tu nombre, email y teléfono. El registro del turno en sí se conserva,
            sin datos que te identifiquen, para no romper el historial contable del negocio.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2" style={{ color: '#333' }}>5. Datos sensibles</h2>
          <p>
            Si en algún turno indicás una alergia u otra observación operativa, te pedimos tu autorización
            expresa antes de guardarla, por separado de esta política — y esa autorización queda registrada
            para cada turno donde la diste.
          </p>
        </section>
      </div>
    </div>
  )
}
