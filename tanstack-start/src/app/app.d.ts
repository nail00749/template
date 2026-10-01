import 'react'
import '@tanstack/react-query'
import '@tanstack/react-table'
import '@tanstack/react-router'

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

// Routes declare metadata; the document renders it reactively when locale changes.
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    titleKey?: 'admin' | 'login' | 'templates' | 'template'
  }
}
