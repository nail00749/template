import type { FieldType } from './FieldType.ts';

/**
 * Dictionary of field_id -> FieldType overrides
 */
export type AnnotationReadResponseOverrides = {[key: string]: FieldType};
