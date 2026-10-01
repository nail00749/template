import { useState } from 'react'
import { useIntlayer } from 'react-intlayer'
import { AlertTriangleIcon, CircleHelpIcon } from 'lucide-react'
import type { DialogProps } from './useDialog'
import { cn } from '@/shared/lib/utils'
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
  confirmVariant?: 'default' | 'destructive'
  onConfirm: () => Promise<void>
  onCancel?: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel: confirmLabelProp,
  cancelLabel: cancelLabelProp,
  confirmVariant = 'destructive',
  onConfirm,
  onCancel,
  onClose,
}: DialogProps<ConfirmDialogProps>) {
  const content = useIntlayer('shared-ui-dialog')
  const confirmLabel = confirmLabelProp ?? content.confirm.value
  const cancelLabel = cancelLabelProp ?? content.cancel.value
  const [isPending, setIsPending] = useState(false)
  const isDestructive = confirmVariant === 'destructive'
  const ConfirmIcon = isDestructive ? AlertTriangleIcon : CircleHelpIcon

  const handleConfirm = async () => {
    setIsPending(true)
    try {
      await onConfirm()
      onClose('confirmed')
    } catch {
      // Keep the dialog open so the caller can retry after a failed mutation.
    } finally {
      setIsPending(false)
    }
  }

  return (
    <DialogContent
      className="max-w-[95vw] sm:max-w-lg"
      loading={isPending}
    >
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-full',
              isDestructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
            )}
          >
            <ConfirmIcon />
          </div>
          <DialogTitle>{title}</DialogTitle>
        </div>
        <DialogDescription className="pt-2">{description}</DialogDescription>
      </DialogHeader>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onCancel?.()
            onClose('cancelled')
          }}
          disabled={isPending}
        >
          {cancelLabel}
        </Button>

        <Button
          type="button"
          variant={confirmVariant}
          loading={isPending}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
