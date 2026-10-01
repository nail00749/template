import { useLocale } from 'react-intlayer'
import { resolveLocale } from './locale'

export function useAppLocale() {
  const { locale, setLocale } = useLocale({ isCookieEnabled: false })
  return { locale: resolveLocale(locale), setLocale }
}
