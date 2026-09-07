import type {
  AnnotationReadResponse,
  AnnotationUpdateRequest,
  BodyReuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut,
  BodyUploadTemplateApiV1AdminTemplatesPost,
  DeleteSlideApiV1AdminTemplatesTemplateIdSlidesSlideNumberDeleteParams,
  DeleteTemplateApiV1AdminTemplatesTemplateIdDeleteParams,
  LayoutAnnotationUpdateRequest,
  ListTemplatesApiV1AdminTemplatesGetParams,
  SlideDeleteResponse,
  SlideZonesResponse,
  SyncResponse,
  TemplateDetailResponse,
  TemplateListResponse,
  TemplateResponse,
  TemplateUpdate
} from '../../model';

import { customInstance } from '../../../../../shared/api/client.ts';
import type { BodyType } from '../../../../../shared/api/client.ts';
import { buildFormData } from '../../../../../shared/api/formData.ts';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];


  export const getAdmin = () => {
/**
 * @summary Upload Template
 */
const uploadTemplateApiV1AdminTemplatesPost = (
    bodyUploadTemplateApiV1AdminTemplatesPost: BodyType<BodyUploadTemplateApiV1AdminTemplatesPost>,
 options?: SecondParameter<typeof customInstance<TemplateDetailResponse>>,) => {const formData = buildFormData(bodyUploadTemplateApiV1AdminTemplatesPost)
      return customInstance<TemplateDetailResponse>(
      {url: `/api/v1/admin/templates`, method: 'POST',
      headers: {'Content-Type': 'multipart/form-data', },
       data: formData
    },
      options);
    }
  /**
 * @summary List Templates
 */
const listTemplatesApiV1AdminTemplatesGet = (
    params?: ListTemplatesApiV1AdminTemplatesGetParams,
 options?: SecondParameter<typeof customInstance<TemplateListResponse>>,) => {
      return customInstance<TemplateListResponse>(
      {url: `/api/v1/admin/templates`, method: 'GET',
        params
    },
      options);
    }
  /**
 * @summary Update Template
 */
const updateTemplateApiV1AdminTemplatesTemplateIdPut = (
    templateId: string,
    templateUpdate: BodyType<TemplateUpdate>,
 options?: SecondParameter<typeof customInstance<TemplateResponse>>,) => {
      return customInstance<TemplateResponse>(
      {url: `/api/v1/admin/templates/${templateId}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: templateUpdate
    },
      options);
    }
  /**
 * @summary Get Template
 */
const getTemplateApiV1AdminTemplatesTemplateIdGet = (
    templateId: string,
 options?: SecondParameter<typeof customInstance<TemplateDetailResponse>>,) => {
      return customInstance<TemplateDetailResponse>(
      {url: `/api/v1/admin/templates/${templateId}`, method: 'GET'
    },
      options);
    }
  /**
 * @summary Delete Template
 */
const deleteTemplateApiV1AdminTemplatesTemplateIdDelete = (
    templateId: string,
    params?: DeleteTemplateApiV1AdminTemplatesTemplateIdDeleteParams,
 options?: SecondParameter<typeof customInstance<void>>,) => {
      return customInstance<void>(
      {url: `/api/v1/admin/templates/${templateId}`, method: 'DELETE',
        params
    },
      options);
    }
  /**
 * @summary Delete Slide
 */
const deleteSlideApiV1AdminTemplatesTemplateIdSlidesSlideNumberDelete = (
    templateId: string,
    slideNumber: number,
    params?: DeleteSlideApiV1AdminTemplatesTemplateIdSlidesSlideNumberDeleteParams,
 options?: SecondParameter<typeof customInstance<SlideDeleteResponse>>,) => {
      return customInstance<SlideDeleteResponse>(
      {url: `/api/v1/admin/templates/${templateId}/slides/${slideNumber}`, method: 'DELETE',
        params
    },
      options);
    }
  /**
 * @summary Sync Template
 */
const syncTemplateApiV1AdminTemplatesTemplateIdSyncPost = (
    templateId: string,
 options?: SecondParameter<typeof customInstance<SyncResponse>>,) => {
      return customInstance<SyncResponse>(
      {url: `/api/v1/admin/templates/${templateId}/sync`, method: 'POST'
    },
      options);
    }
  /**
 * @summary Reupload Template Pptx
 */
const reuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut = (
    templateId: string,
    bodyReuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut: BodyType<BodyReuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut>,
 options?: SecondParameter<typeof customInstance<TemplateDetailResponse>>,) => {const formData = buildFormData(bodyReuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut)
      return customInstance<TemplateDetailResponse>(
      {url: `/api/v1/admin/templates/${templateId}/pptx`, method: 'PUT',
      headers: {'Content-Type': 'multipart/form-data', },
       data: formData
    },
      options);
    }
  /**
 * Return slide preview PNG from S3 storage.
 * @summary Get Slide Preview
 */
const getSlidePreviewApiV1AdminTemplatesTemplateIdSlidesSlideNumberPreviewGet = (
    templateId: string,
    slideNumber: number,
 options?: SecondParameter<typeof customInstance<Blob>>,) => {
      return customInstance<Blob>(
      {url: `/api/v1/admin/templates/${templateId}/slides/${slideNumber}/preview`, method: 'GET',
        responseType: 'blob'
    },
      options);
    }
  /**
 * @summary Get Template Original
 */
const getTemplateOriginalApiV1AdminTemplatesTemplateIdOriginalGet = (
    templateId: string,
 options?: SecondParameter<typeof customInstance<unknown>>,) => {
      return customInstance<unknown>(
      {url: `/api/v1/admin/templates/${templateId}/original`, method: 'GET'
    },
      options);
    }
  /**
 * Returns all annotation zones with their field types and resolution sources.
 * @summary List annotation zones for template
 */
const getTemplateZonesApiV1AdminTemplatesTemplateIdZonesGet = (
    templateId: string,
 options?: SecondParameter<typeof customInstance<SlideZonesResponse[]>>,) => {
      return customInstance<SlideZonesResponse[]>(
      {url: `/api/v1/admin/templates/${templateId}/zones`, method: 'GET'
    },
      options);
    }
  /**
 * Read field-type overrides for a specific template.
 * @summary Read template annotations
 */
const readAnnotationsApiV1AdminAnnotationsTemplateIdGet = (
    templateId: string,
 options?: SecondParameter<typeof customInstance<AnnotationReadResponse>>,) => {
      return customInstance<AnnotationReadResponse>(
      {url: `/api/v1/admin/annotations/${templateId}`, method: 'GET'
    },
      options);
    }
  /**
 * Write field-type overrides for a specific template atomically.
 * @summary Update template annotations
 */
const writeAnnotationsApiV1AdminAnnotationsTemplateIdPut = (
    templateId: string,
    annotationUpdateRequest: BodyType<AnnotationUpdateRequest>,
 options?: SecondParameter<typeof customInstance<AnnotationReadResponse>>,) => {
      return customInstance<AnnotationReadResponse>(
      {url: `/api/v1/admin/annotations/${templateId}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: annotationUpdateRequest
    },
      options);
    }
  /**
 * Read layout-level field-type overrides.
 * @summary Read layout annotations
 */
const readLayoutAnnotationsApiV1AdminLayoutAnnotationsLayoutNameGet = (
    layoutName: string,
 options?: SecondParameter<typeof customInstance<AnnotationReadResponse>>,) => {
      return customInstance<AnnotationReadResponse>(
      {url: `/api/v1/admin/layout-annotations/${layoutName}`, method: 'GET'
    },
      options);
    }
  /**
 * Write layout-level field-type overrides atomically.
 * @summary Update layout annotations
 */
const writeLayoutAnnotationsApiV1AdminLayoutAnnotationsLayoutNamePut = (
    layoutName: string,
    layoutAnnotationUpdateRequest: BodyType<LayoutAnnotationUpdateRequest>,
 options?: SecondParameter<typeof customInstance<AnnotationReadResponse>>,) => {
      return customInstance<AnnotationReadResponse>(
      {url: `/api/v1/admin/layout-annotations/${layoutName}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: layoutAnnotationUpdateRequest
    },
      options);
    }
  return {uploadTemplateApiV1AdminTemplatesPost,listTemplatesApiV1AdminTemplatesGet,updateTemplateApiV1AdminTemplatesTemplateIdPut,getTemplateApiV1AdminTemplatesTemplateIdGet,deleteTemplateApiV1AdminTemplatesTemplateIdDelete,deleteSlideApiV1AdminTemplatesTemplateIdSlidesSlideNumberDelete,syncTemplateApiV1AdminTemplatesTemplateIdSyncPost,reuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut,getSlidePreviewApiV1AdminTemplatesTemplateIdSlidesSlideNumberPreviewGet,getTemplateOriginalApiV1AdminTemplatesTemplateIdOriginalGet,getTemplateZonesApiV1AdminTemplatesTemplateIdZonesGet,readAnnotationsApiV1AdminAnnotationsTemplateIdGet,writeAnnotationsApiV1AdminAnnotationsTemplateIdPut,readLayoutAnnotationsApiV1AdminLayoutAnnotationsLayoutNameGet,writeLayoutAnnotationsApiV1AdminLayoutAnnotationsLayoutNamePut}};
export type UploadTemplateApiV1AdminTemplatesPostResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['uploadTemplateApiV1AdminTemplatesPost']>>>
export type ListTemplatesApiV1AdminTemplatesGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['listTemplatesApiV1AdminTemplatesGet']>>>
export type UpdateTemplateApiV1AdminTemplatesTemplateIdPutResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['updateTemplateApiV1AdminTemplatesTemplateIdPut']>>>
export type GetTemplateApiV1AdminTemplatesTemplateIdGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['getTemplateApiV1AdminTemplatesTemplateIdGet']>>>
export type DeleteTemplateApiV1AdminTemplatesTemplateIdDeleteResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['deleteTemplateApiV1AdminTemplatesTemplateIdDelete']>>>
export type DeleteSlideApiV1AdminTemplatesTemplateIdSlidesSlideNumberDeleteResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['deleteSlideApiV1AdminTemplatesTemplateIdSlidesSlideNumberDelete']>>>
export type SyncTemplateApiV1AdminTemplatesTemplateIdSyncPostResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['syncTemplateApiV1AdminTemplatesTemplateIdSyncPost']>>>
export type ReuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPutResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['reuploadTemplatePptxApiV1AdminTemplatesTemplateIdPptxPut']>>>
export type GetSlidePreviewApiV1AdminTemplatesTemplateIdSlidesSlideNumberPreviewGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['getSlidePreviewApiV1AdminTemplatesTemplateIdSlidesSlideNumberPreviewGet']>>>
export type GetTemplateOriginalApiV1AdminTemplatesTemplateIdOriginalGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['getTemplateOriginalApiV1AdminTemplatesTemplateIdOriginalGet']>>>
export type GetTemplateZonesApiV1AdminTemplatesTemplateIdZonesGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['getTemplateZonesApiV1AdminTemplatesTemplateIdZonesGet']>>>
export type ReadAnnotationsApiV1AdminAnnotationsTemplateIdGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['readAnnotationsApiV1AdminAnnotationsTemplateIdGet']>>>
export type WriteAnnotationsApiV1AdminAnnotationsTemplateIdPutResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['writeAnnotationsApiV1AdminAnnotationsTemplateIdPut']>>>
export type ReadLayoutAnnotationsApiV1AdminLayoutAnnotationsLayoutNameGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['readLayoutAnnotationsApiV1AdminLayoutAnnotationsLayoutNameGet']>>>
export type WriteLayoutAnnotationsApiV1AdminLayoutAnnotationsLayoutNamePutResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAdmin>['writeLayoutAnnotationsApiV1AdminLayoutAnnotationsLayoutNamePut']>>>
