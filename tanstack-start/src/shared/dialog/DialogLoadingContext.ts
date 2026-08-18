import { createContext, useContext } from 'react'

export interface DialogLoadingContextValue {
  /** Called by DialogContent when its `loading` prop changes. */
  setLoading: (loading: boolean) => void
}

export const DialogLoadingContext = createContext<DialogLoadingContextValue | null>(null)

/** Consumed by DialogContent to signal loading state up to DialogRenderer. */
export const useDialogLoadingContext = () => useContext(DialogLoadingContext)
