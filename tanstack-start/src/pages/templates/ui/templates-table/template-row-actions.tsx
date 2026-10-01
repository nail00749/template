import { Link } from '@tanstack/react-router'
import { MoreHorizontalIcon } from 'lucide-react'
import { useIntlayer } from 'react-intlayer'
import type { TemplateListItemResponse } from '@/shared/api/admin'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export interface TemplateRowActionsProps {
  template: TemplateListItemResponse
  onEdit: (template: TemplateListItemResponse) => void
  onDelete: (template: TemplateListItemResponse) => void
}

export function TemplateRowActions({ template, onEdit, onDelete }: TemplateRowActionsProps) {
  const content = useIntlayer('templates-page')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={content.actions.value}
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link
            to="/templates/$templateId"
            params={{ templateId: template.id }}
            className={'w-full'}
          >
            {content.open}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(template)}>{content.edit}</DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(template)}
        >
          {content.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
