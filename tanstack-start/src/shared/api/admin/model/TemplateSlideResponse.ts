import type { TemplateSlideResponseMetadataJson } from './TemplateSlideResponseMetadataJson.ts';

/**
 * Response schema for a single template slide.
 */
export interface TemplateSlideResponse {
  id: string;
  slide_number: number;
  layout_name: string;
  preview_url: string;
  metadata_json?: TemplateSlideResponseMetadataJson;
  is_active: boolean;
  created_at?: Date | null;
}
