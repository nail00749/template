import { useState } from 'react'
import { AlertTriangleIcon } from 'lucide-react'
import type { DialogProps } from '@/shared/ui/dialog-provider'
import { Button } from '@/shared/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

export interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onClose,
}: DialogProps<ConfirmDialogProps>) {
  const [isPending, setIsPending] = useState(false)

  const handleConfirm = async () => {
    setIsPending(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-lg">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangleIcon className="size-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
        </div>
        <DialogDescription className="break-words pt-2">{description}</DialogDescription>
      </DialogHeader>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          {cancelLabel}
        </Button>

        <Button
          type="button"
          variant="destructive"
          loading={isPending}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
