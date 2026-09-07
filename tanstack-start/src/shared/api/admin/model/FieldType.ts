
/**
 * Семантический тип поля шаблона — что в него должна положить LLM.
 */
export type FieldType = typeof FieldType[keyof typeof FieldType];


export const FieldType = {
  text_large: 'text_large',
  text_medium: 'text_medium',
  text_small: 'text_small',
  subheading: 'subheading',
  date: 'date',
  person_name: 'person_name',
  phone: 'phone',
  email: 'email',
  address: 'address',
  company: 'company',
  job_title: 'job_title',
  caption: 'caption',
  slide_number: 'slide_number',
  unknown: 'unknown',
  image: 'image',
  table: 'table',
  chart: 'chart',
  logo: 'logo',
} as const;
