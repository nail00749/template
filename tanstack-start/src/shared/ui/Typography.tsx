import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ElementType, FC, PropsWithChildren } from 'react'

type TypographyVariant =
  | 'text-xxs'
  | 'text-xs'
  | 'body-s'
  | 'body'
  | 'hs'
  | 'hm'
  | 'hl'
  | 'hxl'
  | 'hxxl'
  | 'hxxxl'

const typographyVariants = cva('', {
  variants: {
    variant: {
      'text-xxs': 'text-xs leading-4 font-normal',
      'text-xs': 'text-sm leading-5 font-normal',
      'body-s': 'text-sm leading-5 font-normal',
      body: 'text-base leading-6 font-normal',
      hs: 'text-lg leading-7 font-semibold',
      hm: 'text-xl leading-8 font-semibold',
      hl: 'text-2xl leading-9 font-semibold',
      hxl: 'text-3xl leading-10 font-bold',
      hxxl: 'text-4xl leading-12 font-bold',
      hxxxl: 'text-5xl leading-none font-bold',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
})

// Маппинг вариантов на HTML элементы
const variantToElement: Record<TypographyVariant, ElementType> = {
  'text-xxs': 'span',
  'text-xs': 'span',
  'body-s': 'p',
  body: 'p',
  hs: 'h6',
  hm: 'h5',
  hl: 'h4',
  hxl: 'h3',
  hxxl: 'h2',
  hxxxl: 'h1',
}

interface Props extends VariantProps<typeof typographyVariants> {
  as?: ElementType
  className?: string
}

export const Typography: FC<PropsWithChildren<Props>> = ({
  variant = 'body',
  as,
  className,
  children,
}) => {
  const Component = as || variantToElement[variant ?? 'body']
  const classNames = typographyVariants({ variant })

  return <Component className={`${classNames} ${className || ''}`}>{children}</Component>
}
