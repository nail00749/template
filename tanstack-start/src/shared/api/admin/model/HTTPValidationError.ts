import type { ValidationError } from './ValidationError.ts';

export interface HTTPValidationError {
  detail?: ValidationError[];
}
