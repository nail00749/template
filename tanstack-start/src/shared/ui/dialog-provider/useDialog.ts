import { createElement, useCallback, useState } from 'react'
import type React from 'react'

export interface DialogConfig {
  id: string
  render: (onClose: () => void) => React.ReactNode
}

// Исключаем onClose из типа пропсов (distributive over union members)
type ExcludeOnClose<T> = T extends unknown ? Omit<T, 'onClose'> : never

export interface DialogManagerReturn {
  open: <T extends { onClose?: () => void }>(
    component: React.ComponentType<T>,
    id: string,
    props?: ExcludeOnClose<T>,
  ) => void
  close: (id: string) => void
  closeAll: () => void
  isOpen: (id: string) => boolean
  dialogs: Array<DialogConfig>
}

export type DialogProps<T extends object> = {
  onClose: () => void
} & T

export const useDialogManager = (): DialogManagerReturn => {
  const [dialogs, setDialogs] = useState<Array<DialogConfig>>([])

  const open = useCallback(
    <T extends { onClose?: () => void }>(
      component: React.ComponentType<T>,
      id: string,
      props?: ExcludeOnClose<T>,
    ) => {
      const entry: DialogConfig = {
        id,
        render: (onClose) =>
          createElement(component, {
            ...props,
            onClose,
          } as T),
      }
      setDialogs((prevDialogs) => {
        // Если диалог с таким id уже существует, обновляем его
        const existingIndex = prevDialogs.findIndex((d) => d.id === id)
        if (existingIndex > -1) {
          const updated = [...prevDialogs]
          updated[existingIndex] = entry
          return updated
        }
        return [...prevDialogs, entry]
      })
    },
    [],
  )

  const close = useCallback((id: string) => {
    setDialogs((prevDialogs) => prevDialogs.filter((d) => d.id !== id))
  }, [])

  const closeAll = useCallback(() => {
    setDialogs([])
  }, [])

  const isOpen = useCallback((id: string) => dialogs.some((d) => d.id === id), [dialogs])

  return {
    open,
    close,
    closeAll,
    isOpen,
    dialogs,
  }
}
