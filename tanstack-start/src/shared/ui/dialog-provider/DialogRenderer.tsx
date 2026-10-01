import { useCallback, useMemo, useRef } from 'react'
import type { DialogCloseReason, DialogConfig } from './useDialog'
import { DialogLoadingContext } from './DialogLoadingContext'
import { Dialog } from '@/shared/ui/dialog'

interface DialogRendererProps {
  dialogs: Array<DialogConfig>
  onClose: (id: string, reason?: DialogCloseReason) => void
}

interface DialogItemProps {
  config: DialogConfig
  onClose: (id: string, reason?: DialogCloseReason) => void
}

function DialogItem({ config, onClose }: DialogItemProps) {
  const isLoadingRef = useRef(false)

  const setLoading = useCallback((loading: boolean) => {
    isLoadingRef.current = loading
  }, [])
  const loadingContext = useMemo(() => ({ setLoading }), [setLoading])

  const handleClose = useCallback(
    (reason?: DialogCloseReason) => {
      const closeReason = reason === 'confirmed' || reason === 'cancelled' ? reason : 'dismissed'
      onClose(config.id, closeReason)
    },
    [config.id, onClose],
  )

  return (
    <DialogLoadingContext.Provider value={loadingContext}>
      <Dialog
        open
        onOpenChange={(isOpen) => {
          if (!isOpen && !isLoadingRef.current) {
            onClose(config.id, 'dismissed')
          }
        }}
      >
        {config.render(handleClose)}
      </Dialog>
    </DialogLoadingContext.Provider>
  )
}

export function DialogRenderer({ dialogs, onClose }: DialogRendererProps) {
  return (
    <>
      {dialogs.map((config) => (
        <DialogItem
          key={config.id}
          config={config}
          onClose={onClose}
        />
      ))}
    </>
  )
}
