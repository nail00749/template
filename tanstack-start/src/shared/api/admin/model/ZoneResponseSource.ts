
/**
 * Source of the annotation: template, layout, or heuristic
 */
export type ZoneResponseSource = typeof ZoneResponseSource[keyof typeof ZoneResponseSource];


export const ZoneResponseSource = {
  per_template_override: 'per_template_override',
  layout_override: 'layout_override',
  heuristic: 'heuristic',
} as const;
