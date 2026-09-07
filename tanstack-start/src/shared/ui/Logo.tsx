import type { FC } from 'react'
import { cn } from '@/shared/lib/utils'

interface Props {
  clastName?: string
}

export const Logo: FC<Props> = ({ clastName }) => {
  return (
    <img
      src="logo.svg"
      alt=""
      className={cn('w-11 h-11', clastName)}
    />
  )
}
