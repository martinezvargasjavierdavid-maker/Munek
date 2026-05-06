import { useEffect, useState } from 'react'
import { getImage } from '../app/imageStorage'

interface LocalImageProps {
  id: string
  className?: string
  alt?: string
}

export function LocalImage({ id, className, alt = '' }: LocalImageProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let currentUrl: string | null = null

    async function load() {
      try {
        const blob = await getImage(id)
        if (blob) {
          currentUrl = URL.createObjectURL(blob)
          setUrl(currentUrl)
          setError(false)
        } else {
          setError(true)
        }
      } catch (e) {
        console.error('Error loading local image:', e)
        setError(true)
      }
    }

    load()

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }
    }
  }, [id])

  if (error) {
    return (
      <div className={`${className} bg-zinc-900 flex items-center justify-center p-4 text-[10px] text-white/20 uppercase font-black text-center`}>
         Error al cargar imagen local
      </div>
    )
  }

  if (!url) {
    return <div className={`${className} bg-zinc-900 animate-pulse`} />
  }

  return <img src={url} alt={alt} className={className} />
}
