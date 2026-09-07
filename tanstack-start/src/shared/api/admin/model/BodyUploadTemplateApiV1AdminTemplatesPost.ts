
export interface BodyUploadTemplateApiV1AdminTemplatesPost {
  file: Blob;
  name: string;
  max_capacity_chars: number;
  layout_config_json?: string | null;
}
