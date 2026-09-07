
/**
 * Stable user snapshot stored in the signed session cookie.
 */
export interface AuthenticatedUser {
  /**
     * @minLength 1
     * @maxLength 256
     */
  id: string;
  email?: string | null;
  name?: string | null;
  roles?: string[];
}
