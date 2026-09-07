import type {
  AuthMeResponse,
  LogoutApiV1AuthLogoutPost200
} from '../../model';

import { customInstance } from '../../../../../shared/api/client.ts';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];


  export const getAuth = () => {
/**
 * Redirect to the configured OIDC provider using Authorization Code + PKCE S256.
 * @summary Login
 */
const loginApiV1AuthLoginGet = (

 options?: SecondParameter<typeof customInstance<unknown>>,) => {
      return customInstance<unknown>(
      {url: `/api/v1/auth/login`, method: 'GET'
    },
      options);
    }
  /**
 * Complete OIDC callback and store normalized userinfo in the session.
 * @summary Auth Callback
 */
const authCallbackApiV1AuthCallbackGet = (

 options?: SecondParameter<typeof customInstance<unknown>>,) => {
      return customInstance<unknown>(
      {url: `/api/v1/auth/callback`, method: 'GET'
    },
      options);
    }
  /**
 * Return the current user snapshot from the session, if any.
 * @summary Me
 */
const meApiV1AuthMeGet = (

 options?: SecondParameter<typeof customInstance<AuthMeResponse>>,) => {
      return customInstance<AuthMeResponse>(
      {url: `/api/v1/auth/me`, method: 'GET'
    },
      options);
    }
  /**
 * Drop local session state.
 * @summary Logout
 */
const logoutApiV1AuthLogoutPost = (

 options?: SecondParameter<typeof customInstance<LogoutApiV1AuthLogoutPost200>>,) => {
      return customInstance<LogoutApiV1AuthLogoutPost200>(
      {url: `/api/v1/auth/logout`, method: 'POST'
    },
      options);
    }
  return {loginApiV1AuthLoginGet,authCallbackApiV1AuthCallbackGet,meApiV1AuthMeGet,logoutApiV1AuthLogoutPost}};
export type LoginApiV1AuthLoginGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAuth>['loginApiV1AuthLoginGet']>>>
export type AuthCallbackApiV1AuthCallbackGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAuth>['authCallbackApiV1AuthCallbackGet']>>>
export type MeApiV1AuthMeGetResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAuth>['meApiV1AuthMeGet']>>>
export type LogoutApiV1AuthLogoutPostResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getAuth>['logoutApiV1AuthLogoutPost']>>>
