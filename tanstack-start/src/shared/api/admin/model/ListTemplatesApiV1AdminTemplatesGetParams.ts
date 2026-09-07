
export type ListTemplatesApiV1AdminTemplatesGetParams = {
/**
 * Number of items to skip (must be ≥ 0)
 * @minimum 0
 */
offset?: number;
/**
 * Page size (1..500)
 * @minimum 1
 * @maximum 500
 */
limit?: number;
};
