import React from 'react'
import type { DialogConfig } from './useDialog'
import { Dialog } from '@/shared/ui/dialog'

interface DialogRendererProps {
  dialogs: Array<DialogConfig>
  onClose: (id: string) => void
}

export const DialogRenderer: React.FC<DialogRendererProps> = ({ dialogs, onClose }) => {
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
