/**
 * Picture — обёртка для изображений с автовыбором формата
 *
 * Использование:
 *   <Picture src="/images/photo.png" alt="Описание" width={800} height={600} />
 *
 * Компонент автоматически строит WebP-путь из src:
 *   /images/photo.png  → /images/photo.webp
 *   /images/photo.jpg  → /images/photo.webp
 *
 * Если нужно явно указать пути:
 *   <Picture
 *     src="/images/photo.png"
 *     webpSrc="/cdn/photo.webp"
 *     avifSrc="/cdn/photo.avif"
 *     alt="Описание"
 *   />
 */

import type { ImgHTMLAttributes } from 'react'

// ─── Типы ────────────────────────────────────────────────────────────────────

/** Расширяем стандартные атрибуты <img>, добавляя пропсы для современных форматов */
export interface PictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Путь к оригинальному изображению PNG/JPEG (обязательный) */
  src: string

  /**
   * Путь к WebP-версии.
   * Если не передан — генерируется автоматически из `src`
   * (заменяется расширение .png/.jpg/.gif → .webp).
   * Передайте `false`, чтобы полностью отключить WebP-source.
   */
  webpSrc?: string | false

  /**
   * Путь к AVIF-версии (опционально).
   * AVIF даёт наилучшее сжатие, поддерживается современными браузерами.
   */
  avifSrc?: string

  /**
   * srcSet для WebP-source (адаптивные изображения).
   * Пример: "/img/photo-400.webp 400w, /img/photo-800.webp 800w"
   */
  webpSrcSet?: string

  /**
   * srcSet для AVIF-source.
   * Пример: "/img/photo-400.avif 400w, /img/photo-800.avif 800w"
   */
  avifSrcSet?: string
}

// ─── Хелпер ──────────────────────────────────────────────────────────────────

/**
 * Заменяет расширение изображения на .webp.
 * Поддерживает query-строки: /img/photo.png?v=2 → /img/photo.webp?v=2
 * Возвращает null, если расширение не распознано.
 */
function deriveWebpSrc(src: string): string | null {
  const replaced = src.replace(
    /\.(png|jpe?g|gif)(\?.*)?$/i,
    (_match, _ext, query: string | undefined) => `.webp${query ?? ''}`,
  )
  // Если замены не было — возвращаем null
  return replaced !== src ? replaced : null
}

function resolveWebpSrc(src: string, webpSrc: PictureProps['webpSrc']): string | null {
  if (webpSrc === false) {
    return null
  }

  if (webpSrc !== undefined) {
    return webpSrc
  }

  return deriveWebpSrc(src)
}

// ─── Компонент ───────────────────────────────────────────────────────────────

export function Picture({
  src,
  webpSrc,
  avifSrc,
  webpSrcSet,
  avifSrcSet,
  alt = '',
  loading = 'lazy',
  decoding = 'async',
  sizes,
  ...imgProps
}: PictureProps) {
  const resolvedWebpSrc = resolveWebpSrc(src, webpSrc)

  return (
    <picture>
      {/* AVIF — наиболее сжатый формат, поддерживается Chrome 85+, Firefox 93+ */}
      {(avifSrc || avifSrcSet) && (
        <source
          srcSet={avifSrcSet ?? avifSrc}
          sizes={sizes}
          type="image/avif"
        />
      )}

      {/* WebP — широкая поддержка (Chrome 23+, Firefox 65+, Safari 14+) */}
      {(resolvedWebpSrc || webpSrcSet) && (
        <source
          srcSet={webpSrcSet ?? resolvedWebpSrc ?? undefined}
          sizes={sizes}
          type="image/webp"
        />
      )}

      {/* PNG / JPEG — фолбэк для старых браузеров */}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        {...imgProps}
      />
    </picture>
  )
}
