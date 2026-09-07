import type { TemplateResponseLayoutConfigJson } from './TemplateResponseLayoutConfigJson.ts';

/**
 * Full template response with all DB fields.
 */
export interface TemplateResponse {
  id: string;
  name: string;
  file_path: string;
  max_capacity_chars: number;
  layout_config_json?: TemplateResponseLayoutConfigJson;
}
