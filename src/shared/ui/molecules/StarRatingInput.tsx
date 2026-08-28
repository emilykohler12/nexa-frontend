import { useState } from 'react'
import { Star } from 'lucide-react'

interface Props {
  value:    number
  onChange: (rating: number) => void
  color:    string
  size?:    number
}

export function StarRatingInput({ value, onChange, color, size = 32 }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value

  return (
    <div className="flex items-center justify-center gap-1" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
        >
          <Star size={size} color={color} fill={n <= display ? color : 'none'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  )
}
