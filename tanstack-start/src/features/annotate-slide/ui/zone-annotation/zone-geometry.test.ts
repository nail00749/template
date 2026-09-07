import { describe, expect, it } from 'vitest'
import { getContainedBox, normalizeRect } from './zone-geometry'

describe('normalizeRect', () => {
  it('делит EMU rect на EMU slide_size в доли 0..1', () => {
    const r = normalizeRect({ left: 100, top: 200, w: 400, h: 300 }, { w: 1000, h: 1000 })
    expect(r).toEqual({ left: 0.1, top: 0.2, w: 0.4, h: 0.3 })
  })

  it('возвращает null без rect', () => {
    expect(normalizeRect(null, { w: 1000, h: 1000 })).toBeNull()
  })

  it('возвращает null без slide_size', () => {
    expect(normalizeRect({ left: 0, top: 0, w: 1, h: 1 }, null)).toBeNull()
  })

  it('возвращает null при нулевом slide_size (защита от деления на 0)', () => {
    expect(normalizeRect({ left: 0, top: 0, w: 1, h: 1 }, { w: 0, h: 100 })).toBeNull()
  })

  it('подставляет 0 для отсутствующих полей rect', () => {
    expect(normalizeRect({ w: 500 }, { w: 1000, h: 1000 })).toEqual({
      left: 0,
      top: 0,
      w: 0.5,
      h: 0,
    })
  })
})

describe('getContainedBox', () => {
  it('картинка шире контейнера — letterbox сверху/снизу', () => {
    const box = getContainedBox(2, 1)
    expect(box).toEqual({ offsetX: 0, offsetY: 0.25, width: 1, height: 0.5 })
  })

  it('картинка уже контейнера — поля слева/справа', () => {
    const box = getContainedBox(1, 2)
    expect(box).toEqual({ offsetX: 0.25, offsetY: 0, width: 0.5, height: 1 })
  })

  it('равные пропорции — без полей', () => {
    expect(getContainedBox(1.5, 1.5)).toEqual({
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1,
    })
  })
})
