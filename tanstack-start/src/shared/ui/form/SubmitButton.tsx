import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react'
import { Button } from '@/shared/ui/button'
import { useFormContext } from './form-context'

export interface SubmitButtonProps extends Omit<
  ComponentPropsWithoutRef<typeof Button>,
  'type' | 'loading'
> {
  loading?: boolean
}

export function SubmitButton({
  children,
  loading,
  ...props
}: PropsWithChildren<SubmitButtonProps>) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="submit"
          loading={isSubmitting || loading}
          {...props}
        >
          {children}
        </Button>
      )}
    </form.Subscribe>
  )
}
