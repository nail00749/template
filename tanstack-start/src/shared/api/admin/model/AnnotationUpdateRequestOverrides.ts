import type { FieldType } from './FieldType.ts';

/**
 * Dictionary of field_id -> FieldType overrides
 */
export type AnnotationUpdateRequestOverrides = {[key: string]: FieldType};
