import { Link } from '@tanstack/react-router'
import type { TemplateListItemResponse } from '@/shared/api/admin'
import { TemplateRowActions } from './template-row-actions'
import { formatTemplateCreatedAt } from './utils'
import type { DataGridColumnDef } from '@/shared/ui/DataGrid'
import type { AppLocale } from '@/shared/lib/i18n'

interface CreateTemplatesColumnsParams {
  locale: AppLocale
  labels: {
    name: string
    slides: string
    createdAt: string
  }
  onEdit: (template: TemplateListItemResponse) => void
  onDelete: (template: TemplateListItemResponse) => void
}

export const createTemplatesColumns = ({
  locale,
  labels,
  onEdit,
  onDelete,
}: CreateTemplatesColumnsParams) =>
  [
    {
      accessorKey: 'name',
      header: labels.name,
      enableSorting: false,
      size: 280,
      cell: ({ row }) => (
        <Link
          to="/templates/$templateId"
          params={{ templateId: row.original.id }}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'slide_count',
      header: labels.slides,
      enableSorting: false,
      cell: ({ row }) => row.original.slide_count ?? 0,
    },
    {
      id: 'created_at',
      accessorFn: (template) => template.created_at,
      header: labels.createdAt,
      enableSorting: false,
      cell: ({ row }) => formatTemplateCreatedAt(row.original.created_at, locale),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      size: 64,
      cell: ({ row }) => (
        <TemplateRowActions
          template={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ] satisfies Array<DataGridColumnDef<TemplateListItemResponse>>
