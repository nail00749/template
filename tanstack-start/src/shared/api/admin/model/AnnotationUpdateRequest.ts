import type { AnnotationUpdateRequestOverrides } from './AnnotationUpdateRequestOverrides.ts';

/**
 * Request schema for updating slide annotations.
 */
export interface AnnotationUpdateRequest {
  /** Dictionary of field_id -> FieldType overrides */
  overrides?: AnnotationUpdateRequestOverrides;
}
