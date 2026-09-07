import type { AnnotationReadResponseOverrides } from './AnnotationReadResponseOverrides.ts';

/**
 * Response schema for reading slide annotations.
 */
export interface AnnotationReadResponse {
  /** Dictionary of field_id -> FieldType overrides */
  overrides?: AnnotationReadResponseOverrides;
}
