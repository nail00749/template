
/**
 * Response after JSON sync operation.
 */
export interface SyncResponse {
  template_id: string;
  json_path: string;
  slides_exported: number;
  message?: string;
}
