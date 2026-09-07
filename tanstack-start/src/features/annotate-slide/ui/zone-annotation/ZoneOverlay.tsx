import { cn } from '@/shared/lib/utils'
import type { ZoneResponse } from '@/shared/api/admin'
import { getContainedBox, normalizeRect } from './zone-geometry'
import { SOURCE_BORDER_COLORS } from './zone-constants'

const CONTAINER_ASPECT = 16 / 9

interface ZoneOverlayProps {
  zones: ZoneResponse[]
  hoveredZoneId: string | null
  onHoverZone: (fieldId: string | null) => void
}

export function ZoneOverlay({ zones, hoveredZoneId, onHoverZone }: ZoneOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {zones.map((zone, index) => {
        const norm = normalizeRect(zone.rect, zone.slide_size)
        if (!norm) {
          return null
        }
        const slide = zone.slide_size
        const slideAspect = (slide?.w ?? 1) / (slide?.h ?? 1)
        const box = getContainedBox(slideAspect, CONTAINER_ASPECT)

        const left = (box.offsetX + norm.left * box.width) * 100
        const top = (box.offsetY + norm.top * box.height) * 100
        const width = norm.w * box.width * 100
        const height = norm.h * box.height * 100

        const isActive = hoveredZoneId === zone.field_id

        return (
          <div
            key={zone.field_id}
            className={cn(
              'pointer-events-auto absolute border-2 transition-all',
              SOURCE_BORDER_COLORS[zone.source] ?? 'border-gray-400',
              isActive ? 'z-10 bg-black/5 opacity-100' : 'opacity-60',
            )}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
            onMouseEnter={() => onHoverZone(zone.field_id)}
            onMouseLeave={() => onHoverZone(null)}
          >
            <span
              className={cn(
                'absolute -top-2.5 -left-2.5 flex h-5 w-5 items-center justify-center rounded-full border bg-background text-[10px] font-semibold',
                SOURCE_BORDER_COLORS[zone.source] ?? 'border-gray-400',
              )}
            >
              {index + 1}
            </span>
          </div>
        )
      })}
    </div>
  )
}
