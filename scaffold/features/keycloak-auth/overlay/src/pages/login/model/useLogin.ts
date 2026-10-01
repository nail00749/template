import { useState } from 'react'
import { startLogin } from '@/shared/auth'

export function useLogin(returnTo?: string) {
  const [isPending, setIsPending] = useState(false)

  const login = () => {
    setIsPending(true)
    startLogin(returnTo)
  }

  return { isPending, login }
}
