import type { SlideSize, ZoneRect } from '@/shared/api/admin'

export interface NormalizedRect {
  left: number
  top: number
  w: number
  h: number
}

export interface ContainedBox {
  offsetX: number
  offsetY: number
  width: number
  height: number
}

export function normalizeRect(
  rect?: ZoneRect | null,
  slideSize?: SlideSize | null,
): NormalizedRect | null {
  if (!rect || !slideSize) {
    return null
  }
  const sw = slideSize.w ?? 0
  const sh = slideSize.h ?? 0
  if (sw <= 0 || sh <= 0) {
    return null
  }
  return {
    left: (rect.left ?? 0) / sw,
    top: (rect.top ?? 0) / sh,
    w: (rect.w ?? 0) / sw,
    h: (rect.h ?? 0) / sh,
  }
}

export function getContainedBox(slideAspect: number, containerAspect: number): ContainedBox {
  if (slideAspect > containerAspect) {
    const height = containerAspect / slideAspect
    return { offsetX: 0, offsetY: (1 - height) / 2, width: 1, height }
  }
  const width = slideAspect / containerAspect
  return { offsetX: (1 - width) / 2, offsetY: 0, width, height: 1 }
}
