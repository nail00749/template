import { LayoutTemplateIcon } from 'lucide-react'
import { useIntlayer } from 'react-intlayer'
import { useTemplatesPage } from '../model/useTemplatesPage'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataGrid } from '@/shared/ui/DataGrid'

export function TemplatesPage() {
  const content = useIntlayer('templates-page')
  const { columns, grid, handleOpenUploadDialog, isLoading, isFetching, templatesResponse } =
    useTemplatesPage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{content.title}</h2>
          <p className="text-muted-foreground">{content.description}</p>
        </div>
        <Button onClick={handleOpenUploadDialog}>
          <LayoutTemplateIcon className="mr-2 size-4" />
          {content.upload}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{content.allTemplates}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            columns={columns}
            rows={templatesResponse?.items}
            totalCount={templatesResponse?.total ?? 0}
            isLoading={isLoading}
            isFetching={isFetching}
            enableSorting={false}
            {...grid}
          />
        </CardContent>
      </Card>
    </div>
  )
}
