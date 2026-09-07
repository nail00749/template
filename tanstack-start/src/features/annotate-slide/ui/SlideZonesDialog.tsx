import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SlidePreview } from '@/entities/template'
import { getChangesStatusLabel, getSlideLabel } from './slideZonesPresentation'
import { ZoneCard } from './zone-annotation/ZoneCard'
import { ZoneOverlay } from './zone-annotation/ZoneOverlay'
import type { DialogProps } from '@/shared/ui/dialog-provider'
import type { FieldType, TemplateSlideResponse, ZoneResponse } from '@/shared/api/admin'
import { templateKeys } from '@/entities/template'
import { templateMutations, templateQueries } from '@/entities/template'
import { cn, getMessageFromError } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Spinner } from '@/shared/ui/spinner'

interface SlideZonesDialogProps {
  templateId: string
  slide: TemplateSlideResponse
}

interface SlideZonesGroup {
  slide_number: number
  zones: ZoneResponse[]
}

function isSlideZonesGroup(value: unknown): value is SlideZonesGroup {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return (
    'slide_number' in value &&
    typeof value.slide_number === 'number' &&
    'zones' in value &&
    Array.isArray(value.zones)
  )
}

function extractZonesForSlide(
  data: ZoneResponse[] | SlideZonesGroup[] | undefined,
  slideNumber: number,
): ZoneResponse[] {
  if (!data || data.length === 0) {
    return []
  }
  if (data.every(isSlideZonesGroup)) {
    const group = data.find((g) => g.slide_number === slideNumber)
    return group?.zones ?? []
  }
  return data.filter((item): item is ZoneResponse => !isSlideZonesGroup(item))
}

export function SlideZonesDialog({
  templateId,
  slide,
  onClose,
}: DialogProps<SlideZonesDialogProps>) {
  const queryClient = useQueryClient()

  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null)

  const {
    data: zonesPayload,
    isLoading,
    error,
  } = useQuery(templateQueries.templateZones(templateId))

  const slideZones = useMemo(
    () => extractZonesForSlide(zonesPayload, slide.slide_number),
    [zonesPayload, slide.slide_number],
  )

  const [baseline, setBaseline] = useState<Record<string, FieldType>>({})

  const [overrides, setOverrides] = useState<Record<string, FieldType>>({})

  useEffect(() => {
    const next: Record<string, FieldType> = {}
    for (const zone of slideZones) {
      if (zone.field_id) {
        next[zone.field_id] = zone.field_type
      }
    }
    setBaseline(next)
    setOverrides({})
  }, [slideZones])

  const mutation = useMutation({
    ...templateMutations.writeTemplateAnnotations(templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: templateKeys.templateAnnotations(templateId),
      })
      void queryClient.invalidateQueries({
        queryKey: templateKeys.templateZones(templateId),
      })
      toast.success('Аннотации сохранены')
      onClose()
    },
    onError: () => {
      setOverrides({})
    },
  })

  const handleSave = () => {
    if (Object.keys(overrides).length === 0) {
      onClose()
      return
    }
    void mutation.mutateAsync({ overrides: { ...baseline, ...overrides } })
  }

  const handleChange = (fieldId: string, fieldType: FieldType) => {
    setOverrides((prev) => ({ ...prev, [fieldId]: fieldType }))
  }

  const hasChanges = Object.keys(overrides).length > 0 && slideZones.length > 0

  const renderZones = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <Spinner />
        </div>
      )
    }
    if (error) {
      return (
        <div className="flex h-64 items-center justify-center text-destructive">
          Ошибка загрузки: {getMessageFromError(error)}
        </div>
      )
    }
    if (slideZones.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Зоны не найдены
        </div>
      )
    }
    return (
      <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 pr-3">
        <div className="space-y-2 p-3">
          {slideZones.map((zone, index) => (
            <ZoneCard
              key={zone.field_id}
              zone={zone}
              index={index}
              isActive={hoveredZoneId === zone.field_id}
              onHover={setHoveredZoneId}
              value={overrides[zone.field_id] ?? baseline[zone.field_id] ?? zone.field_type}
              onChange={(fieldType) => handleChange(zone.field_id, fieldType)}
            />
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] p-0 sm:max-w-4xl">
      <div className="flex flex-col gap-0">
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle>Разметка зон шаблона</DialogTitle>
            <DialogDescription>
              Настройте типы полей для автоматического заполнения. Зоны показаны для всех слайдов
              шаблона.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-6 px-6 pb-6 sm:flex-row">
          <div className="flex shrink-0 flex-col gap-2 sm:w-[45%]">
            {slide.preview_url && (
              <SlidePreview
                imageUrl={slide.preview_url}
                alt={getSlideLabel(slide.slide_number)}
                className="rounded-lg border bg-muted"
              >
                <ZoneOverlay
                  zones={slideZones}
                  hoveredZoneId={hoveredZoneId}
                  onHoverZone={setHoveredZoneId}
                />
              </SlidePreview>
            )}
            <p className="text-center text-sm text-muted-foreground">
              {getSlideLabel(slide.slide_number)}
            </p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">{renderZones()}</div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t px-6 py-4">
          <span className={cn('text-sm', hasChanges ? 'text-foreground' : 'text-muted-foreground')}>
            {getChangesStatusLabel(hasChanges)}
          </span>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              loading={mutation.isPending}
              disabled={!hasChanges}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </div>
      </div>
    </DialogContent>
  )
}
