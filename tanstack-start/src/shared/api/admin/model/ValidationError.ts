import type { ValidationErrorCtx } from './ValidationErrorCtx.ts';

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: ValidationErrorCtx;
}
