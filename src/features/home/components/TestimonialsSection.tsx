import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTenant } from '@/features/tenant/TenantContext'

export function TestimonialsSection() {
  const { business } = useTenant()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!business || business.testimonials.length === 0) return
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % business.testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [business])

  if (!business || business.testimonials.length === 0) return null

  const current = business.testimonials[index]

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
          key={index}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white text-black p-6 rounded-xl shadow max-w-md mx-auto"
        >
          <h4 className="font-semibold">{current.name}</h4>
          <p className="text-yellow-500">{'⭐'.repeat(current.stars)}</p>
          <p className="text-sm text-gray-600 mt-2">{current.comment}</p>
        </motion.div>
      </div>
    </section>
  )
}