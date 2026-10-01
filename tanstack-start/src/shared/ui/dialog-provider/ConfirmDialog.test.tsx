import { StrictMode, useEffect } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'
import { DialogProvider, useDialog } from './DialogProvider'

interface HarnessProps {
  onCancel: () => void
  onConfirm: () => Promise<void>
}

function ConfirmationHarness({ onCancel, onConfirm }: HarnessProps) {
  const { open } = useDialog()

  useEffect(() => {
    open(ConfirmDialog, 'confirm-dialog-test', {
      title: 'Подтверждение',
      description: 'Проверка поведения диалога',
      onCancel,
      onConfirm,
    })
  }, [open, onCancel, onConfirm])

  return null
}

function confirmationTree(props: HarnessProps) {
  return (
    <StrictMode>
      <DialogProvider>
        <ConfirmationHarness {...props} />
      </DialogProvider>
    </StrictMode>
  )
}

function renderConfirmation(props: HarnessProps) {
  return render(confirmationTree(props))
}

afterEach(cleanup)

describe('ConfirmDialog lifecycle', () => {
  it('does not treat StrictMode effect replay as user cancellation', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn(() => Promise.resolve())

    renderConfirmation({ onCancel, onConfirm })

    expect(screen.getByRole('dialog', { name: 'Подтверждение' })).toBeTruthy()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('calls onCancel once when the user explicitly cancels', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn(() => Promise.resolve())

    renderConfirmation({ onCancel, onConfirm })
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Подтверждение' })).toBeNull()
    })
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it.each(['Escape', 'close button', 'outside pointer'] as const)(
    'calls onCancel once when dismissed using %s',
    async (dismissal) => {
      const onCancel = vi.fn()
      const onConfirm = vi.fn(() => Promise.resolve())

      renderConfirmation({ onCancel, onConfirm })

      if (dismissal === 'Escape') {
        fireEvent.keyDown(document, { key: 'Escape' })
      } else if (dismissal === 'close button') {
        fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
      } else {
        const overlay = document.querySelector('[data-slot="dialog-overlay"]')
        expect(overlay).toBeTruthy()
        if (overlay) {
          fireEvent.pointerDown(overlay)
          fireEvent.pointerUp(overlay)
          fireEvent.click(overlay)
        }
      }

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Подтверждение' })).toBeNull()
      })
      expect(onCancel).toHaveBeenCalledOnce()
    },
  )

  it('keeps the dialog open after a failed confirmation and allows retry', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn().mockRejectedValueOnce(new Error('request failed'))

    renderConfirmation({ onCancel, onConfirm })
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }))

    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce())
    expect(screen.getByRole('dialog', { name: 'Подтверждение' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Подтвердить' }).hasAttribute('disabled')).toBe(false)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('blocks Escape and outside dismissal while confirmation is pending', async () => {
    const onCancel = vi.fn()
    let resolveConfirm: (() => void) | undefined
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve
        }),
    )

    const props = { onCancel, onConfirm }
    const view = renderConfirmation(props)
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce())

    view.rerender(confirmationTree(props))

    fireEvent.keyDown(document, { key: 'Escape' })
    const overlay = document.querySelector('[data-slot="dialog-overlay"]')
    if (overlay) {
      fireEvent.pointerDown(overlay)
      fireEvent.pointerUp(overlay)
      fireEvent.click(overlay)
    }

    expect(screen.getByRole('dialog', { name: 'Подтверждение' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Закрыть' })).toBeNull()
    expect(onCancel).not.toHaveBeenCalled()

    await act(async () => {
      resolveConfirm?.()
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Подтверждение' })).toBeNull()
    })
    expect(onCancel).not.toHaveBeenCalled()
  })
})
