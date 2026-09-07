import { SlidePreview } from '@/entities/template'
import { formatDate } from '@/shared/lib/formatDate'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, LayoutTemplateIcon, Trash2Icon, UploadIcon } from 'lucide-react'
import { useTemplateDetailPage } from '../model/useTemplateDetailPage'

interface TemplateDetailPageProps {
  templateId: string
}

export function TemplateDetailPage({ templateId }: TemplateDetailPageProps) {
  const {
    handleDeleteClick,
    handleOpenEdit,
    handleOpenReupload,
    handleOpenZones,
    isEmpty,
    slides,
    template,
  } = useTemplateDetailPage(templateId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/templates">
          <Button
            variant="ghost"
            size="icon"
            aria-label="arrow-left"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{template?.name ?? 'Шаблон'}</h2>
          <div className="flex items-center gap-4">
            {template?.created_at && (
              <span className="text-sm text-muted-foreground">
                Создан: {formatDate(template.created_at)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleOpenReupload}
          >
            <UploadIcon className="mr-2 size-4" />
            Повторно загрузить PPTX
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenEdit}
          >
            <LayoutTemplateIcon className="mr-2 size-4" />
            Редактировать шаблон
          </Button>
        </div>
      </div>
      {isEmpty && (
        <div className={'text-center font-medium text-sm'}>Нет слайдов для отображения</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {slides.map((slide) => (
          <Card
            key={slide.slide_number}
            className="overflow-hidden"
          >
            <CardContent className="p-0">
              <div
                className="group relative cursor-pointer"
                onClick={() => handleOpenZones(slide)}
              >
                <SlidePreview
                  imageUrl={slide.preview_url}
                  alt={`Слайд ${slide.slide_number}`}
                  className="aspect-video w-full"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-sm font-medium text-white">
                    Слайд {slide.slide_number + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-white hover:bg-destructive hover:text-white"
                    onClick={(e) => handleDeleteClick(e, slide)}
                    aria-label="remove"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
