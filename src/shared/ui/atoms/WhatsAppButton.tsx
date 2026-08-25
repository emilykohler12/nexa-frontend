import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { useTenant } from '@/features/tenant/TenantContext'

export function WhatsAppButton() {
  const { business } = useTenant()

  if (!business) return null

  return (
    <motion.a
      href={`https://wa.me/${business.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center"
      animate={{ y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    >
      <div className="relative">
        <span className="absolute inset-0 rounded-full bg-green-500 blur-xl opacity-60 animate-pulse" />
        <div className="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-all duration-300">
          <FaWhatsapp size={28} />
        </div>
      </div>
    </motion.a>
  )
}