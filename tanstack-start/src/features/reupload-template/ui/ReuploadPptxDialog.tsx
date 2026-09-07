import type { DialogProps } from '@/shared/ui/dialog-provider'
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
  const { form, isPending } = useReuploadPptxForm({ templateId, onClose })

  return (
    <DialogContent
      className="max-w-[95vw] sm:max-w-lg"
      loading={isPending}
    >
      <DialogHeader>
        <DialogTitle>Перезагрузить PPTX</DialogTitle>
        <DialogDescription>
          Замените файл шаблона "{templateName}". Новый файл PPTX заменит существующие слайды.
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
              label="Файл шаблона"
              accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              allowedExtensions={['.pptx']}
              allowedMimeTypes={[
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              ]}
              invalidFileMessage="Поддерживаются только файлы с расширением .pptx"
              description="Файл презентации в формате PPTX."
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
            Отмена
          </Button>
          <form.AppForm>
            <form.SubmitButton>Обновить</form.SubmitButton>
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
