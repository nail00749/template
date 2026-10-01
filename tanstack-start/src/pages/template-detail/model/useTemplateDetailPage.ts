import type { MouseEvent } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useIntlayer } from 'react-intlayer'
import { templateQueries } from '@/entities/template'
import type { TemplateSlideResponse } from '@/shared/api/admin'
import { useDeleteSlide } from '@/features/delete-slide'
import { EditTemplateDialog } from '@/features/edit-template'
import { ReuploadPptxDialog } from '@/features/reupload-template'
import { SlideZonesDialog } from '@/features/annotate-slide'
import { useDialog } from '@/shared/ui/dialog-provider'
import { ConfirmDialog } from '@/shared/ui/dialog-provider/ConfirmDialog'

export function useTemplateDetailPage(templateId: string) {
  const content = useIntlayer('template-detail-page')
  const { data: template } = useSuspenseQuery(templateQueries.templateDetail(templateId))
  const dialog = useDialog()
  const deleteSlideMutation = useDeleteSlide({ templateId })

  const slides = template?.slides.sort((a, b) => a.slide_number - b.slide_number) ?? []

  const handleOpenReupload = () => {
    dialog.open(ReuploadPptxDialog, `reupload-pptx-${templateId}`, {
      templateId,
      templateName: template?.name ?? '',
    })
  }

  const handleOpenEdit = () => {
    dialog.open(EditTemplateDialog, `edit-template-${templateId}`, {
      templateId,
      initialName: template?.name ?? '',
      initialMaxCapacityChars: template?.max_capacity_chars ?? 0,
    })
  }

  const handleOpenZones = (slide: TemplateSlideResponse) => {
    dialog.open(SlideZonesDialog, `zones-${slide.id}`, {
      templateId: template.id,
      slide,
    })
  }

  const handleDelete = (slide: TemplateSlideResponse) => {
    dialog.open(ConfirmDialog, `delete-slide-${slide.slide_number}`, {
      title: content.deleteSlide.value,
      description: `${content.deleteSlidePrompt.value} ${slide.slide_number}?`,
      confirmLabel: content.delete.value,
      onConfirm: async () => {
        await deleteSlideMutation.mutateAsync({
          templateId,
          slideNumber: slide.slide_number,
          params: { hard: true },
        })
      },
    })
  }

  const handleDeleteClick = (event: MouseEvent, slide: TemplateSlideResponse) => {
    event.stopPropagation()
    handleDelete(slide)
  }

  return {
    handleDeleteClick,
    handleOpenEdit,
    handleOpenReupload,
    handleOpenZones,
    isEmpty: slides.length === 0,
    slides,
    template,
  }
}
