
/**
 * Response schema for template list item (lightweight).
 */
export interface TemplateListItemResponse {
  id: string;
  name: string;
  max_capacity_chars: number;
  slide_count: number;
  created_at?: Date | null;
}
