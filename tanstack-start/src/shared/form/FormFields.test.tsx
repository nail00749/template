import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Form, useAppForm } from './index'

afterEach(cleanup)

function NumberFieldHarness({ mode = 'decimal' }: { mode?: 'integer' | 'decimal' }) {
  const form = useAppForm({
    defaultValues: { amount: null as number | null },
    onSubmit: async () => undefined,
  })

  return (
    <>
      <form.AppField name="amount">
        {(field) => (
          <field.NumberFieldForm
            label="Сумма"
            mode={mode}
          />
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.amount}>
        {(value) => <output aria-label="Значение суммы">{value ?? ''}</output>}
      </form.Subscribe>
    </>
  )
}

function ComboboxFieldHarness() {
  const form = useAppForm({
    defaultValues: { relationId: '' },
    onSubmit: async () => undefined,
  })

  return (
    <>
      <form.AppField name="relationId">
        {(field) => (
          <field.ComboboxFieldForm label="Связь">
            {({ id, name, value, onValueChange, onBlur, 'aria-invalid': ariaInvalid }) => (
              <input
                id={id}
                name={name}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                onBlur={onBlur}
                aria-invalid={ariaInvalid}
              />
            )}
          </field.ComboboxFieldForm>
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.relationId}>
        {(value) => <output aria-label="Выбранная связь">{value}</output>}
      </form.Subscribe>
    </>
  )
}

function RadioGroupFieldHarness() {
  const form = useAppForm({
    defaultValues: { status: '' },
    onSubmit: async () => undefined,
  })

  return (
    <>
      <form.AppField name="status">
        {(field) => (
          <field.RadioGroupForm
            label="Статус"
            items={[
              { value: 'draft', title: 'Черновик' },
              { value: 'published', title: 'Опубликован' },
            ]}
          />
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.status}>
        {(value) => <output aria-label="Выбранный статус">{value}</output>}
      </form.Subscribe>
    </>
  )
}

function FileFieldHarness() {
  const form = useAppForm({
    defaultValues: { attachment: null as File | null },
    onSubmit: async () => undefined,
  })

  return (
    <>
      <form.AppField name="attachment">
        {(field) => (
          <field.FileFieldForm
            label="Вложение"
            allowedExtensions={['pdf']}
            allowedMimeTypes={['APPLICATION/PDF']}
          />
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.attachment?.name ?? ''}>
        {(value) => <output aria-label="Выбранный файл">{value}</output>}
      </form.Subscribe>
    </>
  )
}

function FormHarness({ onSubmit }: { onSubmit: (value: { name: string }) => void }) {
  const form = useAppForm({
    defaultValues: { name: 'Документ' },
    onSubmit: async ({ value }) => onSubmit(value),
  })

  return (
    <Form
      form={form}
      aria-label="Тестовая форма"
    >
      <form.SubmitButton>Сохранить</form.SubmitButton>
    </Form>
  )
}

function RejectedFormHarness({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const form = useAppForm({
    defaultValues: { name: 'Документ' },
    onSubmit,
  })

  return (
    <Form
      form={form}
      aria-label="Форма с ошибкой"
    >
      <form.SubmitButton>Сохранить</form.SubmitButton>
    </Form>
  )
}

function ErrorSummaryHarness() {
  const form = useAppForm({
    defaultValues: { name: '' },
    onSubmit: async () => undefined,
  })

  return (
    <Form
      form={form}
      aria-label="Форма с валидацией"
    >
      <form.FormErrorSummary getFieldLabel={() => 'Название'} />
      <form.AppField
        name="name"
        validators={{
          onSubmit: ({ value }) => (value === '' ? 'Обязательное поле' : undefined),
        }}
      >
        {(field) => <field.TextFieldForm label="Название" />}
      </form.AppField>
      <form.SubmitButton>Сохранить</form.SubmitButton>
    </Form>
  )
}

function AsyncComboboxHarness({
  onSearchValueChange,
  onLoadMore,
  isLoading = false,
}: {
  onSearchValueChange: (value: string) => void
  onLoadMore: () => void
  isLoading?: boolean
}) {
  const form = useAppForm({
    defaultValues: { contractId: '' },
    onSubmit: async () => undefined,
  })

  return (
    <>
      <form.AppField name="contractId">
        {(field) => (
          <field.AsyncComboboxFieldForm
            label="Договор"
            options={[
              { value: 'contract-1', label: 'Договор №1' },
              { value: 'contract-2', label: 'Договор №2' },
            ]}
            debounceMs={10}
            hasNextPage
            isLoading={isLoading}
            onSearchValueChange={onSearchValueChange}
            onLoadMore={onLoadMore}
          />
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.contractId}>
        {(value) => <output aria-label="Выбранный договор">{value}</output>}
      </form.Subscribe>
    </>
  )
}

interface Participant {
  id: string
  name: string
}

function FieldArrayHarness() {
  const form = useAppForm({
    defaultValues: {
      participants: [
        { id: 'first', name: 'Первый' },
        { id: 'second', name: 'Второй' },
      ] satisfies Participant[],
    },
    onSubmit: async () => undefined,
  })

  return (
    <>
      <form.AppField
        name="participants"
        mode="array"
      >
        {(field) => (
          <field.FieldArrayForm
            label="Участники"
            itemLabel="Участник"
            addLabel="Добавить участника"
            createItem={() => ({ id: 'new', name: 'Новый' })}
            getItemKey={(item) => item.id}
          >
            {({ item }) => <span>{item.name}</span>}
          </field.FieldArrayForm>
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.participants.map((item) => item.name)}>
        {(names) => <output aria-label="Порядок участников">{names.join(',')}</output>}
      </form.Subscribe>
    </>
  )
}

describe('shared form fields', () => {
  it('submits through the shared Form wrapper', async () => {
    const onSubmit = vi.fn()
    render(<FormHarness onSubmit={onSubmit} />)

    fireEvent.submit(screen.getByRole('form', { name: 'Тестовая форма' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Документ' })
    })
    expect(screen.getByRole('form').hasAttribute('novalidate')).toBe(true)
  })

  it('handles a rejected submit promise without an unhandled rejection', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Request failed'))
    render(<RejectedFormHarness onSubmit={onSubmit} />)

    fireEvent.submit(screen.getByRole('form', { name: 'Форма с ошибкой' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      expect(screen.getByRole('button', { name: 'Сохранить' }).hasAttribute('disabled')).toBe(false)
    })
  })

  it('summarizes validation errors and focuses the invalid field', async () => {
    render(<ErrorSummaryHarness />)

    fireEvent.submit(screen.getByRole('form', { name: 'Форма с валидацией' }))

    const summaryLink = await screen.findByRole('button', {
      name: 'Название: Обязательное поле',
    })
    expect(document.activeElement).toBe(screen.getByLabelText('Название'))

    fireEvent.click(summaryLink)
    expect(document.activeElement).toBe(screen.getByLabelText('Название'))
  })

  it('debounces async combobox search and binds the selected option', async () => {
    const onSearchValueChange = vi.fn()
    const onLoadMore = vi.fn()
    render(
      <AsyncComboboxHarness
        onSearchValueChange={onSearchValueChange}
        onLoadMore={onLoadMore}
      />,
    )
    const input = screen.getByLabelText('Договор')

    fireEvent.click(screen.getByRole('button', { name: 'Открыть список' }))
    fireEvent.change(input, { target: { value: 'Договор' } })

    await waitFor(() => {
      expect(onSearchValueChange).toHaveBeenCalledWith('Договор')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Показать ещё' }))
    expect(onLoadMore).toHaveBeenCalledOnce()

    fireEvent.click(await screen.findByRole('option', { name: 'Договор №1' }))
    expect(screen.getByLabelText('Выбранный договор').textContent).toBe('contract-1')
  })

  it('announces async combobox loading state', async () => {
    render(
      <AsyncComboboxHarness
        isLoading
        onSearchValueChange={() => undefined}
        onLoadMore={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Открыть список' }))

    expect((await screen.findByRole('status')).textContent).toBe('Загрузка вариантов')
  })

  it('adds, removes, and reorders field array items', () => {
    render(<FieldArrayHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Переместить участник 1 вниз' }))
    expect(screen.getByLabelText('Порядок участников').textContent).toBe('Второй,Первый')

    fireEvent.click(screen.getByRole('button', { name: 'Удалить участник 2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Добавить участника' }))
    expect(screen.getByLabelText('Порядок участников').textContent).toBe('Второй,Новый')
  })

  it('keeps decimal input editable while storing a number', () => {
    render(<NumberFieldHarness />)
    const input = screen.getByLabelText('Сумма')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '-' } })
    expect(input.getAttribute('value')).toBe('-')
    expect(screen.getByLabelText('Значение суммы').textContent).toBe('')

    fireEvent.change(input, { target: { value: '-12,5' } })
    expect(input.getAttribute('value')).toBe('-12,5')
    expect(screen.getByLabelText('Значение суммы').textContent).toBe('-12.5')

    fireEvent.blur(input)
    expect(input.getAttribute('value')).toBe('-12.5')
  })

  it('rejects decimal characters in integer mode', () => {
    render(<NumberFieldHarness mode="integer" />)
    const input = screen.getByLabelText('Сумма')

    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.change(input, { target: { value: '12.5' } })

    expect(input.getAttribute('value')).toBe('12')
    expect(screen.getByLabelText('Значение суммы').textContent).toBe('12')
  })

  it('binds combobox render props to the form field', () => {
    render(<ComboboxFieldHarness />)

    fireEvent.change(screen.getByLabelText('Связь'), { target: { value: 'relation-1' } })

    expect(screen.getByLabelText('Выбранная связь').textContent).toBe('relation-1')
  })

  it('binds radio options to the form field', () => {
    render(<RadioGroupFieldHarness />)

    fireEvent.click(screen.getByRole('radio', { name: 'Опубликован' }))

    expect(screen.getByLabelText('Выбранный статус').textContent).toBe('published')
  })

  it('normalizes file restrictions and allows clearing the selected file', () => {
    render(<FileFieldHarness />)
    const input = screen.getByLabelText('Вложение')
    const file = new File(['document'], 'document.PDF', { type: 'application/pdf' })

    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByLabelText('Выбранный файл').textContent).toBe('document.PDF')

    fireEvent.click(screen.getByRole('button', { name: 'Удалить файл document.PDF' }))
    expect(screen.getByLabelText('Выбранный файл').textContent).toBe('')
  })
})
