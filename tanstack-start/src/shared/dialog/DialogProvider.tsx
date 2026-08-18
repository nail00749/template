import React, { createContext, useContext } from 'react'
import { useDialogManager } from './useDialog'
import type { ReactNode } from 'react'
import type { DialogManagerReturn } from './useDialog'
import { DialogRenderer } from '@/shared/dialog/Dialogrenderer'

const DialogContext = createContext<DialogManagerReturn | undefined>(undefined)

export interface DialogProviderProps {
  children: ReactNode
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
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

export const useDialog = (): DialogManagerReturn => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider')
  }
  return context
}

export const DialogOutlet: React.FC = () => {
  const dialogManager = useDialog()
  return (
    <DialogRenderer
      dialogs={dialogManager.dialogs}
      onClose={dialogManager.close}
    />
  )
}
