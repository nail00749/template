import { LayoutTemplateIcon } from 'lucide-react'
import { useTemplatesPage } from '../model/useTemplatesPage'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataGrid } from '@/shared/ui/DataGrid'

export function TemplatesPage() {
  const { columns, grid, handleOpenUploadDialog, isLoading, templatesResponse } = useTemplatesPage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Шаблоны презентаций</h2>
          <p className="text-muted-foreground">Управление шаблонами</p>
        </div>
        <Button onClick={handleOpenUploadDialog}>
          <LayoutTemplateIcon className="mr-2 size-4" />
          Загрузить шаблон
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все шаблоны</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            columns={columns}
            rows={templatesResponse?.items}
            totalCount={templatesResponse?.total ?? 0}
            isLoading={isLoading}
            enableSorting={false}
            {...grid}
          />
        </CardContent>
      </Card>
    </div>
  )
}
