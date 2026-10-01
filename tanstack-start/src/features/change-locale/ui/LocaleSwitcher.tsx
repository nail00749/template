import { useIntlayer } from 'react-intlayer'
import { isAppLocale, useAppLocale } from '@/shared/lib/i18n'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const localeLabels = { ru: 'Русский', en: 'English' }

export function LocaleSwitcher() {
  const { locale, setLocale } = useAppLocale()
  const content = useIntlayer('locale-switcher')
  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        if (isAppLocale(value)) {
          setLocale(value)
        }
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label={content.label.value}
      >
        <SelectValue>{localeLabels[locale]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ru">Русский</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  )
}
