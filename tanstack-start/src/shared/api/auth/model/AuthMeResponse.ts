import type { AuthenticatedUser } from './AuthenticatedUser.ts';

/**
 * Current session user.
 */
export interface AuthMeResponse {
  user?: AuthenticatedUser | null;
}
