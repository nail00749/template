import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { getAdmin } from '@/shared/api/admin'
import { templateKeys } from './template.keys'
import type {
  AnnotationUpdateRequest,
  BodyReuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut,
  BodyUploadTemplateApiV1AdminTemplatesPost,
  DeleteSlideApiV1AdminTemplatesTemplateIdSlidesSlideNumberDeleteParams,
  DeleteTemplateApiV1AdminTemplatesTemplateIdDeleteParams,
  ListTemplatesApiV1AdminTemplatesGetParams,
  TemplateUpdate,
} from '@/shared/api/admin'

const adminApi = getAdmin()

export const templateQueries = {
  templates: (params?: ListTemplatesApiV1AdminTemplatesGetParams) =>
    queryOptions({
      queryKey: templateKeys.templateList(params),
      queryFn: () => adminApi.listTemplatesApiV1AdminTemplatesGet(params),
    }),

  templateDetail: (templateId: string) =>
    queryOptions({
      queryKey: templateKeys.templateDetail(templateId),
      queryFn: () => adminApi.getTemplateApiV1AdminTemplatesTemplateIdGet(templateId),
    }),

  templateZones: (templateId: string) =>
    queryOptions({
      queryKey: templateKeys.templateZones(templateId),
      queryFn: () => adminApi.getTemplateZonesApiV1AdminTemplatesTemplateIdZonesGet(templateId),
    }),

  templateAnnotations: (templateId: string) =>
    queryOptions({
      queryKey: templateKeys.templateAnnotations(templateId),
      queryFn: () => adminApi.readAnnotationsApiV1AdminAnnotationsTemplateIdGet(templateId),
    }),
}

export const templateMutations = {
  uploadTemplate: () =>
    mutationOptions({
      mutationFn: (body: BodyUploadTemplateApiV1AdminTemplatesPost) =>
        adminApi.uploadTemplateApiV1AdminTemplatesPost(body),
    }),

  updateTemplate: () =>
    mutationOptions({
      mutationFn: ({ templateId, data }: { templateId: string; data: TemplateUpdate }) =>
        adminApi.updateTemplateApiV1AdminTemplatesTemplateIdPut(templateId, data),
    }),

  deleteTemplate: () =>
    mutationOptions({
      mutationFn: ({
        templateId,
        params,
      }: {
        templateId: string
        params?: DeleteTemplateApiV1AdminTemplatesTemplateIdDeleteParams
      }) => adminApi.deleteTemplateApiV1AdminTemplatesTemplateIdDelete(templateId, params),
    }),

  deleteSlide: () =>
    mutationOptions({
      mutationFn: ({
        templateId,
        slideNumber,
        params,
      }: {
        templateId: string
        slideNumber: number
        params?: DeleteSlideApiV1AdminTemplatesTemplateIdSlidesSlideNumberDeleteParams
      }) =>
        adminApi.deleteSlideApiV1AdminTemplatesTemplateIdSlidesSlideNumberDelete(
          templateId,
          slideNumber,
          params,
        ),
    }),

  syncTemplate: () =>
    mutationOptions({
      mutationFn: (templateId: string) =>
        adminApi.syncTemplateApiV1AdminTemplatesTemplateIdSyncPost(templateId),
    }),

  reuploadTemplatePptx: () =>
    mutationOptions({
      mutationFn: ({
        templateId,
        body,
      }: {
        templateId: string
        body: BodyReuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut
      }) => adminApi.reuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut(templateId, body),
    }),

  writeTemplateAnnotations: (templateId: string) =>
    mutationOptions({
      mutationFn: (body: AnnotationUpdateRequest) =>
        adminApi.writeAnnotationsApiV1AdminAnnotationsTemplateIdPut(templateId, body),
    }),
}
