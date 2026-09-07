import { Link } from '@tanstack/react-router'
import type { TemplateListItemResponse } from '@/shared/api/admin'
import { TemplateRowActions } from './template-row-actions'
import { formatTemplateCreatedAt } from './utils'
import type { DataGridColumnDef } from '@/shared/ui/DataGrid'

interface CreateTemplatesColumnsParams {
  onEdit: (template: TemplateListItemResponse) => void
  onDelete: (template: TemplateListItemResponse) => void
}

export const createTemplatesColumns = ({ onEdit, onDelete }: CreateTemplatesColumnsParams) =>
  [
    {
      accessorKey: 'name',
      header: 'Название',
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
      header: 'Слайды',
      enableSorting: false,
      cell: ({ row }) => row.original.slide_count ?? 0,
    },
    {
      id: 'created_at',
      accessorFn: (template) => template.created_at,
      header: 'Дата создания',
      enableSorting: false,
      cell: ({ row }) => formatTemplateCreatedAt(row.original.created_at),
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
