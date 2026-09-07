
/**
 * Response after soft-deleting a slide.
 */
export interface SlideDeleteResponse {
  template_id: string;
  slide_number: number;
  is_active: boolean;
  message?: string;
}
