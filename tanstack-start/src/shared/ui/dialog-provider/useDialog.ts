import { createElement, useCallback, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'

export type DialogCloseReason = 'cancelled' | 'confirmed' | 'dismissed'

export interface DialogCloseHandler {
  (): void
  (reason: DialogCloseReason): void
}

export interface DialogConfig {
  id: string
  onDismiss?: () => void
  render: (onClose: DialogCloseHandler) => ReactNode
}

interface DialogCloseProps {
  onClose: DialogCloseHandler
}

export interface DialogManagerReturn {
  open: <T extends object>(
    component: ComponentType<T & DialogCloseProps>,
    id: string,
    props?: T,
  ) => void
  close: (id: string, reason?: DialogCloseReason) => void
  closeAll: (reason?: DialogCloseReason) => void
  isOpen: (id: string) => boolean
  dialogs: Array<DialogConfig>
}

export type DialogProps<T extends object = {}> = {
  onClose: DialogCloseHandler
} & T

export const useDialogManager = (): DialogManagerReturn => {
  const [dialogs, setDialogs] = useState<Array<DialogConfig>>([])
  const dialogsRef = useRef<Array<DialogConfig>>([])

  const open = useCallback(
    <T extends object>(component: ComponentType<T & DialogCloseProps>, id: string, props?: T) => {
      const onDismiss = getOnDismiss(props)
      const config: DialogConfig = {
        id,
        onDismiss,
        render: (onClose) => {
          const componentProps = Object.assign({}, props, { onClose })
          return createElement(component, componentProps)
        },
      }

      const existingIndex = dialogsRef.current.findIndex((dialog) => dialog.id === id)
      const nextDialogs = [...dialogsRef.current]
      if (existingIndex > -1) {
        nextDialogs[existingIndex] = config
      } else {
        nextDialogs.push(config)
      }
      dialogsRef.current = nextDialogs
      setDialogs(nextDialogs)
    },
    [],
  )

  const close = useCallback((id: string, reason: DialogCloseReason = 'dismissed') => {
    const dialog = dialogsRef.current.find((item) => item.id === id)
    if (!dialog) {
      return
    }

    if (reason === 'dismissed') {
      dialog.onDismiss?.()
    }

    const nextDialogs = dialogsRef.current.filter((item) => item.id !== id)
    dialogsRef.current = nextDialogs
    setDialogs(nextDialogs)
  }, [])

  const closeAll = useCallback((reason: DialogCloseReason = 'dismissed') => {
    if (reason === 'dismissed') {
      for (const dialog of dialogsRef.current) {
        dialog.onDismiss?.()
      }
    }

    dialogsRef.current = []
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

function getOnDismiss(props: object | undefined): (() => void) | undefined {
  if (props === undefined || !('onCancel' in props)) {
    return undefined
  }

  const { onCancel } = props
  if (typeof onCancel === 'function') {
    return () => onCancel()
  }

  return undefined
}
