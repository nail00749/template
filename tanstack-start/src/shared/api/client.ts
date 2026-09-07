import { createIsomorphicFn } from '@tanstack/react-start'
import axios, { AxiosHeaders } from 'axios'
import type { AxiosError, AxiosRequestConfig, RawAxiosHeaders } from 'axios'
import { env } from '@/shared/config/env'

const ISO_DATE_REGEXP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE_REGEXP.test(value)
}

function parseDates<T>(value: T): T {
  if (isIsoDateString(value)) {
    return new Date(value) as unknown as T
  }

  if (Array.isArray(value)) {
    return value.map(parseDates) as unknown as T
  }

  if (value !== null && typeof value === 'object') {
    const obj = { ...(value as Record<string, unknown>) }
    for (const key in obj) {
      obj[key] = parseDates(obj[key])
    }
    return obj as unknown as T
  }

  return value
}

const getBaseURL = createIsomorphicFn()
  .client(() => env.VITE_API_BASE_URL ?? '')
  .server(() => env.SERVER_API_BASE_URL ?? env.VITE_API_BASE_URL ?? '')

const getHttpsAgentConfig = createIsomorphicFn()
  .client(() => undefined)
  .server(async () => {
    const { getServerHttpsAgentConfig } = await import('./https-agent.server')
    return getServerHttpsAgentConfig()
  })

export const AXIOS_INSTANCE = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return
      }

      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== null && v !== undefined) {
            searchParams.append(key, v)
          }
        })
      } else {
        searchParams.append(key, value instanceof Date ? value.toISOString() : value)
      }
    })

    return searchParams.toString()
  },
})

AXIOS_INSTANCE.interceptors.response.use((response) => {
  const responseType = response.config.responseType
  if (responseType === 'blob' || responseType === 'arraybuffer' || responseType === 'stream') {
    return response
  }
  response.data = parseDates(response.data)
  return response
})

const getServerCookieHeader = createIsomorphicFn()
  .client(() => undefined)
  .server(async () => {
    const { getCookie } = await import('@tanstack/react-start/server')
    const cookieValue = getCookie(env.VITE_AUTH_HEADER)

    if (!cookieValue) {
      return undefined
    }

    return `${env.VITE_AUTH_HEADER}=${cookieValue}`
  })

const mergeCookieHeader = (existingCookieHeader: unknown, cookieHeader: string) => {
  if (typeof existingCookieHeader !== 'string' || existingCookieHeader.length === 0) {
    return cookieHeader
  }

  const hasAuthCookie = existingCookieHeader
    .split(';')
    .some((cookie) => cookie.trim().startsWith(`${env.VITE_AUTH_HEADER}=`))

  if (hasAuthCookie) {
    return existingCookieHeader
  }

  return `${existingCookieHeader}; ${cookieHeader}`
}

export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const httpsAgentConfig = await getHttpsAgentConfig()
  const requestConfig: AxiosRequestConfig = {
    ...config,
    ...httpsAgentConfig,
    ...options,
  }
  const headers = AxiosHeaders.from(
    requestConfig.headers as AxiosHeaders | RawAxiosHeaders | undefined,
  )
  let forwardedCookieHeader: string | undefined

  const cookieHeader = await getServerCookieHeader()

  if (cookieHeader) {
    forwardedCookieHeader = mergeCookieHeader(headers.get('cookie'), cookieHeader)
    headers.set('cookie', forwardedCookieHeader)
  }

  const response = await AXIOS_INSTANCE({
    ...requestConfig,
    headers,
  })

  const { data } = response
  return data as T
}

export type ErrorType<T> = AxiosError<T>

export type BodyType<T> = T
