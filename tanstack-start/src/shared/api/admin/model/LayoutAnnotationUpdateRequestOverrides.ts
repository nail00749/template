import type { FieldType } from './FieldType.ts';

/**
 * Dictionary of placeholder_idx -> FieldType overrides
 */
export type LayoutAnnotationUpdateRequestOverrides = {[key: string]: FieldType};
