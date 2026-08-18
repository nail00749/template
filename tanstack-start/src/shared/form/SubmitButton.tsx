import type { ComponentPropsWithoutRef, FC, PropsWithChildren } from 'react'
import { useFormContext } from '@/shared/form/index'
import { Button } from '@/shared/ui/button'

type SubmitButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, 'type' | 'loading'> & {
  loading?: boolean
}

export const SubmitButton: FC<PropsWithChildren<SubmitButtonProps>> = ({
  children,
  loading,
  ...props
}) => {
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
