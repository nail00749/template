import { createContext, useContext } from 'react'
import { useDialogManager } from './useDialog'
import type { ReactNode } from 'react'
import type { DialogManagerReturn } from './useDialog'
import { DialogRenderer } from './DialogRenderer'

const DialogContext = createContext<DialogManagerReturn | undefined>(undefined)

export interface DialogProviderProps {
  children: ReactNode
}

export function DialogProvider({ children }: DialogProviderProps) {
  const dialogManager = useDialogManager()

  return (
    <DialogContext.Provider value={dialogManager}>
      {children}

      <DialogRenderer
        dialogs={dialogManager.dialogs}
        onClose={dialogManager.close}
      />
    </DialogContext.Provider>
  )
}

export function useDialog(): DialogManagerReturn {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider')
  }
  return context
}
