import type { TemplateDetailResponseLayoutConfigJson } from './TemplateDetailResponseLayoutConfigJson.ts';
import type { TemplateSlideResponse } from './TemplateSlideResponse.ts';

/**
 * Response schema for template details with slides.
 */
export interface TemplateDetailResponse {
  id: string;
  name: string;
  file_path: string;
  max_capacity_chars: number;
  layout_config_json?: TemplateDetailResponseLayoutConfigJson;
  slides: TemplateSlideResponse[];
  created_at?: Date | null;
  updated_at?: Date | null;
}
