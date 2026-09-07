import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { DialogProps } from '@/shared/ui/dialog-provider'
import { templateMutations } from '@/entities/template'
import { templateKeys } from '@/entities/template'
import { getMessageFromError } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

// Note: AGENTS.md says "Use ConfirmDialog for all destructive confirmations",
// but ConfirmDialog does not accept children, so we cannot host the
// "hard delete" checkbox inside it. This component is a custom destructive
// dialog that mirrors ConfirmDialog's structure but adds the checkbox.
interface DeleteTemplateDialogProps {
  templateId: string
  templateName: string
}

export function DeleteTemplateDialog({
  templateId,
  templateName,
  onClose,
}: DialogProps<DeleteTemplateDialogProps>) {
  const queryClient = useQueryClient()
  const [hardDelete, setHardDelete] = useState(false)

  const mutation = useMutation({
    ...templateMutations.deleteTemplate(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: templateKeys.templatesAll(),
      })
      onClose()
    },
    onError: (e) => {
      toast.error(getMessageFromError(e))
    },
  })

  const handleConfirm = () => {
    void mutation.mutate({
      templateId,
      params: hardDelete ? { hard: true } : undefined,
    })
  }

  return (
    <DialogContent
      className="max-w-[95vw] sm:max-w-md"
      loading={mutation.isPending}
    >
      <DialogHeader>
        <DialogTitle>Удалить шаблон</DialogTitle>
        <DialogDescription>
          Вы уверены, что хотите удалить шаблон "{templateName}"? Это действие нельзя отменить.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center space-x-2 py-2">
        <Checkbox
          id="hard-delete"
          checked={hardDelete}
          onCheckedChange={(checked) => setHardDelete(checked === true)}
        />
        <Label
          htmlFor="hard-delete"
          className="text-sm text-muted-foreground"
        >
          Удалить без возможности восстановления
        </Label>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Отмена
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleConfirm}
          loading={mutation.isPending}
        >
          Удалить
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
