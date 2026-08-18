import { createFileRoute } from '@tanstack/react-router'
import { adminQueries } from '@/features/admin/api/admin.queries'
import { TemplateDetailPage } from '@/features/admin/ui/TemplateDetailPage'

export const Route = createFileRoute('/_admin/templates/$templateId')({
  loader: ({ params, context }) => {
    return context.queryClient.ensureQueryData(adminQueries.templateDetail(params.templateId))
  },
  head: ({ loaderData }) => {
    return {
      meta: [
        {
          title: `Шаблон ${loaderData?.name} — Admin Panel`,
        },
      ],
    }
  },
  component: TemplateDetailPageComponent,
})

function TemplateDetailPageComponent() {
  const { templateId } = Route.useParams()
  return <TemplateDetailPage templateId={templateId} />
}
