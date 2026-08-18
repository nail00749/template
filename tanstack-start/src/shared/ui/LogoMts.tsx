import type { FC } from 'react'
import { cn } from '@/shared/lib/utils.ts'

interface Props {
  clastName?: string
}

export const LogoMts: FC<Props> = ({ clastName }) => {
  return (
    <img
      src="mts-logo.svg"
      alt=""
      className={cn('w-14 h-14', clastName)}
    />
  )
}
