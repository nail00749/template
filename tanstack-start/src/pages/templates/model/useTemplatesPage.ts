import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useIntlayer } from 'react-intlayer'
import type { TemplateListItemResponse } from '@/shared/api/admin'
import { templateQueries } from '@/entities/template'
import { DeleteTemplateDialog } from '@/features/delete-template'
import { EditTemplateDialog } from '@/features/edit-template'
import { UploadTemplateDialog } from '@/features/upload-template'
import { useDataGridState } from '@/shared/lib/hooks/use-data-grid-sorting'
import { useAppLocale } from '@/shared/lib/i18n'
import { useDialog } from '@/shared/ui/dialog-provider'
import { createTemplatesColumns } from '../ui/templates-table/templates-columns'

export function useTemplatesPage() {
  const content = useIntlayer('templates-page')
  const { locale } = useAppLocale()
  const grid = useDataGridState<TemplateListItemResponse>({
    initialPageSize: 10,
  })
  const dialog = useDialog()

  const {
    data: templatesResponse,
    isPending,
    isFetching,
  } = useQuery(
    templateQueries.templates({
      offset: grid.queryParams.offset,
      limit: grid.queryParams.limit,
    }),
  )

  const handleOpenUploadDialog = () => {
    dialog.open(UploadTemplateDialog, 'upload-template')
  }

  const columns = useMemo(
    () =>
      createTemplatesColumns({
        locale,
        labels: {
          name: content.name.value,
          slides: content.slides.value,
          createdAt: content.createdAt.value,
        },
        onEdit: (template) => {
          dialog.open(EditTemplateDialog, `edit-template-${template.id}`, {
            templateId: template.id,
            initialName: template.name,
            initialMaxCapacityChars: template.max_capacity_chars,
          })
        },
        onDelete: (template) => {
          dialog.open(DeleteTemplateDialog, `delete-template-${template.id}`, {
            templateId: template.id,
            templateName: template.name,
          })
        },
      }),
    [content.name.value, content.slides.value, content.createdAt.value, dialog, locale],
  )

  return {
    columns,
    grid,
    handleOpenUploadDialog,
    isLoading: isPending,
    isFetching,
    templatesResponse,
  }
}
