import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { TemplateListItemResponse } from '@/shared/api/admin'
import { templateQueries } from '@/entities/template'
import { DeleteTemplateDialog } from '@/features/delete-template'
import { EditTemplateDialog } from '@/features/edit-template'
import { UploadTemplateDialog } from '@/features/upload-template'
import { useDataGridState } from '@/shared/lib/hooks/use-data-grid-sorting'
import { useDialog } from '@/shared/ui/dialog-provider'
import { createTemplatesColumns } from '../ui/templates-table/templates-columns'

export function useTemplatesPage() {
  const grid = useDataGridState<TemplateListItemResponse>({
    initialPageSize: 10,
  })
  const dialog = useDialog()

  const { data: templatesResponse, isLoading } = useQuery(
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
    [dialog],
  )

  return {
    columns,
    grid,
    handleOpenUploadDialog,
    isLoading,
    templatesResponse,
  }
}
