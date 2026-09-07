import type { FieldType } from './FieldType.ts';
import type { SlideSize } from './SlideSize.ts';
import type { ZoneRect } from './ZoneRect.ts';
import type { ZoneResponseSource } from './ZoneResponseSource.ts';

/**
 * Response schema for a single zone's annotation details.
 */
export interface ZoneResponse {
  /**
     * Field ID in format 'name#zN'
     * @pattern ^[^#]+#z\d+$
     */
  field_id: string;
  /** Semantic type of the field */
  field_type: FieldType;
  /** Index of the placeholder in the template */
  placeholder_idx?: number | null;
  /** Label of the placeholder in the template */
  placeholder_label?: string | null;
  /** Source of the annotation: template, layout, or heuristic */
  source: ZoneResponseSource;
  /** Zone bounding box in EMU; None when geometry is unavailable */
  rect?: ZoneRect | null;
  /** Slide dimensions in EMU; reference frame for rect */
  slide_size?: SlideSize | null;
  /** Structural content of the zone (text/image/chart/table/...); drives allowed_field_types */
  content_type?: string | null;
  /** Field types assignable to this zone given its content_type. The frontend builds the type picker from this list; the backend rejects overrides outside it. */
  allowed_field_types?: FieldType[];
}
