import type { TemplateListItemResponse } from './TemplateListItemResponse.ts';

/**
 * Paginated list of templates.
 */
export interface TemplateListResponse {
  items: TemplateListItemResponse[];
  total: number;
  offset: number;
  limit: number;
}
