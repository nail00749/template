import type { FieldType, ZoneResponse } from '@/shared/api/admin'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { FIELD_TYPE_LABELS, SOURCE_COLORS, SOURCE_LABELS } from './zone-constants'
import { normalizeRect } from './zone-geometry'

const ALL_FIELD_TYPES = Object.keys(FIELD_TYPE_LABELS) as FieldType[]

interface ZoneCardProps {
  zone: ZoneResponse
  value: FieldType
  onChange: (fieldType: FieldType) => void
  index: number
  isActive: boolean
  onHover: (fieldId: string | null) => void
}

export function ZoneCard({ zone, value, onChange, index, isActive, onHover }: ZoneCardProps) {
  const selectLabel = FIELD_TYPE_LABELS[value] ?? value
  const sourceLabel = SOURCE_LABELS[zone.source] ?? zone.source
  const sourceColor = SOURCE_COLORS[zone.source]
  const hasGeometry = normalizeRect(zone.rect, zone.slide_size) != null

  // Backend-supplied list, narrowed per zone. If missing/empty we fall back to
  // the full enum (backwards-compat for older template responses). The current
  // value is always kept in the list so legacy overrides stay visible.
  const options = Array.from(
    new Set<FieldType>([
      ...(zone.allowed_field_types?.length ? zone.allowed_field_types : ALL_FIELD_TYPES),
      value,
    ]),
  )

  return (
    <div
      data-slot="zone-card"
      data-active={isActive}
      onMouseEnter={() => onHover(zone.field_id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-card p-3 transition-shadow',
        isActive && 'ring-2 ring-primary',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold">
              {index + 1}
            </span>
            <Badge className={cn('border-transparent', sourceColor)}>{sourceLabel}</Badge>
          </div>
          {zone.placeholder_idx != null && (
            <span className="text-xs text-muted-foreground">
              Индекс плейсхолдера: {zone.placeholder_idx}
            </span>
          )}
          {!hasGeometry && <span className="text-xs text-muted-foreground">Без геометрии</span>}
        </div>
      </div>

      <Select
        value={value}
        onValueChange={(v) => {
          if (v !== null && v !== value) {
            onChange(v)
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue>{selectLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((ft) => (
            <SelectItem
              key={ft}
              value={ft}
            >
              {FIELD_TYPE_LABELS[ft] ?? ft}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
