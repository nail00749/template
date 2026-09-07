import type { ComponentType, FormEvent, FormHTMLAttributes, PropsWithChildren } from 'react'

interface AppFormApi {
  AppForm: ComponentType<PropsWithChildren>
  handleSubmit: () => Promise<void>
}

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: AppFormApi
}

export function Form({ form, children, noValidate = true, ...props }: FormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const formElement = event.currentTarget

    void form
      .handleSubmit()
      .catch(() => undefined)
      .finally(() => {
        formElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      })
  }

  return (
    <form.AppForm>
      <form
        {...props}
        noValidate={noValidate}
        onSubmit={handleSubmit}
      >
        {children}
      </form>
    </form.AppForm>
  )
}
