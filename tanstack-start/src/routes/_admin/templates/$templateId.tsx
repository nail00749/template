import { createFileRoute } from '@tanstack/react-router'
import { TemplateDetailPage } from '@/pages/template-detail'
import { templateQueries } from '@/entities/template'

export const Route = createFileRoute('/_admin/templates/$templateId')({
  loader: ({ params, context }) => {
    return context.queryClient.ensureQueryData(templateQueries.templateDetail(params.templateId))
  },
  staticData: { titleKey: 'template' },
  component: TemplateDetailPageComponent,
})

function TemplateDetailPageComponent() {
  const { templateId } = Route.useParams()
  return <TemplateDetailPage templateId={templateId} />
}
