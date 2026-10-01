import { Link, linkOptions } from '@tanstack/react-router'
import { FileQuestionIcon } from 'lucide-react'
import { useIntlayer } from 'react-intlayer'
import { Button } from '@/shared/ui/button'
import { PageState } from '@/shared/ui/page-state'

const templatesLink = linkOptions({ to: '/templates' })

export function NotFound() {
  const content = useIntlayer('not-found')
  return (
    <PageState
      icon={FileQuestionIcon}
      title={content.title.value}
      description={content.description.value}
      actions={
        <div className="flex justify-center">
          <Button
            nativeButton={false}
            render={<Link {...templatesLink} />}
          >
            {content.templates}
          </Button>
        </div>
      }
    />
  )
}
