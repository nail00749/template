import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { env } from '@/shared/config/env'

interface SlidePreviewProps {
  imageUrl: string
  alt: string
  className?: string
  children?: ReactNode
}

function resolveImageUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const base = env.VITE_API_BASE_URL.replace(/\/$/, '')
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`
}

export function SlidePreview({ imageUrl, alt, className, children }: SlidePreviewProps) {
  const resolvedUrl = resolveImageUrl(imageUrl)

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden bg-muted', className)}>
      <img
        src={resolvedUrl}
        alt={alt}
        className="h-full w-full object-contain"
      />
      {children}
    </div>
  )
}
