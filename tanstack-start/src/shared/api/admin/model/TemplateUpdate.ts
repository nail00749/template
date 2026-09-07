import type { TemplateUpdateLayoutConfigJson } from './TemplateUpdateLayoutConfigJson.ts';

/**
 * Request body for updating template metadata (all fields optional).
 */
export interface TemplateUpdate {
  name?: string | null;
  max_capacity_chars?: number | null;
  layout_config_json?: TemplateUpdateLayoutConfigJson;
}
