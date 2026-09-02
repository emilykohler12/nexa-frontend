import { useState, useRef } from 'react'
import { Upload, PenLine } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

// Categorías de servicio donde tiene sentido preguntar por un diseño de referencia
const DESIGN_CATEGORIES = ['unas', 'cabello', 'rostro']

const HAIR_LENGTH_OPTIONS = ['Corto', 'Media melena', 'Largo']
const SKIN_TYPE_OPTIONS = ['Normal', 'Seca', 'Grasa', 'Mixta', 'Sensible']

type DesignMode = 'image' | 'text'

export interface AppointmentDetailsValue {
  allergies:        string | null
  accompanied:      boolean
  companionName:    string | null
  designPreference: { type: DesignMode; value: string | null } | null
  // Uñas
  hasOtherSalonPolish:     boolean | null
  isNailReconstruction:    boolean | null
  nailReconstructionCount: number | null
  // Cabello
  hairLength:      string | null
  wantsExtensions: boolean | null
  // Rostro
  skinType: string | null
}

interface Props {
  appointmentId: string
  categoryId:    string
  initial?:      AppointmentDetailsValue | null
  editMode?:     boolean
  onDone:        (value: AppointmentDetailsValue) => void
  onCancel?:     () => void
}

export function PostBookingDetails({ appointmentId, categoryId, initial, editMode, onDone, onCancel }: Props) {
  const { business } = useTenant()
  const showDesignQuestion = DESIGN_CATEGORIES.includes(categoryId)
  const isNails  = categoryId === 'unas'
  const isHair   = categoryId === 'cabello'
  const isFace   = categoryId === 'rostro'

  const [allergies, setAllergies]         = useState(initial?.allergies ?? '')
  const [accompanied, setAccompanied]     = useState<boolean | null>(initial?.accompanied ?? null)
  const [companionName, setCompanionName] = useState(initial?.companionName ?? '')
  const [designMode, setDesignMode]       = useState<DesignMode>(initial?.designPreference?.type ?? 'text')
  const [designText, setDesignText]       = useState(initial?.designPreference?.type === 'text' ? initial.designPreference.value ?? '' : '')
  const [designImage, setDesignImage]     = useState<string | null>(initial?.designPreference?.type === 'image' ? initial.designPreference.value : null)

  const [hasOtherSalonPolish, setHasOtherSalonPolish]         = useState<boolean | null>(initial?.hasOtherSalonPolish ?? null)
  const [isNailReconstruction, setIsNailReconstruction]       = useState<boolean | null>(initial?.isNailReconstruction ?? null)
  const [nailReconstructionCount, setNailReconstructionCount] = useState(initial?.nailReconstructionCount ? String(initial.nailReconstructionCount) : '')
  const [hairLength, setHairLength]           = useState<string | null>(initial?.hairLength ?? null)
  const [wantsExtensions, setWantsExtensions] = useState<boolean | null>(initial?.wantsExtensions ?? null)
  const [skinType, setSkinType]               = useState<string | null>(initial?.skinType ?? null)

  const [consentAlertas, setConsentAlertas] = useState(false)
  const [consentError, setConsentError]     = useState(false)
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
    if (!consentAlertas) {
      setConsentError(true)
      return
    }
    setConsentError(false)
    setSaving(true)
    setError(null)
    const payload: AppointmentDetailsValue = {
      allergies:       allergies.trim() || null,
      accompanied:     accompanied ?? false,
      companionName:   accompanied ? (companionName.trim() || null) : null,
      designPreference: showDesignQuestion
        ? { type: designMode, value: designMode === 'image' ? designImage : designText.trim() || null }
        : null,
      hasOtherSalonPolish:     isNails ? hasOtherSalonPolish : null,
      isNailReconstruction:    isNails ? isNailReconstruction : null,
      nailReconstructionCount: isNails && isNailReconstruction && nailReconstructionCount
        ? Number(nailReconstructionCount) : null,
      hairLength:      isHair ? hairLength : null,
      wantsExtensions: isHair ? wantsExtensions : null,
      skinType:        isFace ? skinType : null,
    }
    try {
      await api.patch(`/api/client/appointments/${appointmentId}/details`, { ...payload, consentAlertas: true })
      onDone(payload)
    } catch (err: any) {
      setError(safeErrorMessage(err, (editMode ? 'No se pudo guardar la información.' : 'No se pudo guardar la información. Podés continuar igual.')))
      if (!editMode) onDone(payload)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
        {editMode ? 'Editar información del turno' : 'Antes de terminar...'}
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
          {/* RF-06.02 — consentimiento para guardar observaciones operativas */}
          <label className="flex items-start gap-2 mt-2 text-xs cursor-pointer" style={{ fontFamily: 'var(--font-lato)' }}>
            <input
              type="checkbox"
              checked={consentAlertas}
              onChange={e => { setConsentAlertas(e.target.checked); if (e.target.checked) setConsentError(false) }}
              className="mt-0.5"
            />
            <span style={{ color: '#777' }}>
              Autorizo a {business.name} a guardar estas observaciones operativas únicamente para la realización del servicio.
            </span>
          </label>
          {consentError && (
            <p className="text-xs mt-1" style={{ color: '#e53935' }}>
              Necesitamos tu autorización para guardar esta información.
            </p>
          )}
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

        {isNails && (
          <>
            <div>
              <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>
                ¿Tenés esmaltado de otro salón que la profesional deba retirar?
              </p>
              <div className="flex gap-2">
                {([{ v: true, l: 'Sí' }, { v: false, l: 'No' }] as const).map(opt => (
                  <button
                    key={String(opt.v)}
                    onClick={() => setHasOtherSalonPolish(opt.v)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: hasOtherSalonPolish === opt.v ? primaryColor : '#f3f4f6',
                      color: hasOtherSalonPolish === opt.v ? 'white' : '#555',
                      fontFamily: 'var(--font-lato)',
                    }}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>
                ¿Es reconstrucción de uñas?
              </p>
              <div className="flex gap-2 mb-2">
                {([{ v: true, l: 'Sí' }, { v: false, l: 'No' }] as const).map(opt => (
                  <button
                    key={String(opt.v)}
                    onClick={() => setIsNailReconstruction(opt.v)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: isNailReconstruction === opt.v ? primaryColor : '#f3f4f6',
                      color: isNailReconstruction === opt.v ? 'white' : '#555',
                      fontFamily: 'var(--font-lato)',
                    }}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
              {isNailReconstruction && (
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={nailReconstructionCount}
                  onChange={e => setNailReconstructionCount(e.target.value)}
                  placeholder="¿Cuántas uñas?"
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                  style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
                />
              )}
            </div>
          </>
        )}

        {isHair && (
          <>
            <div>
              <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>
                Largo del cabello
              </p>
              <div className="flex gap-2">
                {HAIR_LENGTH_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setHairLength(opt)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: hairLength === opt ? primaryColor : '#f3f4f6',
                      color: hairLength === opt ? 'white' : '#555',
                      fontFamily: 'var(--font-lato)',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>
                ¿Querés extensiones?
              </p>
              <div className="flex gap-2">
                {([{ v: true, l: 'Sí' }, { v: false, l: 'No' }] as const).map(opt => (
                  <button
                    key={String(opt.v)}
                    onClick={() => setWantsExtensions(opt.v)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: wantsExtensions === opt.v ? primaryColor : '#f3f4f6',
                      color: wantsExtensions === opt.v ? 'white' : '#555',
                      fontFamily: 'var(--font-lato)',
                    }}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {isFace && (
          <div>
            <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>
              Tipo de piel
            </p>
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSkinType(opt)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: skinType === opt ? primaryColor : '#f3f4f6',
                    color: skinType === opt ? 'white' : '#555',
                    fontFamily: 'var(--font-lato)',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

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
            {saving ? 'Guardando...' : editMode ? 'Guardar cambios' : 'Continuar'}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={saving}
              className="w-full py-2 text-sm text-center"
              style={{ color: '#999', fontFamily: 'var(--font-lato)' }}
            >
              {editMode ? 'Cancelar' : 'Omitir por ahora'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
