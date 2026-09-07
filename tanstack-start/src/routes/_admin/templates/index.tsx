import { createFileRoute } from '@tanstack/react-router'
import { TemplatesPage } from '@/pages/templates'

export const Route = createFileRoute('/_admin/templates/')({
  head: () => ({
    meta: [
      {
        title: 'Шаблоны презентаций — Admin Panel',
      },
    ],
  }),
  component: TemplatesPage,
})
