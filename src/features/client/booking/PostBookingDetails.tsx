import { useState, useRef } from 'react'
import { Upload, PenLine } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'

// Categorías de servicio donde tiene sentido preguntar por un diseño de referencia
const DESIGN_CATEGORIES = ['unas', 'cabello', 'rostro']

type DesignMode = 'image' | 'text'

interface Props {
  appointmentId: string
  categoryId:    string
  onDone:        () => void
}

export function PostBookingDetails({ appointmentId, categoryId, onDone }: Props) {
  const { business } = useTenant()
  const showDesignQuestion = DESIGN_CATEGORIES.includes(categoryId)

  const [allergies, setAllergies]         = useState('')
  const [accompanied, setAccompanied]     = useState<boolean | null>(null)
  const [companionName, setCompanionName] = useState('')
  const [designMode, setDesignMode]       = useState<DesignMode>('text')
  const [designText, setDesignText]       = useState('')
  const [designImage, setDesignImage]     = useState<string | null>(null)
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!business) return null
  const { primaryColor } = business

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setDesignImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    try {
      await api.patch(`/api/client/appointments/${appointmentId}/details`, {
        allergies:       allergies.trim() || null,
        accompanied:     accompanied ?? false,
        companionName:   accompanied ? (companionName.trim() || null) : null,
        designPreference: showDesignQuestion
          ? { type: designMode, value: designMode === 'image' ? designImage : designText.trim() || null }
          : null,
      })
      onDone()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'No se pudo guardar la información. Podés continuar igual.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
        Antes de terminar...
      </h2>
      <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
        Esta información le sirve al profesional para prepararse mejor para tu turno. Es opcional.
      </p>

      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>
            ¿Tenés alguna alergia que el profesional deba saber?
          </p>
          <textarea
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            rows={2}
            placeholder="Ej: alergia a algún producto, esmalte, tinte..."
            className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
            style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
          />
        </div>

        <div>
          <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>
            ¿Vas a venir acompañado/a?
          </p>
          <div className="flex gap-2 mb-2">
            {([{ v: true, l: 'Sí' }, { v: false, l: 'No' }] as const).map(opt => (
              <button
                key={String(opt.v)}
                onClick={() => setAccompanied(opt.v)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: accompanied === opt.v ? primaryColor : '#f3f4f6',
                  color: accompanied === opt.v ? 'white' : '#555',
                  fontFamily: 'var(--font-lato)',
                }}
              >
                {opt.l}
              </button>
            ))}
          </div>
          {accompanied && (
            <input
              type="text"
              value={companionName}
              onChange={e => setCompanionName(e.target.value)}
              placeholder="¿Por quién venís acompañado/a? (opcional)"
              className="w-full px-4 py-3 rounded-xl border outline-none"
              style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
            />
          )}
        </div>

        {showDesignQuestion && (
          <div>
            <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>
              ¿Qué diseño querés hacerte?
            </p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setDesignMode('text')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: designMode === 'text' ? primaryColor : '#f3f4f6',
                  color: designMode === 'text' ? 'white' : '#555',
                  fontFamily: 'var(--font-lato)',
                }}
              >
                <PenLine size={15} /> Describirlo
              </button>
              <button
                onClick={() => setDesignMode('image')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: designMode === 'image' ? primaryColor : '#f3f4f6',
                  color: designMode === 'image' ? 'white' : '#555',
                  fontFamily: 'var(--font-lato)',
                }}
              >
                <Upload size={15} /> Subir imagen
              </button>
            </div>

            {designMode === 'text' ? (
              <textarea
                value={designText}
                onChange={e => setDesignText(e.target.value)}
                rows={3}
                placeholder="Contanos cómo te lo imaginás..."
                className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
              />
            ) : (
              <div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="hidden" />
                {designImage ? (
                  <div className="relative">
                    <img src={designImage} alt="Diseño de referencia" className="w-full max-h-56 object-cover rounded-xl" />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="mt-2 text-sm underline"
                      style={{ color: primaryColor, fontFamily: 'var(--font-lato)' }}
                    >
                      Cambiar imagen
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 text-sm"
                    style={{ borderColor: '#e5e5e5', color: '#999', fontFamily: 'var(--font-lato)' }}
                  >
                    <Upload size={22} />
                    Tocá para subir una imagen de referencia
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-center" style={{ color: '#e53935', fontFamily: 'var(--font-lato)' }}>
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
          >
            {saving ? 'Guardando...' : 'Continuar'}
          </button>
          <button
            onClick={onDone}
            disabled={saving}
            className="w-full py-2 text-sm text-center"
            style={{ color: '#999', fontFamily: 'var(--font-lato)' }}
          >
            Omitir por ahora
          </button>
        </div>
      </div>
    </div>
  )
}
