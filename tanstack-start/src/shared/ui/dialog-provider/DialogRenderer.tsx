import type { DialogConfig } from './useDialog'
import { Dialog } from '@/shared/ui/dialog'

interface DialogRendererProps {
  dialogs: Array<DialogConfig>
  onClose: (id: string) => void
}

export function DialogRenderer({ dialogs, onClose }: DialogRendererProps) {
  return (
    <>
      {dialogs.map(({ id, render }) => (
        <Dialog
          key={id}
          open={true}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              onClose(id)
            }
          }}
        >
          {render(() => onClose(id))}
        </Dialog>
      ))}
    </>
  )
}
