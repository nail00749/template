import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { isAxiosError } from 'axios'
import type { ClassValue } from 'clsx'
import { getFileValidationErrorMessage } from '@/shared/lib/fileValidationErrorMessages'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes === 0) {
    return '0 Bytes'
  }
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k))
  return `${parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function getMessageFromError(error: unknown, defaultMessage = 'Неизвестная ошибка'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data

    if (typeof data === 'object' && data !== null) {
      if ('detail' in data) {
        const detail = (data as { detail: unknown }).detail

        if (typeof detail === 'string' && detail.length > 0) {
          return detail
        }

        if (Array.isArray(detail)) {
          const firstDetail = detail[0]
          if (firstDetail && typeof firstDetail === 'object' && 'msg' in firstDetail) {
            return String(firstDetail.msg)
          }
        }
      }

      if ('message' in data) {
        const message = String(data.message)
        const details = (data as { details?: unknown }).details
        const isDetailsObject = details !== null && typeof details === 'object'

        if (isDetailsObject) {
          const code = (details as { code?: unknown }).code
          if (typeof code === 'string') {
            return formatFileValidationError(code, message, details)
          }
        }

        return message
      }
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return defaultMessage
}

function formatFileValidationError(
  code: string,
  fallbackMessage: string,
  details: { filename?: unknown; file_role?: unknown },
): string {
  const knownCodes = new Set([
    'empty_file',
    'missing_filename',
    'unsupported_extension',
    'broken_structure',
    'invalid_pdf',
    'invalid_docx',
    'invalid_xlsx',
    'missing_header',
    'missing_required_columns',
    'no_data_rows',
    'empty_required_cells',
    'invalid_reference',
  ])

  if (!knownCodes.has(code)) {
    return fallbackMessage
  }

  const localized = getFileValidationErrorMessage(code, fallbackMessage)

  const filename = typeof details.filename === 'string' ? details.filename : null
  if (filename) {
    return `${localized} (${filename})`
  }

  return localized
}

export function downloadFile(blob: Blob, filename = 'file'): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
