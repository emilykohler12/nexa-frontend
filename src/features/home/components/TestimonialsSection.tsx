import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'

interface PublicReview {
  id:         string
  clientName: string
  rating:     number
  message:    string
}

export function TestimonialsSection() {
  const { business } = useTenant()
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [index, setIndex]     = useState(0)

  useEffect(() => {
    api.get<{ reviews: PublicReview[] }>('/api/reviews/public')
      // Defensivo: una reseña sin comentario no tiene nada para mostrar acá
      // (el promedio de estrellas ya se ve aparte, en la sección dorada).
      .then(res => setReviews((res.data.reviews ?? []).filter(r => r.message?.trim())))
      .catch(() => setReviews([]))
  }, [])

  useEffect(() => {
    if (reviews.length === 0) return
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [reviews])

  if (!business || reviews.length === 0) return null

  const current = reviews[index]

  return (
    <section
      className="py-12 px-6 text-white"
      style={{ backgroundColor: business.primaryColor }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-2xl mb-8"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Opiniones de clientes
        </h2>
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white text-black p-6 rounded-xl shadow max-w-md mx-auto"
        >
          <h4 className="font-semibold">{current.clientName}</h4>
          <p className="text-yellow-500">{'⭐'.repeat(current.rating)}</p>
          <p className="text-sm text-gray-600 mt-2">{current.message}</p>
        </motion.div>
      </div>
    </section>
  )
}
