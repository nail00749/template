
/**
 * Zone bounding box in EMU (English Metric Units, 914400 per inch).
 *
 * Same coordinate space as :class:`SlideSize`, so the frontend can normalize
 * ``rect / slide_size`` into 0..1 fractions to overlay a highlight box on the
 * static slide preview. Fields default to 0 to tolerate partial catalog data.
 */
export interface ZoneRect {
  /** Left offset in EMU */
  left?: number;
  /** Top offset in EMU */
  top?: number;
  /** Width in EMU */
  w?: number;
  /** Height in EMU */
  h?: number;
}
