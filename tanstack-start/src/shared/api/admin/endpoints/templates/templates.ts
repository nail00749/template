import { customInstance } from '../../../../../shared/api/client.ts';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];


  export const getTemplates = () => {
/**
 * Return the original PPTX bytes for a template.
 *
 * This is the public counterpart of ``/admin/templates/{id}/original``
 * and is consumed by OnlyOffice to render slide previews during upload.
 * @summary Get Template Original
 */
const getTemplateOriginalApiV1TemplatesTemplateIdOriginalGet = (
    templateId: string,
 options?: SecondParameter<typeof customInstance<unknown>>,) => {
      return customInstance<unknown>(
      {url: `/api/v1/templates/${templateId}/original`, method: 'GET'
    },
      options);
    }
  /**
 * Return the slide preview PNG for a template.
 *
 * Public counterpart of ``/admin/templates/{id}/slides/{n}/preview``.
 * Consumed by the OnlyOffice plugin to render layout-suggestion thumbnails
 * in the slide-layout picker — the plugin has no admin session and cannot
 * hit the admin-gated route.
 * @summary Get Slide Preview
 */
const getSlidePreviewApiV1TemplatesTemplateIdSlidesSlideNumberPreviewGet = (
    templateId: string,
    slideNumber: number,
 options?: SecondParameter<typeof customInstance<Blob>>,) => {
      return customInstance<Blob>(
      {url: `/api/v1/templates/${templateId}/slides/${slideNumber}/preview`, method: 'GET',
        responseType: 'blob'
    },
      options);
    }
  return {getTemplateOriginalApiV1TemplatesTemplateIdOriginalGet,getSlidePreviewApiV1TemplatesTemplateIdSlidesSlideNumberPreviewGet}};
export type GetTemplateOriginalApiV1TemplatesTemplateIdOriginalGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getTemplates>['getTemplateOriginalApiV1TemplatesTemplateIdOriginalGet']>>>
export type GetSlidePreviewApiV1TemplatesTemplateIdSlidesSlideNumberPreviewGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getTemplates>['getSlidePreviewApiV1TemplatesTemplateIdSlidesSlideNumberPreviewGet']>>>
