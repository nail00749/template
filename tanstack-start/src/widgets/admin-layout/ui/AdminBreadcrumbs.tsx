import { Link, linkOptions } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useIntlayer } from 'react-intlayer'
import { templateQueries } from '@/entities/template'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'

interface AdminBreadcrumbsProps {
  templateId?: string
}

function TemplateBreadcrumbPage({ templateId }: { templateId: string }) {
  const content = useIntlayer('admin-layout')
  // The route loader and detail page own fetching; subscribe to their shared cache.
  const { data: name } = useQuery({
    ...templateQueries.templateDetail(templateId),
    enabled: false,
    select: (template) => template.name,
  })
  const label = name ?? content.template.value
  return (
    <BreadcrumbPage
      className="block truncate"
      title={label}
    >
      {label}
    </BreadcrumbPage>
  )
}

export function AdminBreadcrumbs({ templateId }: AdminBreadcrumbsProps) {
  const content = useIntlayer('admin-layout')
  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="min-w-0 flex-nowrap">
        <BreadcrumbItem className="shrink-0">
          {templateId ? (
            <BreadcrumbLink
              render={
                <Link {...linkOptions({ to: '/templates', activeOptions: { exact: true } })} />
              }
            >
              {content.templates}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{content.templates}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {templateId && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <TemplateBreadcrumbPage templateId={templateId} />
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
