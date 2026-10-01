import type { DialogProps } from '@/shared/ui/dialog-provider'
import { useIntlayer } from 'react-intlayer'
import { useReuploadPptxForm } from '../model/useReuploadPptxForm'
import { Button } from '@/shared/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

interface ReuploadPptxDialogProps {
  templateId: string
  templateName: string
}

export function ReuploadPptxDialog({
  templateId,
  templateName,
  onClose,
}: DialogProps<ReuploadPptxDialogProps>) {
  const content = useIntlayer('reupload-template')
  const { form, isPending } = useReuploadPptxForm({ templateId, onClose })

  return (
    <DialogContent
      className="max-w-[95vw] sm:max-w-lg"
      loading={isPending}
    >
      <DialogHeader>
        <DialogTitle>{content.title}</DialogTitle>
        <DialogDescription>
          {content.descriptionBeforeName}
          {templateName}
          {content.descriptionAfterName}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="gap-4 flex flex-col"
      >
        <form.AppField name="file">
          {(field) => (
            <field.FileFieldForm
              label={content.file.value}
              accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              allowedExtensions={['.pptx']}
              allowedMimeTypes={[
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              ]}
              invalidFileMessage={content.pptxExtension.value}
              description={content.fileDescription.value}
            />
          )}
        </form.AppField>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            {content.cancel}
          </Button>
          <form.AppForm>
            <form.SubmitButton>{content.update}</form.SubmitButton>
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
