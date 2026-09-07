import 'react'
import '@tanstack/react-query'
import '@tanstack/react-table'

declare module 'react' {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: string
    directory?: string
  }
}

interface ErrorToastMeta {
  disableToast?: boolean
  [key: string]: unknown
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TFeatures, TData extends RowData, TValue> {
    noTruncate?: boolean
  }
}
