import type { LayoutAnnotationUpdateRequestOverrides } from './LayoutAnnotationUpdateRequestOverrides.ts';

/**
 * Request schema for updating layout annotations.
 *
 * Layout annotations use placeholder indices as keys (like "0", "1", etc.)
 * rather than field_ids with #zN pattern.
 */
export interface LayoutAnnotationUpdateRequest {
  /** Dictionary of placeholder_idx -> FieldType overrides */
  overrides?: LayoutAnnotationUpdateRequestOverrides;
}
