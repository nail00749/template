import type { FC } from 'react'

interface Props {}

export const NotFound: FC<Props> = () => {
  return (
    <div className="h-screen w-screen grid place-items-center">
      <h1 className="text-3xl font-bold">Страница не найдена</h1>
    </div>
  )
}
