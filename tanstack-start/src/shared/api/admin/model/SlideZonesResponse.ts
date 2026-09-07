import type { ZoneResponse } from './ZoneResponse.ts';

/**
 * Response schema for zones grouped by slide number.
 */
export interface SlideZonesResponse {
  /** Slide number (1-indexed) */
  slide_number: number;
  /** List of zones for this slide */
  zones: ZoneResponse[];
}
