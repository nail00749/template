import type { ListTemplatesApiV1AdminTemplatesGetParams } from '@/shared/api/admin'

export const templateKeys = {
  all: ['admin'] as const,
  templates: () => [...templateKeys.all, 'templates'] as const,
  templatesAll: () => [...templateKeys.templates()] as const,
  templateList: (params?: ListTemplatesApiV1AdminTemplatesGetParams) =>
    [...templateKeys.templatesAll(), 'list', params] as const,
  templateDetail: (templateId: string) =>
    [...templateKeys.templatesAll(), 'detail', templateId] as const,
  templateZones: (templateId: string) =>
    [...templateKeys.templatesAll(), 'detail', templateId, 'zones'] as const,
  templateAnnotations: (templateId: string) =>
    [...templateKeys.all, 'annotations', templateId] as const,
}
