import { Link, linkOptions } from '@tanstack/react-router'
import { FileQuestionIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { PageState } from '@/shared/ui/page-state'

const templatesLink = linkOptions({ to: '/templates' })

export function NotFound() {
  return (
    <PageState
      icon={FileQuestionIcon}
      title="Страница не найдена"
      description="Проверьте адрес или вернитесь к списку шаблонов."
      actions={
        <div className="flex justify-center">
          <Button
            nativeButton={false}
            render={<Link {...templatesLink} />}
          >
            К шаблонам
          </Button>
        </div>
      }
    />
  )
}
