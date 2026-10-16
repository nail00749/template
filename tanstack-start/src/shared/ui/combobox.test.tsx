import { createRef } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAppForm } from './form'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from './combobox'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function AnchoredCombobox({ showClear = false }: { showClear?: boolean }) {
  const anchor = useComboboxAnchor()
  return (
    <Combobox items={['Первый', 'Второй']}>
      <ComboboxInput
        anchorRef={anchor}
        aria-label="Вариант"
        showClear={showClear}
      />
      <ComboboxContent anchor={anchor}>
        <ComboboxList>
          <ComboboxItem value="Первый">Первый</ComboboxItem>
          <ComboboxItem value="Второй">Второй</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function AsyncFieldCombobox() {
  const form = useAppForm({ defaultValues: { choice: '' } })
  return (
    <form.AppField name="choice">
      {(field) => (
        <field.AsyncComboboxFieldForm
          label="Вариант"
          options={[{ value: 'first', label: 'Первый' }]}
          onSearchValueChange={() => undefined}
        />
      )}
    </form.AppField>
  )
}

describe('Combobox popup anchor', () => {
  it('keeps the normal input ref separate from the containing InputGroup ref', () => {
    const inputRef = createRef<HTMLInputElement>()
    const anchorRef = createRef<HTMLDivElement>()
    render(
      <Combobox>
        <ComboboxInput
          ref={inputRef}
          anchorRef={anchorRef}
          aria-label="Вариант"
        />
      </Combobox>,
    )

    expect(inputRef.current).toBe(screen.getByRole('combobox'))
    expect(anchorRef.current).toBe(inputRef.current?.closest('[data-slot="input-group"]'))
    expect(
      anchorRef.current?.contains(screen.getByRole('button', { name: 'Открыть список' })),
    ).toBe(true)
  })

  for (const showClear of [false, true]) {
    it(`measures the entire field when clear button is ${showClear ? 'shown' : 'hidden'}`, async () => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        const width = this.dataset.slot === 'input-group' ? 320 : 240
        return new DOMRect(0, 0, width, 36)
      })
      render(<AnchoredCombobox showClear={showClear} />)
      fireEvent.click(screen.getByRole('button', { name: 'Открыть список' }))
      const option = await screen.findByRole('option', { name: 'Первый' })
      const positioner = option.closest('[data-slot="combobox-content"]')?.parentElement
      await waitFor(() => {
        expect(positioner?.getAttribute('style')).toContain('--anchor-width: 320px')
      })
    })
  }

  it('anchors the asynchronous form field popup to the full input group', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const width = this.dataset.slot === 'input-group' ? 320 : 240
      return new DOMRect(0, 0, width, 36)
    })
    render(<AsyncFieldCombobox />)
    fireEvent.click(screen.getByRole('button', { name: 'Открыть список' }))
    const option = await screen.findByRole('option', { name: 'Первый' })
    await waitFor(() => {
      const positioner = option.closest('[data-slot="combobox-content"]')?.parentElement
      expect(positioner?.getAttribute('style')).toContain('--anchor-width: 320px')
    })
  })
})
